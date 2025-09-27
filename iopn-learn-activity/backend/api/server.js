// backend/api/server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 📅 IMPORT WEEKLY CONTENT
const weeklyContent = require('../data/weeklyContent');

// 🗄️ IMPORT DATABASE MODELS
const { db, UserModel, LessonModel, QuizModel } = require('../config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// REP Points Configuration from ENV
const REP_CONFIG = {
  PASS_POINTS: parseInt(process.env.REP_POINTS_PASS) || 30,
  FAIL_POINTS: parseInt(process.env.REP_POINTS_FAIL) || 0,
  PERFECT_SCORE_POINTS: parseInt(process.env.REP_POINTS_PERFECT_SCORE) || 50,
  PASSING_SCORE: parseInt(process.env.PASSING_SCORE) || 70,
  MAX_ATTEMPTS: parseInt(process.env.MAX_QUIZ_ATTEMPTS) || 3
};

// Auto-sync content to database on server start
const { syncContentToDatabase } = require('../scripts/sync-content-to-db');

(async () => {
  try {
    await syncContentToDatabase();
    console.log('📊 Database synced with weekly content');
  } catch (error) {
    console.error('Failed to sync content:', error);
  }
})();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    /https:\/\/.*\.trycloudflare\.com$/,
    'https://discord.com',
    'https://canary.discord.com',
    'https://ptb.discord.com'
  ],
  credentials: true
}));

app.use(express.json());

// Test database connection on startup
(async () => {
  const connected = await db.testConnection();
  if (!connected) {
    console.error('⚠️  Database connection failed - data will not persist!');
  }
})();

// Verify token endpoint - USES DATABASE
app.post('/api/verify-token', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find or create user in DATABASE
    const user = await UserModel.findOrCreate({
      discord_id: decoded.userId,
      username: decoded.username,
      avatar: decoded.avatar,
      email: null
    });
    
    // Get user with points from DATABASE
    const userWithPoints = await UserModel.getUserWithPoints(user.id);
    
    console.log('✅ User verified from DB:', userWithPoints.username, '| REP:', userWithPoints.rep_points || 0);
    
    res.json({
      userId: decoded.userId,
      username: userWithPoints.username,
      avatar: userWithPoints.avatar,
      repPoints: userWithPoints.rep_points || 0,
      pulsePoints: userWithPoints.pulse_points || 0,
      level: userWithPoints.level || 1,
      dbId: userWithPoints.id // Keep internal DB ID for later use
    });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Health check with week info
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    weekNumber: weeklyContent.weekNumber,
    weekTheme: weeklyContent.weekTheme,
    lastContentUpdate: weeklyContent.lastUpdated,
    database: 'MySQL Connected',
    config: {
      passingScore: REP_CONFIG.PASSING_SCORE,
      maxAttempts: REP_CONFIG.MAX_ATTEMPTS
    }
  });
});

// Get configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    passingScore: REP_CONFIG.PASSING_SCORE,
    maxAttempts: REP_CONFIG.MAX_ATTEMPTS,
    weekNumber: weeklyContent.weekNumber,
    weekTheme: weeklyContent.weekTheme,
    repPoints: {
      pass: REP_CONFIG.PASS_POINTS,
      fail: REP_CONFIG.FAIL_POINTS,
      perfect: REP_CONFIG.PERFECT_SCORE_POINTS
    }
  });
});

// Get lessons - FROM WEEKLY CONTENT + DATABASE STATUS
app.get('/api/lessons', async (req, res) => {
  try {
    // Get lessons from weekly content
    const lessons = weeklyContent.lessons.map(lesson => ({
      ...lesson,
      repReward: REP_CONFIG.PASS_POINTS,
      weekNumber: weeklyContent.weekNumber
    }));
    
    // If user token provided, get their progress from database
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from database
        const user = await db.query(
          'SELECT id FROM users WHERE discord_id = ?',
          [decoded.userId]
        );
        
        if (user.length > 0) {
          // Get user's progress for all lessons
          const progress = await db.query(
            'SELECT lesson_id, status FROM user_lesson_progress WHERE user_id = ?',
            [user[0].id]
          );
          
          // Map progress to lessons
          lessons.forEach(lesson => {
            const userProgress = progress.find(p => p.lesson_id === lesson.id);
            if (userProgress) {
              lesson.userStatus = userProgress.status;
            }
          });
        }
      } catch (error) {
        console.log('Could not get user progress:', error.message);
      }
    }
    
    console.log(`📚 Serving ${lessons.length} lessons for Week ${weeklyContent.weekNumber}`);
    res.json(lessons);
  } catch (error) {
    console.error('Error getting lessons:', error);
    res.status(500).json({ error: 'Failed to get lessons' });
  }
});



app.get('/api/user/progress', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ 
        completedQuizzes: [], 
        failedQuizzes: [], 
        attemptCounts: {},
        repPoints: 0,
        level: 1
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user
    const users = await db.query(
      'SELECT id FROM users WHERE discord_id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.json({ 
        completedQuizzes: [], 
        failedQuizzes: [], 
        attemptCounts: {},
        repPoints: 0,
        level: 1
      });
    }
    
    const userId = users[0].id;
    
    // Get completed quizzes (passed)
    const completed = await db.query(
      `SELECT DISTINCT l.lesson_id 
       FROM user_quiz_completions qc
       JOIN lessons l ON qc.lesson_id = l.id
       WHERE qc.user_id = ? AND qc.passed = true`,
      [userId]
    );
    
    // Get quiz attempt counts for each lesson
    const attempts = await db.query(
      `SELECT l.lesson_id, COUNT(*) as count
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN lessons l ON q.lesson_id = l.id
       WHERE qa.user_id = ?
       GROUP BY l.lesson_id`,
      [userId]
    );
    
    // Build attempt counts object
    const attemptCounts = {};
    attempts.forEach(a => {
      attemptCounts[a.lesson_id] = a.count;
    });
    
    // Get failed quizzes (3 attempts used, not passed)
    const failed = [];
    Object.entries(attemptCounts).forEach(([lessonId, count]) => {
      if (count >= 3 && !completed.find(c => c.lesson_id === lessonId)) {
        failed.push(lessonId);
      }
    });
    
    // Get user points
    const points = await db.query(
      'SELECT rep_points, level FROM user_points WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      completedQuizzes: completed.map(c => c.lesson_id),
      failedQuizzes: failed,
      attemptCounts,
      repPoints: points[0]?.rep_points || 0,
      level: points[0]?.level || 1
    });
    
  } catch (error) {
    console.error('Failed to get user progress:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Get lesson content details
app.get('/api/lesson/:lessonId/content', (req, res) => {
  const { lessonId } = req.params;
  
  const lesson = weeklyContent.lessons.find(l => l.id === lessonId);
  
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  
  res.json({
    title: lesson.title,
    contentType: lesson.contentType,
    mediaPath: lesson.mediaPath,
    duration: lesson.duration
  });
});

// Get quiz questions
app.get('/api/quiz/:lessonId', async (req, res) => {
  const { lessonId } = req.params;
  
  // Get quiz from weekly content
  const lessonQuiz = weeklyContent.quizzes[lessonId];
  
  if (!lessonQuiz) {
    console.error(`Quiz not found for lesson: ${lessonId}`);
    return res.status(404).json({ error: 'Quiz not found for this week' });
  }
  
  // Get user's attempts from database if authenticated
  let attemptNumber = 1;
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const user = await db.query(
        'SELECT id FROM users WHERE discord_id = ?',
        [decoded.userId]
      );
      
      if (user.length > 0) {
        // First get the quiz_id for this lesson
        const quiz = await db.query(
          'SELECT q.id FROM quizzes q JOIN lessons l ON q.lesson_id = l.id WHERE l.lesson_id = ?',
          [lessonId]
        );
        
        if (quiz.length > 0) {
          const attempts = await db.query(
            'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?',
            [user[0].id, quiz[0].id]
          );
          attemptNumber = (attempts[0]?.count || 0) + 1;
        }
      }
    } catch (error) {
      console.log('Could not get attempt count:', error.message);
    }
  }
  
  // Remove correct answers before sending to frontend
  const questions = lessonQuiz.questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));
  
  res.json({
    questions,
    attemptNumber,
    lessonTitle: lessonQuiz.title,
    weekNumber: weeklyContent.weekNumber,
    passingScore: REP_CONFIG.PASSING_SCORE,
    maxAttempts: REP_CONFIG.MAX_ATTEMPTS,
    repReward: REP_CONFIG.PASS_POINTS
  });
});

// Submit quiz - SAVES TO DATABASE
app.post('/api/quiz/submit', async (req, res) => {
  const { answers, lessonId } = req.body;
  
  try {
    // Get user from authorization header or request body token
    const authHeader = req.headers.authorization;
    let decoded;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } else if (req.body.token) {
      decoded = jwt.verify(req.body.token, process.env.JWT_SECRET || 'your-secret-key');
    } else {
      return res.status(401).json({ error: 'No authentication provided' });
    }
    
    // Get user from database
    const users = await db.query(
      'SELECT id, discord_id, username FROM users WHERE discord_id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    
    const user = users[0];
    
    // Get quiz from weekly content
    const lessonQuiz = weeklyContent.quizzes[lessonId];
    
    if (!lessonQuiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Calculate score
    const correctAnswers = {};
    lessonQuiz.questions.forEach(q => {
      correctAnswers[q.id] = q.correct;
    });
    
    let correct = 0;
    const total = Object.keys(correctAnswers).length;
    
    Object.keys(answers).forEach(questionId => {
      if (answers[questionId] === correctAnswers[questionId]) {
        correct++;
      }
    });
    
    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= REP_CONFIG.PASSING_SCORE;
    
    // Determine points
    let points = 0;
    if (percentage === 100) {
      points = REP_CONFIG.PERFECT_SCORE_POINTS;
    } else if (passed) {
      points = REP_CONFIG.PASS_POINTS;
    } else {
      points = REP_CONFIG.FAIL_POINTS;
    }
    
    // Get the database lesson ID first (convert string to integer ID)
    const lessons = await db.query(
      'SELECT id FROM lessons WHERE lesson_id = ?',
      [lessonId]
    );

    if (lessons.length === 0) {
      console.error(`Lesson not found in database: ${lessonId}`);
      return res.status(404).json({ error: 'Lesson not found in database' });
    }

    const dbLessonId = lessons[0].id;

    // Get quiz ID for this lesson - FIXED SCOPING ISSUE
    const quizzes = await db.query(
      'SELECT id FROM quizzes WHERE lesson_id = ?',
      [dbLessonId]
    );

    let dbQuizId; // Declare variable OUTSIDE the if block

    if (quizzes.length === 0) {
      console.error(`No quiz found in database for lesson_id ${dbLessonId} (${lessonId})`);
      return res.status(404).json({ error: 'Quiz not found for this lesson' });
    }
    
    dbQuizId = quizzes[0].id; // Assign value without var/let/const

    console.log(`📝 Processing: Lesson ${lessonId} (DB ID: ${dbLessonId}), Quiz ID: ${dbQuizId}`);

    // Get attempt number using the CORRECT quiz_id for THIS lesson
    const attempts = await db.query(
      'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?',
      [user.id, dbQuizId]
    );
    const attemptNumber = (attempts[0]?.count || 0) + 1;

    console.log(`🎯 User ${user.username} - Attempt #${attemptNumber} for Quiz ${dbQuizId}`);

    // Check if exceeded max attempts
    if (attemptNumber > REP_CONFIG.MAX_ATTEMPTS) {
      return res.status(400).json({ 
        error: 'Maximum attempts exceeded',
        maxAttempts: REP_CONFIG.MAX_ATTEMPTS 
      });
    }

    // Save quiz attempt with INTEGER IDs
    await db.query(
      `INSERT INTO quiz_attempts 
       (user_id, quiz_id, lesson_id, attempt_number, answers, score, percentage, passed, completed_at, time_taken)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [user.id, dbQuizId, dbLessonId, attemptNumber, JSON.stringify(answers), 
       correct, percentage, passed, 0]
    );
    
    // Update user points if passed
    if (passed && points > 0) {
      await UserModel.updatePoints(user.id, points, 10);
      
      // Update lesson progress with INTEGER ID
      await db.query(
        `INSERT INTO user_lesson_progress (user_id, lesson_id, status, completed_at)
         VALUES (?, ?, 'completed', NOW())
         ON DUPLICATE KEY UPDATE status = 'completed', completed_at = NOW()`,
        [user.id, dbLessonId]
      );
      
      // Save to quiz completions table with INTEGER IDs
      await db.query(
        `INSERT INTO user_quiz_completions 
         (user_id, quiz_id, lesson_id, score, total_questions, percentage, passed, points_earned)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         score = IF(VALUES(percentage) > percentage, VALUES(score), score),
         percentage = IF(VALUES(percentage) > percentage, VALUES(percentage), percentage),
         points_earned = IF(VALUES(percentage) > percentage, VALUES(points_earned), points_earned)`,
        [user.id, dbQuizId, dbLessonId, correct, total, percentage, passed, points]
      );
    }
    
    console.log(`📊 Saved - User: ${user.username}, Lesson: ${lessonId}, Quiz: ${dbQuizId}, Attempt: ${attemptNumber}, Score: ${percentage}%, REP: ${points}`);
    
    res.json({
      score: correct,
      totalQuestions: total,
      percentage,
      passed,
      points,
      attemptNumber,
      weekNumber: weeklyContent.weekNumber,
      passingScore: REP_CONFIG.PASSING_SCORE,
      message: percentage === 100 
        ? `Perfect score! You earned ${points} REP points!`
        : passed 
        ? `Great job! You earned ${points} REP points!`
        : `You need ${REP_CONFIG.PASSING_SCORE}% to pass. No REP points awarded.`
    });
    
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get user statistics from database
app.get('/api/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const users = await db.query(
      `SELECT u.*, up.rep_points, up.pulse_points, up.level
       FROM users u
       LEFT JOIN user_points up ON u.id = up.user_id
       WHERE u.discord_id = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // Get quiz attempts
    const attempts = await db.query(
      `SELECT * FROM quiz_attempts 
       WHERE user_id = ? 
       ORDER BY completed_at DESC`,
      [user.id]
    );
    
    // Get completed lessons
    const progress = await db.query(
      `SELECT * FROM user_lesson_progress 
       WHERE user_id = ?`,
      [user.id]
    );
    
    res.json({
      user: {
        username: user.username,
        avatar: user.avatar,
        repPoints: user.rep_points || 0,
        pulsePoints: user.pulse_points || 0,
        level: user.level || 1
      },
      attempts: attempts.length,
      completedLessons: progress.filter(p => p.status === 'completed').length,
      totalLessons: weeklyContent.lessons.length
    });
  } catch (error) {
    console.error('Failed to get user stats:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get leaderboard from database
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await db.query(
      `SELECT u.username, u.avatar, up.rep_points, up.level 
       FROM users u 
       LEFT JOIN user_points up ON u.id = up.user_id 
       ORDER BY up.rep_points DESC 
       LIMIT 10`
    );
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Mobile verification endpoint
app.post('/api/verify-mobile', async (req, res) => {
  const { userId, username } = req.body;
  
  if (userId && username) {
    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Create user in database if mobile
    try {
      await UserModel.findOrCreate({
        discord_id: userId,
        username: username,
        avatar: null,
        email: null
      });
    } catch (error) {
      console.log('Could not create mobile user:', error);
    }
    
    res.json({
      userId,
      username,
      token,
      avatar: null
    });
  } else {
    res.status(400).json({ error: 'Missing user data' });
  }
});

// Get current week info
app.get('/api/week', (req, res) => {
  res.json({
    weekNumber: weeklyContent.weekNumber,
    weekTheme: weeklyContent.weekTheme,
    lastUpdated: weeklyContent.lastUpdated,
    totalLessons: weeklyContent.lessons.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🗄️  MySQL Database: ${process.env.DB_NAME || 'iopn_learn'}`);
  console.log(`📅 Week ${weeklyContent.weekNumber}: ${weeklyContent.weekTheme}`);
  console.log(`📝 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`🏆 REP Points Configuration:`);
  console.log(`   - Pass: ${REP_CONFIG.PASS_POINTS} points`);
  console.log(`   - Perfect: ${REP_CONFIG.PERFECT_SCORE_POINTS} points`);
  console.log(`   - Fail: ${REP_CONFIG.FAIL_POINTS} points`);
  console.log(`   - Passing Score: ${REP_CONFIG.PASSING_SCORE}%`);
  console.log(`   - Max Attempts: ${REP_CONFIG.MAX_ATTEMPTS}`);
  console.log(`📚 Loaded ${weeklyContent.lessons.length} lessons`);
  console.log(`❓ Loaded ${Object.keys(weeklyContent.quizzes).length} quizzes`);
});