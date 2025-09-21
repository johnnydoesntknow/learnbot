// backend/api/server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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
  console.log(`📝 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
});