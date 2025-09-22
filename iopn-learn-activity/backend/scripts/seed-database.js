// backend/scripts/seed-database.js
const { db, UserModel, LessonModel, QuizModel } = require('../config/database');
const testData = require('../data/test-data.json');

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Test connection
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE quiz_attempts');
    await db.query('TRUNCATE TABLE user_quiz_completions');
    await db.query('TRUNCATE TABLE user_lesson_progress');
    await db.query('TRUNCATE TABLE user_points');
    await db.query('TRUNCATE TABLE quiz_answers');
    await db.query('TRUNCATE TABLE quiz_questions');
    await db.query('TRUNCATE TABLE quizzes');
    await db.query('TRUNCATE TABLE lessons');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // Insert lessons
    console.log('📚 Inserting lessons...');
    for (const lesson of testData.lessons) {
      await db.query(
        `INSERT INTO lessons (lesson_id, title, description, content, content_type, duration, order_index) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [lesson.lesson_id, lesson.title, lesson.description, lesson.content, 
         lesson.content_type, lesson.duration, lesson.order_index]
      );
    }

    // Insert quizzes with questions
    console.log('❓ Inserting quizzes and questions...');
    for (const quiz of testData.quizzes) {
      // Get lesson ID
      const [lessons] = await db.query(
        'SELECT id FROM lessons WHERE lesson_id = ?',
        [quiz.lesson_id]
      );
      
      if (lessons[0]) {
        // Insert quiz
        const [quizResult] = await db.query(
          `INSERT INTO quizzes (lesson_id, title, description, passing_score, max_attempts, time_limit) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [lessons[0].id, quiz.title, quiz.description, quiz.passing_score, 
           quiz.max_attempts, quiz.time_limit]
        );

        // Insert questions and answers
        for (const question of quiz.questions) {
          const [questionResult] = await db.query(
            `INSERT INTO quiz_questions (quiz_id, question_id, question_text, points, explanation) 
             VALUES (?, ?, ?, ?, ?)`,
            [quizResult.insertId, question.question_id, question.question_text, 
             question.points, question.explanation]
          );

          // Insert answers
          for (const answer of question.answers) {
            await db.query(
              `INSERT INTO quiz_answers (question_id, answer_id, answer_text, is_correct) 
               VALUES (?, ?, ?, ?)`,
              [questionResult.insertId, answer.answer_id, answer.answer_text, answer.is_correct]
            );
          }
        }
      }
    }

    // Insert test users
    console.log('👥 Inserting test users...');
    for (const user of testData.test_users) {
      const newUser = await UserModel.findOrCreate({
        discord_id: user.discord_id,
        username: user.username,
        avatar: user.avatar,
        email: user.email
      });

      // Set initial points
      if (user.rep_points > 0 || user.pulse_points > 0) {
        await UserModel.updatePoints(newUser.id, user.rep_points, user.pulse_points);
      }
    }

    console.log('✅ Database seeded successfully!');
    
    // Show summary
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const lessonCount = await db.query('SELECT COUNT(*) as count FROM lessons');
    const quizCount = await db.query('SELECT COUNT(*) as count FROM quizzes');
    const questionCount = await db.query('SELECT COUNT(*) as count FROM quiz_questions');
    
    console.log('\n📊 Database Summary:');
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Lessons: ${lessonCount[0].count}`);
    console.log(`   Quizzes: ${quizCount[0].count}`);
    console.log(`   Questions: ${questionCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.closePool();
  }
}

// Run seeding
seedDatabase();
