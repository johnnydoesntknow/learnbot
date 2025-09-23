// backend/api/server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

// Default quiz questions (built-in, no external file needed)
const quizQuestions = {
  'intro-to-iopn': {
    title: 'Introduction to IOPn',
    questions: [
      {
        id: 'q1',
        question: 'What is the primary mission of IOPn?',
        options: [
          { id: 'a', text: 'To create a decentralized ecosystem for digital innovation' },
          { id: 'b', text: 'To replace traditional banking systems' },
          { id: 'c', text: 'To mine cryptocurrency' },
          { id: 'd', text: 'To create social media platforms' }
        ],
        correct: 'a'
      },
      {
        id: 'q2',
        question: 'What blockchain does IOPn operate on?',
        options: [
          { id: 'a', text: 'Ethereum' },
          { id: 'b', text: 'OPN Chain' },
          { id: 'c', text: 'Bitcoin' },
          { id: 'd', text: 'Solana' }
        ],
        correct: 'b'
      },
      {
        id: 'q3',
        question: 'What is the native token of the IOPn ecosystem?',
        options: [
          { id: 'a', text: 'IOPn' },
          { id: 'b', text: 'OPN' },
          { id: 'c', text: 'REP' },
          { id: 'd', text: 'PULSE' }
        ],
        correct: 'b'
      }
    ]
  },
  'opn-chain-basics': {
    title: 'OPN Chain Basics',
    questions: [
      {
        id: 'q1',
        question: 'What consensus mechanism does OPN Chain use?',
        options: [
          { id: 'a', text: 'Proof of Work' },
          { id: 'b', text: 'Proof of Stake' },
          { id: 'c', text: 'Proof of Authority' },
          { id: 'd', text: 'Delegated Proof of Stake' }
        ],
        correct: 'b'
      },
      {
        id: 'q2',
        question: 'What is the average transaction speed on OPN Chain?',
        options: [
          { id: 'a', text: '1-2 seconds' },
          { id: 'b', text: '3-5 seconds' },
          { id: 'c', text: '10-15 seconds' },
          { id: 'd', text: '30+ seconds' }
        ],
        correct: 'b'
      },
      {
        id: 'q3',
        question: 'What makes OPN Chain unique?',
        options: [
          { id: 'a', text: 'It uses Bitcoin\'s codebase' },
          { id: 'b', text: 'It\'s optimized for the IOPn ecosystem with high speed and low fees' },
          { id: 'c', text: 'It only supports NFTs' },
          { id: 'd', text: 'It requires special hardware to use' }
        ],
        correct: 'b'
      }
    ]
  },
  'transactions-on-opn': {
    title: 'How Transactions Work',
    questions: [
      {
        id: 'q1',
        question: 'What determines gas fees on OPN Chain?',
        options: [
          { id: 'a', text: 'Only the amount being sent' },
          { id: 'b', text: 'Network congestion and transaction complexity' },
          { id: 'c', text: 'The sender\'s account age' },
          { id: 'd', text: 'Random selection by validators' }
        ],
        correct: 'b'
      },
      {
        id: 'q2',
        question: 'How many confirmations are typically needed for finality?',
        options: [
          { id: 'a', text: '1 confirmation' },
          { id: 'b', text: '3 confirmations' },
          { id: 'c', text: '6 confirmations' },
          { id: 'd', text: '12 confirmations' }
        ],
        correct: 'c'
      },
      {
        id: 'q3',
        question: 'What happens to failed transactions on OPN Chain?',
        options: [
          { id: 'a', text: 'They are automatically retried' },
          { id: 'b', text: 'Gas fees are fully refunded' },
          { id: 'c', text: 'Transaction is reverted but gas fees are consumed' },
          { id: 'd', text: 'They remain pending indefinitely' }
        ],
        correct: 'c'
      }
    ]
  }
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    /https:\/\/.*\.trycloudflare\.com$/,  // Allow all cloudflare tunnels
    'https://discord.com',
    'https://canary.discord.com',
    'https://ptb.discord.com'
  ],
  credentials: true
}));

app.use(express.json());

// Mock user database
const users = new Map();

// Verify token endpoint - THIS IS CRITICAL
app.post('/api/verify-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Create/get user
    let user = users.get(decoded.userId);
    if (!user) {
      user = {
        userId: decoded.userId,
        username: decoded.username,
        avatar: decoded.avatar,
        repPoints: 0,
        completedLessons: []
      };
      users.set(decoded.userId, user);
    }
    
    console.log('✅ User verified:', user.username);
    res.json(user);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    config: {
      passingScore: REP_CONFIG.PASSING_SCORE,
      maxAttempts: REP_CONFIG.MAX_ATTEMPTS
    }
  });
});

// Get configuration endpoint (for frontend to know current settings)
app.get('/api/config', (req, res) => {
  res.json({
    passingScore: REP_CONFIG.PASSING_SCORE,
    maxAttempts: REP_CONFIG.MAX_ATTEMPTS,
    repPoints: {
      pass: REP_CONFIG.PASS_POINTS,
      fail: REP_CONFIG.FAIL_POINTS,
      perfect: REP_CONFIG.PERFECT_SCORE_POINTS
    }
  });
});

// Get lessons
app.get('/api/lessons', (req, res) => {
  const lessons = [
    {
      id: 'intro-to-iopn',
      title: 'Introduction to IOPn',
      description: 'Learn the fundamentals of IOPn and its vision',
      contentType: 'video',
      duration: '5:30',
      repReward: REP_CONFIG.PASS_POINTS
    },
    {
      id: 'opn-chain-basics',
      title: 'OPN Chain Basics',
      description: 'Understanding the OPN blockchain architecture',
      contentType: 'text',
      estimatedReadTime: '8 min',
      repReward: REP_CONFIG.PASS_POINTS
    },
    {
      id: 'transactions-on-opn',
      title: 'How Transactions Work',
      description: 'Deep dive into transaction processing',
      contentType: 'interactive',
      estimatedTime: '10 min',
      repReward: REP_CONFIG.PASS_POINTS
    }
  ];
  
  res.json(lessons);
});

// Get quiz questions
app.get('/api/quiz/:lessonId', (req, res) => {
  const { lessonId } = req.params;
  
  // Get questions from our built-in configuration
  const lessonQuiz = quizQuestions[lessonId];
  
  if (!lessonQuiz) {
    console.error(`Quiz not found for lesson: ${lessonId}`);
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  // Remove correct answers before sending to frontend
  const questions = lessonQuiz.questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));
  
  res.json({
    questions,
    attemptNumber: 1,
    lessonTitle: lessonQuiz.title,
    passingScore: REP_CONFIG.PASSING_SCORE,
    maxAttempts: REP_CONFIG.MAX_ATTEMPTS,
    repReward: REP_CONFIG.PASS_POINTS
  });
});

app.post('/api/verify-mobile', (req, res) => {
  const { userId, username } = req.body;
  
  if (userId && username) {
    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
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

// Submit quiz
app.post('/api/quiz/submit', (req, res) => {
  const { answers, lessonId } = req.body;
  
  // Get correct answers from configuration
  const lessonQuiz = quizQuestions[lessonId];
  
  if (!lessonQuiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
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
  
  // Determine points based on score
  let points = 0;
  if (percentage === 100) {
    // Perfect score bonus
    points = REP_CONFIG.PERFECT_SCORE_POINTS;
  } else if (passed) {
    // Regular pass
    points = REP_CONFIG.PASS_POINTS;
  } else {
    // Failed - NO POINTS (as requested)
    points = 0;
  }
  
  console.log(`📊 Quiz submitted - Lesson: ${lessonId}, Score: ${percentage}%, Passed: ${passed}, REP Points: ${points}`);
  
  res.json({
    score: correct,
    totalQuestions: total,
    percentage,
    passed,
    points,
    passingScore: REP_CONFIG.PASSING_SCORE,
    message: percentage === 100 
      ? `Perfect score! You earned ${points} REP points!`
      : passed 
      ? `Great job! You earned ${points} REP points!`
      : `You need ${REP_CONFIG.PASSING_SCORE}% to pass. No REP points awarded for failing.`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`🏆 REP Points Configuration:`);
  console.log(`   - Pass: ${REP_CONFIG.PASS_POINTS} points`);
  console.log(`   - Perfect Score: ${REP_CONFIG.PERFECT_SCORE_POINTS} points`);
  console.log(`   - Fail: ${REP_CONFIG.FAIL_POINTS} points (no reward)`);
  console.log(`   - Passing Score: ${REP_CONFIG.PASSING_SCORE}%`);
  console.log(`   - Max Attempts: ${REP_CONFIG.MAX_ATTEMPTS}`);
});