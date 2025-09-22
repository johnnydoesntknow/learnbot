// backend/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iopn_learn',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  test: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 3306,
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'iopn_learn_test',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    ssl: {
      rejectUnauthorized: false
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
const config = dbConfig[environment];

// Create connection pool
let pool = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(config);
    console.log(`📦 Database pool created for ${environment} environment`);
  }
  return pool;
};

// Database helper functions
const db = {
  // Get a connection from the pool
  getConnection: async () => {
    return await getPool().getConnection();
  },

  // Execute a query
  query: async (sql, params = []) => {
    const connection = await getPool().getConnection();
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } finally {
      connection.release();
    }
  },

  // Execute a transaction
  transaction: async (callback) => {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Test database connection
  testConnection: async () => {
    try {
      const connection = await getPool().getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  },

  // Close all connections
  closePool: async () => {
    if (pool) {
      await pool.end();
      console.log('📦 Database pool closed');
      pool = null;
    }
  }
};

// User model functions
const UserModel = {
  // Find or create user from Discord auth
  findOrCreate: async (discordData) => {
    const { discord_id, username, avatar, email } = discordData;
    
    // Handle undefined/null values
    const avatarValue = avatar || null;
    const emailValue = email || null;
    
    return await db.transaction(async (connection) => {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT * FROM users WHERE discord_id = ?',
        [discord_id]
      );

      if (existing.length > 0) {
        // Update last login (handle null avatar properly)
        await connection.execute(
          'UPDATE users SET last_login = NOW(), avatar = ?, username = ? WHERE discord_id = ?',
          [avatarValue, username, discord_id]  // Use avatarValue instead of avatar
        );
        return existing[0];
      }

      // Create new user (handle nulls properly)
      const [result] = await connection.execute(
        'INSERT INTO users (discord_id, username, avatar, email) VALUES (?, ?, ?, ?)',
        [discord_id, username, avatarValue, emailValue]  // Use the null-safe values
      );

      // Initialize user points
      await connection.execute(
        'INSERT INTO user_points (user_id, rep_points, pulse_points, level) VALUES (?, 0, 0, 1)',
        [result.insertId]
      );

      // Return the new user
      const [newUser] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );

      return newUser[0];
    });
  },

  
  // Get user with points
  getUserWithPoints: async (userId) => {
    const [users] = await db.query(
      `SELECT u.*, 
              COALESCE(up.rep_points, 0) as rep_points,
              COALESCE(up.pulse_points, 0) as pulse_points,
              COALESCE(up.total_points, 0) as total_points,
              COALESCE(up.level, 1) as level,
              up.badges
       FROM users u
       LEFT JOIN user_points up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId]
    );
    return users[0];
  },

  // Update user points
updatePoints: async (userId, repPoints, pulsePoints) => {
  // Make sure values are not undefined
  const repValue = repPoints || 0;
  const pulseValue = pulsePoints || 0;
  
  await db.query(
    `INSERT INTO user_points (user_id, rep_points, pulse_points, level)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
     rep_points = rep_points + VALUES(rep_points),
     pulse_points = pulse_points + VALUES(pulse_points),
     level = FLOOR((rep_points + pulse_points + VALUES(rep_points) + VALUES(pulse_points)) / 100) + 1`,
    [userId, repValue, pulseValue, 1]
  );
}
};


// Lesson model functions
const LessonModel = {
  // Get all lessons
  getAllLessons: async () => {
    return await db.query(
      `SELECT l.*, 
              COUNT(DISTINCT q.id) as quiz_count
       FROM lessons l
       LEFT JOIN quizzes q ON l.id = q.lesson_id
       WHERE l.is_active = true
       GROUP BY l.id
       ORDER BY l.order_index`
    );
  },

  // Get lesson by ID with quiz
  getLessonById: async (lessonId) => {
    const [lessons] = await db.query(
      `SELECT l.*, q.id as quiz_id, q.passing_score, q.max_attempts
       FROM lessons l
       LEFT JOIN quizzes q ON l.id = q.lesson_id
       WHERE l.lesson_id = ?`,
      [lessonId]
    );
    return lessons[0];
  },

  // Get user progress for lesson
  getUserProgress: async (userId, lessonId) => {
    const [progress] = await db.query(
      `SELECT * FROM user_lesson_progress 
       WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );
    return progress[0];
  },

  // Update lesson progress
  updateProgress: async (userId, lessonId, status, timeSpent = 0) => {
    await db.query(
      `INSERT INTO user_lesson_progress (user_id, lesson_id, status, started_at, completed_at, time_spent)
       VALUES (?, ?, ?, NOW(), IF(? = 'completed', NOW(), NULL), ?)
       ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       completed_at = VALUES(completed_at),
       time_spent = time_spent + VALUES(time_spent)`,
      [userId, lessonId, status, status, timeSpent]
    );
  }
};

// Quiz model functions
const QuizModel = {
  // Get quiz with questions
  getQuizByLessonId: async (lessonId) => {
    // Get lesson and quiz info
    const [quizInfo] = await db.query(
      `SELECT q.*, l.lesson_id as lesson_key
       FROM quizzes q
       JOIN lessons l ON q.lesson_id = l.id
       WHERE l.lesson_id = ?`,
      [lessonId]
    );

    if (!quizInfo[0]) return null;

    // Get questions with answers
    const questions = await db.query(
      `SELECT qq.*, 
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', qa.answer_id,
                  'text', qa.answer_text,
                  'is_correct', qa.is_correct
                ) ORDER BY qa.order_index
              ) as options
       FROM quiz_questions qq
       JOIN quiz_answers qa ON qq.id = qa.question_id
       WHERE qq.quiz_id = ?
       GROUP BY qq.id
       ORDER BY qq.order_index`,
      [quizInfo[0].id]
    );

    return {
      ...quizInfo[0],
      questions: questions.map(q => ({
        id: q.question_id,
        question: q.question_text,
        options: JSON.parse(q.options),
        points: q.points,
        explanation: q.explanation
      }))
    };
  },

  // Get user attempts for a quiz
  getUserAttempts: async (userId, quizId) => {
    return await db.query(
      `SELECT * FROM quiz_attempts 
       WHERE user_id = ? AND quiz_id = ?
       ORDER BY attempt_number`,
      [userId, quizId]
    );
  },

  // Submit quiz attempt
  submitQuizAttempt: async (userId, quizId, lessonId, answers) => {
    return await db.transaction(async (connection) => {
      // Get attempt number
      const [attempts] = await connection.execute(
        'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?',
        [userId, quizId]
      );
      const attemptNumber = attempts[0].count + 1;

      // Get correct answers
      const [questions] = await connection.execute(
        `SELECT qq.question_id, qa.answer_id
         FROM quiz_questions qq
         JOIN quiz_answers qa ON qq.id = qa.question_id
         WHERE qq.quiz_id = ? AND qa.is_correct = true`,
        [quizId]
      );

      // Calculate score
      let correct = 0;
      const total = questions.length;
      questions.forEach(q => {
        if (answers[q.question_id] === q.answer_id) {
          correct++;
        }
      });

      const percentage = Math.round((correct / total) * 100);
      const passed = percentage >= 70;
      const pointsEarned = passed ? 30 : 10;

      // Insert attempt
      await connection.execute(
        `INSERT INTO quiz_attempts 
         (user_id, quiz_id, lesson_id, attempt_number, answers, score, percentage, passed, completed_at, time_taken)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [userId, quizId, lessonId, attemptNumber, JSON.stringify(answers), correct, percentage, passed, 0]
      );

      // Update quiz completion if passed
      if (passed) {
        await connection.execute(
          `INSERT INTO user_quiz_completions 
           (user_id, quiz_id, lesson_id, score, total_questions, percentage, passed, points_earned)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           score = IF(VALUES(percentage) > percentage, VALUES(score), score),
           percentage = IF(VALUES(percentage) > percentage, VALUES(percentage), percentage)`,
          [userId, quizId, lessonId, correct, total, percentage, passed, pointsEarned]
        );

        // Update user points
await connection.execute(
  `INSERT INTO user_points (user_id, rep_points, pulse_points, level)
   VALUES (?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE
   rep_points = rep_points + VALUES(rep_points),
   pulse_points = pulse_points + VALUES(pulse_points),
   level = FLOOR((rep_points + pulse_points + VALUES(rep_points) + VALUES(pulse_points)) / 100) + 1`,
  [userId, pointsEarned, 10, 1]
);

        // Update lesson progress
        await connection.execute(
          `UPDATE user_lesson_progress 
           SET status = 'completed', completed_at = NOW()
           WHERE user_id = ? AND lesson_id = ?`,
          [userId, lessonId]
        );
      }

      return {
        score: correct,
        totalQuestions: total,
        percentage,
        passed,
        points: pointsEarned,
        attemptNumber
      };
    });
  }
};

module.exports = {
  db,
  UserModel,
  LessonModel,
  QuizModel,
  getPool,
  environment
};