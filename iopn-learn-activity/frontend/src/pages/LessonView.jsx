// frontend/src/pages/LessonView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateActivity } from '../utils/discord';

const LessonView = ({ user }) => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [contentCompleted, setContentCompleted] = useState(false);
  
  const lessonContent = {
    'intro-to-iopn': {
      title: 'Introduction to IOPn',
      type: 'video',
      content: 'Video would load here - for now, this is placeholder content about IOPn\'s vision and mission.'
    },
    'opn-chain-basics': {
      title: 'OPN Chain Basics',
      type: 'text',
      content: 'OPN Chain is a high-performance blockchain designed for the IOPn ecosystem. It features fast transaction speeds, low fees, and smart contract capabilities.'
    },
    'transactions-on-opn': {
      title: 'How Transactions Work',
      type: 'interactive',
      content: 'Interactive content about transaction processing on the OPN chain.'
    }
  };

  const lesson = lessonContent[lessonId] || {};

  useEffect(() => {
    updateActivity('Viewing Lesson', lesson.title);
    // Simulate content completion after 5 seconds for demo
    setTimeout(() => setContentCompleted(true), 5000);
  }, [lesson.title]);

  const handleTakeQuiz = () => {
    navigate(`/quiz/${lessonId}`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-[#f8f6f1]/60 hover:text-[#f8f6f1] transition-colors"
        >
          ← Back to Dashboard
        </button>
        
        <h1 className="text-3xl font-bold text-[#f8f6f1] mb-6">
          {lesson.title}
        </h1>
        
        <div className="bg-[#1d2449]/30 backdrop-blur-sm rounded-xl p-8 border border-[#6105b6]/20 mb-8">
          <div className="text-[#f8f6f1]/80">
            {lesson.content}
          </div>
          
          {!contentCompleted && (
            <div className="mt-6 text-sm text-[#f8f6f1]/50">
              ⏱️ Please review the content completely to unlock the quiz...
            </div>
          )}
        </div>
        
        <div className="text-center">
          <button
            onClick={handleTakeQuiz}
            disabled={!contentCompleted}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
              contentCompleted
                ? 'bg-gradient-to-r from-[#6105b6] to-[#6305b6] text-[#f8f6f1] hover:scale-105 animate-pulse-glow'
                : 'bg-[#1d2449]/50 text-[#f8f6f1]/50 cursor-not-allowed'
            }`}
          >
            {contentCompleted ? '🚀 Take Quiz' : '🔒 Complete Content First'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonView;