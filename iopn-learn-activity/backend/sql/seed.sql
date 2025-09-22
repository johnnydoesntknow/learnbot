-- IOPn Learn Platform Seed Data
-- Run this after creating the schema to populate with test data

-- Clear existing data (for re-seeding)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE quiz_attempts;
TRUNCATE TABLE user_quiz_completions;
TRUNCATE TABLE user_lesson_progress;
TRUNCATE TABLE user_points;
TRUNCATE TABLE quiz_answers;
TRUNCATE TABLE quiz_questions;
TRUNCATE TABLE quizzes;
TRUNCATE TABLE lessons;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert test users
INSERT INTO users (discord_id, username, avatar, email, created_at, last_login, is_active) VALUES
('123456789012345678', 'TestUser1', 'abc123def456', 'test1@iopn.test', NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 1 DAY, true),
('234567890123456789', 'LearnerPro', 'ghi789jkl012', 'learner@iopn.test', NOW() - INTERVAL 60 DAY, NOW(), true),
('345678901234567890', 'NewbieUser', NULL, 'newbie@iopn.test', NOW() - INTERVAL 1 DAY, NOW(), true),
('456789012345678901', 'InactiveUser', 'mno345pqr678', 'inactive@iopn.test', NOW() - INTERVAL 90 DAY, NOW() - INTERVAL 30 DAY, false),
('567890123456789012', 'TopScorer', 'stu901vwx234', 'top@iopn.test', NOW() - INTERVAL 45 DAY, NOW(), true);

-- Insert lessons
INSERT INTO lessons (lesson_id, title, description, content, content_type, duration, order_index, is_active) VALUES
('intro-to-iopn', 'Introduction to IOPn', 'Learn the fundamentals of IOPn and its vision for decentralized innovation', 'IOPn is a revolutionary ecosystem designed to foster digital innovation through decentralization. This lesson covers the core mission, vision, and fundamental concepts that drive the IOPn platform.', 'video', '5 min', 1, true),
('opn-chain-basics', 'OPN Chain Basics', 'Understanding the OPN blockchain architecture and its unique features', 'The OPN Chain is a high-performance blockchain designed specifically for the IOPn ecosystem. It features fast transaction speeds, low fees, and advanced smart contract capabilities.', 'text', '8 min', 2, true),
('transactions-on-opn', 'How Transactions Work', 'Deep dive into transaction processing, fees, and confirmation times', 'Learn how transactions are processed on the OPN chain, including validation, consensus mechanisms, and finality. Understand gas fees and optimization strategies.', 'interactive', '10 min', 3, true),
('iopn-tokenomics', 'IOPn Tokenomics', 'Understanding OPN token utility, distribution, and economic model', 'Explore the economic design of the OPN token, including supply mechanisms, utility functions, and governance rights within the ecosystem.', 'video', '12 min', 4, true),
('defi-on-iopn', 'DeFi Applications on IOPn', 'Exploring decentralized finance opportunities in the IOPn ecosystem', 'Discover the DeFi landscape on IOPn, including lending protocols, DEXs, yield farming, and liquidity provision opportunities.', 'interactive', '15 min', 5, true),
('smart-contracts-intro', 'Introduction to Smart Contracts', 'Learn the basics of smart contract development on OPN Chain', 'Understanding smart contracts, their deployment, and interaction patterns on the OPN Chain.', 'video', '20 min', 6, true);

-- Get lesson IDs for foreign key references
SET @lesson1_id = (SELECT id FROM lessons WHERE lesson_id = 'intro-to-iopn');
SET @lesson2_id = (SELECT id FROM lessons WHERE lesson_id = 'opn-chain-basics');
SET @lesson3_id = (SELECT id FROM lessons WHERE lesson_id = 'transactions-on-opn');
SET @lesson4_id = (SELECT id FROM lessons WHERE lesson_id = 'iopn-tokenomics');
SET @lesson5_id = (SELECT id FROM lessons WHERE lesson_id = 'defi-on-iopn');

-- Insert quizzes
INSERT INTO quizzes (lesson_id, title, description, passing_score, max_attempts, time_limit, is_active) VALUES
(@lesson1_id, 'Introduction to IOPn Quiz', 'Test your understanding of IOPn fundamentals', 70, 3, NULL, true),
(@lesson2_id, 'OPN Chain Basics Quiz', 'Test your knowledge of OPN Chain architecture', 70, 3, 10, true),
(@lesson3_id, 'Transaction Processing Quiz', 'Test your understanding of OPN transaction mechanics', 80, 2, 15, true),
(@lesson4_id, 'Tokenomics Quiz', 'Test your knowledge of OPN token economics', 70, 3, 12, true),
(@lesson5_id, 'DeFi Applications Quiz', 'Test your understanding of DeFi on IOPn', 75, 3, 20, true);

-- Get quiz IDs
SET @quiz1_id = (SELECT id FROM quizzes WHERE lesson_id = @lesson1_id);
SET @quiz2_id = (SELECT id FROM quizzes WHERE lesson_id = @lesson2_id);
SET @quiz3_id = (SELECT id FROM quizzes WHERE lesson_id = @lesson3_id);

-- Insert quiz questions and answers for Quiz 1 (Introduction to IOPn)
INSERT INTO quiz_questions (quiz_id, question_id, question_text, question_type, order_index, points, explanation) VALUES
(@quiz1_id, 'q1', 'What is the primary mission of IOPn?', 'multiple_choice', 1, 10, 'IOPn''s mission is to create a decentralized ecosystem that fosters digital innovation.'),
(@quiz1_id, 'q2', 'What blockchain does IOPn operate on?', 'multiple_choice', 2, 10, 'IOPn operates on its own native blockchain called OPN Chain.'),
(@quiz1_id, 'q3', 'What is the native token of the IOPn ecosystem?', 'multiple_choice', 3, 10, 'OPN is the native utility and governance token of the IOPn ecosystem.');

-- Get question IDs for Quiz 1
SET @q1_1_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz1_id AND question_id = 'q1');
SET @q1_2_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz1_id AND question_id = 'q2');
SET @q1_3_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz1_id AND question_id = 'q3');

-- Insert answers for Quiz 1 Question 1
INSERT INTO quiz_answers (question_id, answer_id, answer_text, is_correct, order_index) VALUES
(@q1_1_id, 'a', 'To create a decentralized ecosystem for digital innovation', true, 1),
(@q1_1_id, 'b', 'To replace traditional banking systems', false, 2),
(@q1_1_id, 'c', 'To mine cryptocurrency', false, 3),
(@q1_1_id, 'd', 'To create social media platforms', false, 4);

-- Insert answers for Quiz 1 Question 2
INSERT INTO quiz_answers (question_id, answer_id, answer_text, is_correct, order_index) VALUES
(@q1_2_id, 'a', 'Ethereum', false, 1),
(@q1_2_id, 'b', 'OPN Chain', true, 2),
(@q1_2_id, 'c', 'Bitcoin', false, 3),
(@q1_2_id, 'd', 'Solana', false, 4);

-- Insert answers for Quiz 1 Question 3
INSERT INTO quiz_answers (question_id, answer_id, answer_text, is_correct, order_index) VALUES
(@q1_3_id, 'a', 'IOPn', false, 1),
(@q1_3_id, 'b', 'OPN', true, 2),
(@q1_3_id, 'c', 'REP', false, 3),
(@q1_3_id, 'd', 'PULSE', false, 4);

-- Insert quiz questions and answers for Quiz 2 (OPN Chain Basics)
INSERT INTO quiz_questions (quiz_id, question_id, question_text, question_type, order_index, points, explanation) VALUES
(@quiz2_id, 'q1', 'What consensus mechanism does OPN Chain use?', 'multiple_choice', 1, 10, 'OPN Chain uses Proof of Stake for energy efficiency and scalability.'),
(@quiz2_id, 'q2', 'What is the average block time on OPN Chain?', 'multiple_choice', 2, 10, 'OPN Chain achieves 3-second block times for fast transaction finality.'),
(@quiz2_id, 'q3', 'Which programming language is primarily used for OPN Chain smart contracts?', 'multiple_choice', 3, 10, 'OPN Chain supports Solidity for smart contract development.'),
(@quiz2_id, 'q4', 'What is the transaction throughput capacity of OPN Chain?', 'multiple_choice', 4, 10, 'OPN Chain can process up to 10,000 transactions per second.');

-- Get question IDs for Quiz 2
SET @q2_1_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz2_id AND question_id = 'q1');
SET @q2_2_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz2_id AND question_id = 'q2');
SET @q2_3_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz2_id AND question_id = 'q3');
SET @q2_4_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz2_id AND question_id = 'q4');

-- Insert answers for Quiz 2
INSERT INTO quiz_answers (question_id, answer_id, answer_text, is_correct, order_index) VALUES
-- Question 1
(@q2_1_id, 'a', 'Proof of Work', false, 1),
(@q2_1_id, 'b', 'Proof of Stake', true, 2),
(@q2_1_id, 'c', 'Proof of Authority', false, 3),
(@q2_1_id, 'd', 'Delegated Proof of Stake', false, 4),
-- Question 2
(@q2_2_id, 'a', '1 second', false, 1),
(@q2_2_id, 'b', '3 seconds', true, 2),
(@q2_2_id, 'c', '15 seconds', false, 3),
(@q2_2_id, 'd', '1 minute', false, 4),
-- Question 3
(@q2_3_id, 'a', 'Python', false, 1),
(@q2_3_id, 'b', 'Rust', false, 2),
(@q2_3_id, 'c', 'Solidity', true, 3),
(@q2_3_id, 'd', 'JavaScript', false, 4),
-- Question 4
(@q2_4_id, 'a', '100 TPS', false, 1),
(@q2_4_id, 'b', '1,000 TPS', false, 2),
(@q2_4_id, 'c', '10,000 TPS', true, 3),
(@q2_4_id, 'd', '100,000 TPS', false, 4);

-- Get user IDs
SET @user1_id = (SELECT id FROM users WHERE discord_id = '123456789012345678');
SET @user2_id = (SELECT id FROM users WHERE discord_id = '234567890123456789');
SET @user3_id = (SELECT id FROM users WHERE discord_id = '345678901234567890');
SET @user5_id = (SELECT id FROM users WHERE discord_id = '567890123456789012');

-- Insert user points
INSERT INTO user_points (user_id, rep_points, pulse_points, level, badges) VALUES
(@user1_id, 150, 75, 2, '["early_learner", "knowledge_seeker"]'),
(@user2_id, 450, 200, 6, '["early_learner", "knowledge_seeker", "quiz_master", "consistent_learner"]'),
(@user3_id, 0, 0, 1, '[]'),
(@user5_id, 1200, 550, 17, '["early_learner", "knowledge_seeker", "quiz_master", "perfect_scorer", "iopn_scholar", "beta_tester"]');

-- Insert user lesson progress
INSERT INTO user_lesson_progress (user_id, lesson_id, status, started_at, completed_at, time_spent) VALUES
-- User 1 progress
(@user1_id, @lesson1_id, 'completed', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY + INTERVAL 5 MINUTE, 300),
(@user1_id, @lesson2_id, 'completed', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY + INTERVAL 8 MINUTE, 480),
(@user1_id, @lesson3_id, 'in_progress', NOW() - INTERVAL 2 DAY, NULL, 240),
-- User 2 progress
(@user2_id, @lesson1_id, 'completed', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY + INTERVAL 5 MINUTE, 300),
(@user2_id, @lesson2_id, 'completed', NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 19 DAY + INTERVAL 7 MINUTE, 420),
(@user2_id, @lesson3_id, 'completed', NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 18 DAY + INTERVAL 10 MINUTE, 600),
(@user2_id, @lesson4_id, 'completed', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY + INTERVAL 12 MINUTE, 720),
(@user2_id, @lesson5_id, 'in_progress', NOW() - INTERVAL 1 DAY, NULL, 450),
-- User 5 (top scorer) progress
(@user5_id, @lesson1_id, 'completed', NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY + INTERVAL 4 MINUTE, 240),
(@user5_id, @lesson2_id, 'completed', NOW() - INTERVAL 29 DAY, NOW() - INTERVAL 29 DAY + INTERVAL 6 MINUTE, 360),
(@user5_id, @lesson3_id, 'completed', NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 28 DAY + INTERVAL 8 MINUTE, 480);

-- Insert quiz attempts
INSERT INTO quiz_attempts (user_id, quiz_id, lesson_id, attempt_number, answers, score, percentage, passed, started_at, completed_at, time_taken) VALUES
-- User 1 attempts
(@user1_id, @quiz1_id, @lesson1_id, 1, '{"q1": "b", "q2": "b", "q3": "a"}', 1, 33, false, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY + INTERVAL 3 MINUTE, 180),
(@user1_id, @quiz1_id, @lesson1_id, 2, '{"q1": "a", "q2": "b", "q3": "b"}', 3, 100, true, NOW() - INTERVAL 10 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 10 DAY + INTERVAL 1 HOUR + INTERVAL 2 MINUTE, 120),
(@user1_id, @quiz2_id, @lesson2_id, 1, '{"q1": "b", "q2": "b", "q3": "c", "q4": "c"}', 4, 100, true, NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY + INTERVAL 5 MINUTE, 300),
-- User 2 attempts
(@user2_id, @quiz1_id, @lesson1_id, 1, '{"q1": "a", "q2": "b", "q3": "b"}', 3, 100, true, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 20 DAY + INTERVAL 2 MINUTE, 120),
(@user2_id, @quiz2_id, @lesson2_id, 1, '{"q1": "b", "q2": "b", "q3": "c", "q4": "b"}', 3, 75, true, NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 19 DAY + INTERVAL 4 MINUTE, 240),
(@user2_id, @quiz3_id, @lesson3_id, 1, '{"q1": "b", "q2": "c", "q3": "c"}', 3, 100, true, NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 18 DAY + INTERVAL 6 MINUTE, 360),
-- User 5 attempts (perfect scores)
(@user5_id, @quiz1_id, @lesson1_id, 1, '{"q1": "a", "q2": "b", "q3": "b"}', 3, 100, true, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY + INTERVAL 90 SECOND, 90),
(@user5_id, @quiz2_id, @lesson2_id, 1, '{"q1": "b", "q2": "b", "q3": "c", "q4": "c"}', 4, 100, true, NOW() - INTERVAL 29 DAY, NOW() - INTERVAL 29 DAY + INTERVAL 3 MINUTE, 180);

-- Insert user quiz completions (best attempts only)
INSERT INTO user_quiz_completions (user_id, quiz_id, lesson_id, score, total_questions, percentage, passed, points_earned, completed_at) VALUES
(@user1_id, @quiz1_id, @lesson1_id, 3, 3, 100, true, 30, NOW() - INTERVAL 10 DAY + INTERVAL 1 HOUR + INTERVAL 2 MINUTE),
(@user1_id, @quiz2_id, @lesson2_id, 4, 4, 100, true, 30, NOW() - INTERVAL 9 DAY + INTERVAL 5 MINUTE),
(@user2_id, @quiz1_id, @lesson1_id, 3, 3, 100, true, 30, NOW() - INTERVAL 20 DAY + INTERVAL 2 MINUTE),
(@user2_id, @quiz2_id, @lesson2_id, 3, 4, 75, true, 30, NOW() - INTERVAL 19 DAY + INTERVAL 4 MINUTE),
(@user2_id, @quiz3_id, @lesson3_id, 3, 3, 100, true, 45, NOW() - INTERVAL 18 DAY + INTERVAL 6 MINUTE),
(@user5_id, @quiz1_id, @lesson1_id, 3, 3, 100, true, 50, NOW() - INTERVAL 30 DAY + INTERVAL 90 SECOND),
(@user5_id, @quiz2_id, @lesson2_id, 4, 4, 100, true, 50, NOW() - INTERVAL 29 DAY + INTERVAL 3 MINUTE);

-- Add some aggregate statistics for testing
-- This would normally be calculated dynamically, but adding for test purposes
UPDATE user_points 
SET updated_at = NOW() 
WHERE user_id IN (@user1_id, @user2_id, @user5_id);

-- Verify data insertion
SELECT 'Data insertion complete!' as status;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Lessons created:' as info, COUNT(*) as count FROM lessons;
SELECT 'Quizzes created:' as info, COUNT(*) as count FROM quizzes;
SELECT 'Questions created:' as info, COUNT(*) as count FROM quiz_questions;
SELECT 'Quiz attempts:' as info, COUNT(*) as count FROM quiz_attempts;