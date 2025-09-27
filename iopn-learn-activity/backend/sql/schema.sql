-- IOPn Learn Platform Database Schema for MySQL
-- Simplified version without stored procedures

-- Drop existing tables if they exist (for testing)
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS user_quiz_completions;
DROP TABLE IF EXISTS user_lesson_progress;
DROP TABLE IF EXISTS user_points;
DROP TABLE IF EXISTS quiz_answers;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS users;

-- Drop views if they exist
DROP VIEW IF EXISTS user_statistics;
DROP VIEW IF EXISTS lesson_statistics;

-- Users table (Discord integration)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discord_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    INDEX idx_discord_id (discord_id)
);

-- Lessons table
CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    content_type VARCHAR(50) DEFAULT 'text',
    duration VARCHAR(50),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_order (order_index)
);

-- Quizzes table
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INT DEFAULT 70,
    max_attempts INT DEFAULT 3,
    time_limit INT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson_quiz (lesson_id)
);

-- Quiz questions table
CREATE TABLE quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice',
    order_index INT DEFAULT 0,
    points INT DEFAULT 10,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quiz_question (quiz_id, question_id),
    INDEX idx_quiz_questions (quiz_id),
    INDEX idx_question_order (quiz_id, order_index)
);

-- Quiz answers/options table
CREATE TABLE quiz_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_id VARCHAR(10) NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_question_answer (question_id, answer_id),
    INDEX idx_question_answers (question_id)
);

-- User points table
CREATE TABLE user_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rep_points INT DEFAULT 0,
    pulse_points INT DEFAULT 0,
    total_points INT GENERATED ALWAYS AS (rep_points + pulse_points) STORED,
    level INT DEFAULT 1,
    badges JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_points (user_id),
    INDEX idx_user_level (level),
    INDEX idx_total_points (total_points)
);

-- User lesson progress table
CREATE TABLE user_lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'not_started',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    time_spent INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_user_progress (user_id),
    INDEX idx_lesson_progress (lesson_id),
    INDEX idx_status (status)
);

-- User quiz completions table
CREATE TABLE user_quiz_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    lesson_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage INT NOT NULL,
    passed BOOLEAN DEFAULT false,
    points_earned INT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_user_completions (user_id),
    INDEX idx_quiz_completions (quiz_id),
    INDEX idx_completion_date (completed_at)
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    lesson_id INT NOT NULL,
    attempt_number INT NOT NULL,
    answers JSON NOT NULL,
    score INT,
    percentage INT,
    passed BOOLEAN DEFAULT false,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    time_taken INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attempt (user_id, quiz_id, attempt_number),
    INDEX idx_user_attempts (user_id),
    INDEX idx_quiz_attempts (quiz_id),
    INDEX idx_attempt_date (started_at)
);

-- Create views for common queries (MySQL compatible)
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.discord_id,
    u.username,
    COALESCE(up.rep_points, 0) as rep_points,
    COALESCE(up.pulse_points, 0) as pulse_points,
    COALESCE(up.total_points, 0) as total_points,
    COALESCE(up.level, 1) as level,
    COUNT(DISTINCT CASE WHEN ulp.status = 'completed' THEN ulp.lesson_id END) as lessons_completed,
    COUNT(DISTINCT CASE WHEN uqc.passed = true THEN uqc.quiz_id END) as quizzes_passed,
    COUNT(DISTINCT qa.id) as total_attempts
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id
LEFT JOIN user_lesson_progress ulp ON u.id = ulp.user_id
LEFT JOIN user_quiz_completions uqc ON u.id = uqc.user_id
LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
GROUP BY u.id, u.discord_id, u.username, up.rep_points, up.pulse_points, up.total_points, up.level;

CREATE VIEW lesson_statistics AS
SELECT 
    l.id,
    l.lesson_id,
    l.title,
    COUNT(DISTINCT CASE WHEN ulp.status = 'completed' THEN ulp.user_id END) as completions,
    COUNT(DISTINCT CASE WHEN ulp.status = 'in_progress' THEN ulp.user_id END) as in_progress,
    AVG(ulp.time_spent) as avg_time_spent,
    COUNT(DISTINCT q.id) as quiz_count
FROM lessons l
LEFT JOIN user_lesson_progress ulp ON l.id = ulp.lesson_id
LEFT JOIN quizzes q ON l.id = q.lesson_id
GROUP BY l.id, l.lesson_id, l.title;