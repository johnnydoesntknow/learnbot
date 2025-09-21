// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateActivity } from '../utils/discord';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [completedQuizzes, setCompletedQuizzes] = useState(
    JSON.parse(localStorage.getItem('completedQuizzes') || '[]')
  );
  
  const [lessons, setLessons] = useState([
    {
      id: 'intro-to-iopn',
      title: 'Introduction to IOPn',
      description: 'Learn the fundamentals of IOPn and its vision',
      type: 'video',
      duration: '5 min',
      completed: false
    },
    {
      id: 'opn-chain-basics', 
      title: 'OPN Chain Basics',
      description: 'Understanding the OPN blockchain architecture',
      type: 'text',
      duration: '8 min',
      completed: false
    },
    {
      id: 'transactions-on-opn',
      title: 'How Transactions Work',
      description: 'Deep dive into transaction processing',
      type: 'interactive',
      duration: '10 min',
      completed: false
    }
  ]);

  useEffect(() => {
    updateActivity('Browsing Lessons', 'Dashboard');
    const completed = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
    setCompletedQuizzes(completed);
    
    setLessons(prev => prev.map(lesson => ({
      ...lesson,
      completed: completed.includes(lesson.id)
    })));
  }, []);

  const handleStartLesson = (lessonId, lessonTitle) => {
    const isCompleted = completedQuizzes.includes(lessonId);
    
    if (isCompleted) {
      return;
    }
    
    updateActivity('Starting Lesson', lessonTitle);
    navigate(`/lesson/${lessonId}`);
  };

 const totalRepPoints = parseInt(localStorage.getItem(`repPoints_${user.user_id || user.userId}`) || '0');
const totalPulsePoints = parseInt(localStorage.getItem(`pulsePoints_${user.user_id || user.userId}`) || '0');
  // Fix for the property name mismatch
const avatarUrl = user.avatar 
  ? `https://cdn.discordapp.com/avatars/${user.user_id || user.userId}/${user.avatar}.png?size=128`
  : `https://cdn.discordapp.com/embed/avatars/${(parseInt(user.user_id || user.userId) >> 22) % 6}.png`;
  return (
    <div className="min-h-screen bg-[#050506] relative overflow-hidden flex flex-col">
      {/* Animated Wave Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#050506] to-[#0f0f1a] opacity-90" />
        <div className="wave-container">
          <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
            <defs>
              <path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="wave1">
              <use href="#wave" x="48" y="0" fill="rgba(97, 5, 182, 0.05)" />
            </g>
            <g className="wave2">
              <use href="#wave" x="48" y="3" fill="rgba(34, 128, 205, 0.03)" />
            </g>
            <g className="wave3">
              <use href="#wave" x="48" y="5" fill="rgba(97, 5, 182, 0.02)" />
            </g>
          </svg>
        </div>
      </div>

      {/* User Avatar - Fixed Position (TOP LEFT - NO NAME) */}
      <div className="fixed top-6 left-6 z-20">
        <img 
          src={avatarUrl} 
          alt={user.username}
          className="w-10 h-10 rounded-full border-2 border-[#6105b6]/50"
        />
      </div>

      {/* MAIN CENTERED CONTENT */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 py-20">
        <div className="w-full max-w-4xl">
          {/* Header - NOW WITH USERNAME */}
          <div className="text-center mb-10">
  <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
    Welcome Back
  </h1>
  <p className="text-white text-3xl font-bold mb-3">
    {user.username}
  </p>
  <p className="text-white/60 text-lg">
    Continue your journey in the IOPn ecosystem
  </p>
</div>

          {/* Points Display - BRIGHTER, NO PULSE */}
<div className="flex justify-center mb-8">
  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
    {/* REP Points Card */}
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6105b6] to-[#8b5cf6] rounded-xl opacity-50 group-hover:opacity-100 blur-lg transition duration-500"></div>
      <div className="relative bg-[#0f0f1a]/80 backdrop-blur-md border border-[#6105b6]/40 rounded-xl p-6 text-center hover:border-[#6105b6]/60 transition-all">
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 rounded-full bg-[#6105b6]/20 flex items-center justify-center">
            <span className="text-xs">⭐</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-[#6105b6] rounded-full shadow-[0_0_10px_rgba(97,5,182,0.5)]" />
          <p className="text-white/70 text-xs uppercase tracking-wider font-semibold">REP Points</p>
        </div>
        <p className="text-5xl font-bold bg-gradient-to-b from-[#6105b6] to-[#8b5cf6] bg-clip-text text-transparent">
          {totalRepPoints}
        </p>
        <p className="text-white/50 text-xs mt-2">Reputation Score</p>
      </div>
    </div>
    
    {/* Pulse Points Card */}
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2280cd] to-[#3b82f6] rounded-xl opacity-50 group-hover:opacity-100 blur-lg transition duration-500"></div>
      <div className="relative bg-[#0f0f1a]/80 backdrop-blur-md border border-[#2280cd]/40 rounded-xl p-6 text-center hover:border-[#2280cd]/60 transition-all">
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 rounded-full bg-[#2280cd]/20 flex items-center justify-center">
            <span className="text-xs">💫</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-[#2280cd] rounded-full shadow-[0_0_10px_rgba(34,128,205,0.5)]" />
          <p className="text-white/70 text-xs uppercase tracking-wider font-semibold">Pulse Points</p>
        </div>
        <p className="text-5xl font-bold bg-gradient-to-b from-[#2280cd] to-[#3b82f6] bg-clip-text text-transparent">
          {totalPulsePoints}
        </p>
        <p className="text-white/50 text-xs mt-2">Social Score</p>
      </div>
    </div>
  </div>
</div>

{/* Stats Grid - MUCH BRIGHTER */}
<div className="flex justify-center mb-8">
  <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
    {/* Lessons Completed */}
    <div className="relative overflow-hidden bg-[#0f0f1a]/80 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/30 transition-all group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#6105b6]/20 to-transparent rounded-bl-full"></div>
      <div className="relative">
        <div className="text-2xl mb-2 opacity-30 group-hover:opacity-50 transition-opacity">📚</div>
        <p className="text-white/60 text-xs mb-2">Lessons Completed</p>
        <p className="text-3xl font-bold text-white">
          {completedQuizzes.length}<span className="text-white/50 text-lg">/3</span>
        </p>
        <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#6105b6] to-[#2280cd] h-2 rounded-full transition-all relative"
            style={{ width: `${(completedQuizzes.length / 3) * 100}%` }}
          >
            <div className="absolute inset-0 bg-white/20"></div>
          </div>
        </div>
        <p className="text-[#6105b6] text-[10px] mt-2 font-semibold">
          {Math.round((completedQuizzes.length / 3) * 100)}% COMPLETE
        </p>
      </div>
    </div>

    {/* Quizzes Passed */}
<div className="relative overflow-hidden bg-[#0f0f1a]/80 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/30 transition-all group">
  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#f59e0b]/20 to-transparent rounded-bl-full"></div>
  <div className="relative">
    <div className="text-2xl mb-2 opacity-30 group-hover:opacity-50 transition-opacity">✅</div>
    <p className="text-white/60 text-xs mb-2">Quizzes Passed</p>
    <div className="flex items-center justify-center gap-1">
      <p className="text-3xl font-bold text-white">{completedQuizzes.length}</p>
    </div>
    <p className="text-white/50 text-xs mt-1">completed</p>
    <div className="mt-2 flex justify-center gap-1">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className={`w-8 h-1.5 rounded-full transition-all ${
            i < completedQuizzes.length 
              ? 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]' 
              : 'bg-white/10'
          }`}
        ></div>
      ))}
    </div>
  </div>
</div>

    {/* Total Earned */}
    <div className="relative overflow-hidden bg-[#0f0f1a]/80 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/30 transition-all group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#10b981]/20 to-transparent rounded-bl-full"></div>
      <div className="relative">
        <div className="text-2xl mb-2 opacity-30 group-hover:opacity-50 transition-opacity">💎</div>
        <p className="text-white/60 text-xs mb-2">Total Earned</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-[#6105b6] to-[#2280cd] bg-clip-text text-transparent">
          {totalRepPoints + totalPulsePoints}
        </p>
        <p className="text-white/50 text-xs mt-1">combined points</p>
        <div className="mt-2 h-6 flex items-center justify-center">
          <div className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-[#6105b6]/30 to-[#2280cd]/30 rounded-full text-white/70 font-semibold">
            LEVEL {Math.floor((totalRepPoints + totalPulsePoints) / 100) || 1}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Lessons Section - ENHANCED STYLING */}
<div className="flex flex-col items-center">
  <h2 className="text-3xl font-bold text-white mb-8 text-center">
    Available Lessons
  </h2>
  
  <div className="w-full max-w-2xl space-y-4">
    {lessons.map((lesson, index) => (
      <div 
        key={lesson.id}
        className={`relative group ${lesson.completed ? 'opacity-75' : ''}`}
      >
        {/* Glow effect for uncompleted lessons */}
        {!lesson.completed && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6105b6]/20 to-[#2280cd]/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
        )}
        
        <div className={`relative bg-[#0f0f1a]/80 backdrop-blur-md border ${
          lesson.completed ? 'border-[#6105b6]/40' : 'border-white/20'
        } rounded-xl p-6 flex justify-between items-center transition-all hover:scale-[1.01] hover:border-white/30`}>
          
          {/* Lesson Number Badge */}
          <div className="absolute -top-2 -left-2">
            <div className={`w-8 h-8 rounded-full ${
              lesson.completed 
                ? 'bg-gradient-to-br from-[#6105b6] to-[#8b5cf6]' 
                : 'bg-gradient-to-br from-white/20 to-white/10'
            } flex items-center justify-center border border-white/20`}>
              <span className="text-xs font-bold text-white">
                {lesson.completed ? '✓' : index + 1}
              </span>
            </div>
          </div>
          
          <div className="flex-1 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {lesson.title}
              </h3>
              {lesson.completed && (
                <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-[#6105b6]/30 to-[#8b5cf6]/30 text-[#8b5cf6] rounded-full font-semibold border border-[#6105b6]/30">
                  ✓ COMPLETED
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 mb-3">
              {lesson.description}
            </p>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1 text-white/50">
                <span className="opacity-70">📹</span> {lesson.type}
              </span>
              <span className="flex items-center gap-1 text-white/50">
                <span className="opacity-70">⏱</span> {lesson.duration}
              </span>
              {!lesson.completed && (
                <span className="flex items-center gap-1 text-[#6105b6]/70">
                  <span className="opacity-70">🏆</span> +30 REP
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => handleStartLesson(lesson.id, lesson.title)}
            disabled={lesson.completed}
            className={`relative ml-4 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
              lesson.completed
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'group/btn'
            }`}
          >
            {!lesson.completed && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-[#6105b6] to-[#2280cd] rounded-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#6105b6] to-[#2280cd] rounded-lg blur opacity-50 group-hover/btn:opacity-100 transition-opacity"></div>
                <span className="relative text-white">Start</span>
              </>
            )}
            {lesson.completed && 'Completed'}
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

{/* Completion Message - ENHANCED */}
{completedQuizzes.length === lessons.length && (
  <div className="flex justify-center mt-10">
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6105b6] to-[#2280cd] rounded-xl opacity-50 blur animate-pulse"></div>
      <div className="relative w-full max-w-2xl p-8 bg-[#0f0f1a]/90 backdrop-blur-md rounded-xl border border-[#6105b6]/40 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Congratulations!
        </h3>
        <p className="text-white/80 text-base">
          You've completed all available lessons! Thank you for participating in the IOPn Learn program.
        </p>
        <div className="mt-4 text-sm text-[#6105b6] font-semibold">
          Total Points Earned: {totalRepPoints + totalPulsePoints}
        </div>
      </div>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;