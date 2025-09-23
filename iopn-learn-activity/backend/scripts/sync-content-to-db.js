// backend/scripts/sync-content-to-db.js
const { db } = require('../config/database');
const weeklyContent = require('../data/weeklyContent');

async function syncContentToDatabase() {
  console.log('🔄 Syncing weekly content to database...');
  
  try {
    // 1. Sync lessons
    for (const lesson of weeklyContent.lessons) {
      await db.query(
        `INSERT INTO lessons (lesson_id, title, description, content, content_type, duration, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         description = VALUES(description),
         content = VALUES(content),
         content_type = VALUES(content_type),
         duration = VALUES(duration),
         order_index = VALUES(order_index),
         updated_at = NOW()`,
        [lesson.id, lesson.title, lesson.description, 
         lesson.content || '', lesson.contentType, 
         lesson.duration, lesson.orderIndex]
      );
      console.log(`✅ Synced lesson: ${lesson.id}`);
    }
    
    // 2. Sync quizzes
    for (const [lessonId, quiz] of Object.entries(weeklyContent.quizzes)) {
      // Get the database lesson ID
      const [lessons] = await db.query(
        'SELECT id FROM lessons WHERE lesson_id = ?',
        [lessonId]
      );
      
      if (lessons.length > 0) {
        const dbLessonId = lessons[0].id;
        
        // Insert/update quiz
        const [quizResult] = await db.query(
          `INSERT INTO quizzes (lesson_id, title, description, passing_score, max_attempts)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           description = VALUES(description),
           passing_score = VALUES(passing_score),
           updated_at = NOW()`,
          [dbLessonId, quiz.title, `Quiz for ${quiz.title}`, 
           quiz.passingScore || 70, 3]
        );
        
        const quizId = quizResult.insertId || (await db.query(
          'SELECT id FROM quizzes WHERE lesson_id = ?',
          [dbLessonId]
        ))[0].id;
        
        // Clear old questions
        await db.query(
          'DELETE FROM quiz_answers WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ?)',
          [quizId]
        );
        await db.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);
        
        // Insert new questions and answers
        for (let i = 0; i < quiz.questions.length; i++) {
          const question = quiz.questions[i];
          
          const [questionResult] = await db.query(
            `INSERT INTO quiz_questions 
             (quiz_id, question_id, question_text, question_type, order_index, points, explanation)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [quizId, question.id, question.question, 'multiple_choice', 
             i + 1, 10, question.explanation || null]
          );
          
          // Insert answers
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            await db.query(
              `INSERT INTO quiz_answers 
               (question_id, answer_id, answer_text, is_correct, order_index)
               VALUES (?, ?, ?, ?, ?)`,
              [questionResult.insertId, option.id, option.text, 
               option.id === question.correct, j + 1]
            );
          }
        }
        
        console.log(`✅ Synced quiz: ${lessonId}`);
      }
    }
    
    console.log('✨ Content sync complete!');
    console.log(`📚 Week ${weeklyContent.weekNumber}: ${weeklyContent.weekTheme}`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  syncContentToDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { syncContentToDatabase };