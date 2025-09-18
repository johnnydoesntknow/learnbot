// backend/api/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://discord.com',
    'https://canary.discord.com',
    'https://ptb.discord.com'
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
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
      duration: '5:30'
    },
    {
      id: 'opn-chain-basics',
      title: 'OPN Chain Basics',
      description: 'Understanding the OPN blockchain architecture',
      contentType: 'text',
      estimatedReadTime: '8 min'
    },
    {
      id: 'transactions-on-opn',
      title: 'How Transactions Work',
      description: 'Deep dive into transaction processing',
      contentType: 'interactive',
      estimatedTime: '10 min'
    }
  ];
  
  res.json(lessons);
});

// Get quiz questions
app.get('/api/quiz/:lessonId', (req, res) => {
  const { lessonId } = req.params;
  
  // Sample questions - you'll expand this
  const questions = [
    {
      id: 'q1',
      question: 'What is the primary mission of IOPn?',
      options: [
        { id: 'a', text: 'To create a decentralized ecosystem for digital innovation' },
        { id: 'b', text: 'To replace traditional banking systems' },
        { id: 'c', text: 'To mine cryptocurrency' },
        { id: 'd', text: 'To create social media platforms' }
      ]
    },
    {
      id: 'q2',
      question: 'What blockchain does IOPn operate on?',
      options: [
        { id: 'a', text: 'Ethereum' },
        { id: 'b', text: 'OPN Chain' },
        { id: 'c', text: 'Bitcoin' },
        { id: 'd', text: 'Solana' }
      ]
    },
    {
      id: 'q3',
      question: 'What is the native token of the IOPn ecosystem?',
      options: [
        { id: 'a', text: 'IOPn' },
        { id: 'b', text: 'OPN' },
        { id: 'c', text: 'REP' },
        { id: 'd', text: 'PULSE' }
      ]
    }
  ];
  
  res.json({
    questions,
    attemptNumber: 1,
    lessonTitle: 'Introduction to IOPn'
  });
});

// Submit quiz
app.post('/api/quiz/submit', (req, res) => {
  const { answers, lessonId } = req.body;
  
  // Simple scoring logic
  const correctAnswers = {
    'q1': 'a',
    'q2': 'b',
    'q3': 'b'
  };
  
  let correct = 0;
  const total = Object.keys(correctAnswers).length;
  
  Object.keys(answers).forEach(questionId => {
    if (answers[questionId] === correctAnswers[questionId]) {
      correct++;
    }
  });
  
  const percentage = Math.round((correct / total) * 100);
  const passed = percentage >= 70;
  const points = passed ? 30 : 10;
  
  res.json({
    score: correct,
    totalQuestions: total,
    percentage,
    passed,
    points
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});