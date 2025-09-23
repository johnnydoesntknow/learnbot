// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateActivity } from '../utils/discord';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [failedQuizzes, setFailedQuizzes] = useState([]);
  const [repConfig, setRepConfig] = useState({
    pass: 30,
    fail: 0,
    perfect: 50
  });
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // SINGLE useEffect - no more conflicts!
  useEffect(() => {
    const initializeDashboard = async () => {
      // 1. Clear stuck sessions
      const activeQuizData = localStorage.getItem('activeQuizData');
      if (activeQuizData) {
        localStorage.removeItem('activeQuizData');
        console.log('Cleared stuck quiz session');
      }
      
      // 2. Load saved progress
      const completed = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
      const failed = JSON.parse(localStorage.getItem('failedQuizzes') || '[]');
      const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
      
      // 3. Check for exceeded attempts
      Object.keys(quizAttempts).forEach(lessonId => {
        if (quizAttempts[lessonId] >= 3 && !completed.includes(lessonId)) {
          if (!failed.includes(lessonId)) {
            failed.push(lessonId);
          }
        }
      });
      
      setCompletedQuizzes(completed);
      setFailedQuizzes(failed);
      
      if (failed.length > 0) {
        localStorage.setItem('failedQuizzes', JSON.stringify(failed));
      }
      
      // 4. Fetch lessons with auth header for database progress
      try {
        const token = localStorage.getItem('user_token');
        const response = await fetch('http://localhost:3001/api/lessons', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await response.json();
        
        // Map completed/failed status from localStorage (frontend tracking)
        const lessonsWithStatus = data.map(lesson => ({
          ...lesson,
          completed: completed.includes(lesson.id),
          failed: failed.includes(lesson.id),
          // userStatus from database if available
          dbStatus: lesson.userStatus
        }));
        
        setLessons(lessonsWithStatus);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        // Fallback lessons
        setLessons([
          {
            id: 'lesson-1',
            title: 'Lesson 1',
            description: 'Unable to connect to server',
            contentType: 'video',
            duration: '5 min',
            completed: completed.includes('lesson-1'),
            failed: failed.includes('lesson-1')
          },
          {
            id: 'lesson-2',
            title: 'Lesson 2',
            description: 'Unable to connect to server',
            contentType: 'text',
            duration: '8 min',
            completed: completed.includes('lesson-2'),
            failed: failed.includes('lesson-2')
          },
          {
            id: 'lesson-3',
            title: 'Lesson 3',
            description: 'Unable to connect to server',
            contentType: 'interactive',
            duration: '10 min',
            completed: completed.includes('lesson-3'),
            failed: failed.includes('lesson-3')
          }
        ]);
      }
      
      // 5. Fetch REP configuration
      try {
        const configRes = await fetch('http://localhost:3001/api/config');
        const configData = await configRes.json();
        if (configData.repPoints) {
          setRepConfig(configData.repPoints);
        }
      } catch (err) {
        console.log('Using default REP config');
      }
      
      // 6. Update Discord activity
      updateActivity('Browsing Lessons', 'Dashboard');
      
      setLoading(false);
    };
    
    initializeDashboard();
  }, []); // Only runs once on mount

  const handleStartLesson = (lessonId, lessonTitle) => {
    const isCompleted = completedQuizzes.includes(lessonId);
    const isFailed = failedQuizzes.includes(lessonId);
    
    if (isCompleted || isFailed) {
      return;
    }
    
    updateActivity('Starting Lesson', lessonTitle);
    navigate(`/lesson/${lessonId}`);
  };

  // Get REP points - could come from database now via user prop if server updated it
  const totalRepPoints = user.repPoints || parseInt(localStorage.getItem(`repPoints_${user.userId}`) || '0');
  
  const avatarUrl = user.avatar 
    ? `https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${(parseInt(user.userId) >> 22) % 6}.png`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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

      {/* User Avatar */}
      <div className="fixed top-6 left-6 z-20">
        <img 
          src={avatarUrl} 
          alt={user.username}
          className="w-10 h-10 rounded-full border-2 border-[#6105b6]/50"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 py-20">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <img 
                src="/favicon.jpeg" 
                alt="IOPn" 
                className="w-20 h-20 rounded-full border-2 border-[#6105b6]/50 shadow-lg shadow-[#6105b6]/30"
              />
            </div>
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

          {/* REP Points Card */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-sm">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6105b6] to-[#8b5cf6] rounded-xl opacity-50 group-hover:opacity-100 blur-lg transition duration-500"></div>
                <div className="relative bg-[#0f0f1a]/80 backdrop-blur-md border border-[#6105b6]/40 rounded-xl p-8 text-center hover:border-[#6105b6]/60 transition-all">
                  <div className="absolute top-3 right-3">
                    <div className="w-10 h-10 rounded-full bg-[#6105b6]/20 flex items-center justify-center">
                      <span className="text-sm">⭐</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-[#6105b6] rounded-full shadow-[0_0_15px_rgba(97,5,182,0.7)]" />
                    <p className="text-white/70 text-sm uppercase tracking-wider font-semibold">REP Points</p>
                  </div>
                  <p className="text-6xl font-bold bg-gradient-to-b from-[#6105b6] to-[#8b5cf6] bg-clip-text text-transparent">
                    {totalRepPoints}
                  </p>
                  <p className="text-white/50 text-sm mt-3">Reputation Score</p>
                  <div className="mt-4 h-6 flex items-center justify-center">
                    <div className="text-xs px-3 py-1 bg-gradient-to-r from-[#6105b6]/30 to-[#8b5cf6]/30 rounded-full text-white/70 font-semibold">
                      LEVEL {Math.floor(totalRepPoints / 100) || 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
              {/* Lessons Completed */}
              <div className="relative overflow-hidden bg-[#0f0f1a]/80 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/30 transition-all group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#6105b6]/20 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="text-2xl mb-2 opacity-30 group-hover:opacity-50 transition-opacity">📚</div>
                  <p className="text-white/60 text-xs mb-2">Lessons Completed</p>
                  <p className="text-3xl font-bold text-white">
                    {completedQuizzes.length + failedQuizzes.length}<span className="text-white/50 text-lg">/{lessons.length}</span>
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
                    <div className="flex h-2">
                      <div 
                        className="bg-gradient-to-r from-[#10b981] to-[#34d399] h-2 transition-all relative"
                        style={{ width: `${(completedQuizzes.length / (lessons.length || 1)) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20"></div>
                      </div>
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2 transition-all relative"
                        style={{ width: `${(failedQuizzes.length / (lessons.length || 1)) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quizzes Passed */}
              <div className="relative overflow-hidden bg-[#0f0f1a]/80 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/30 transition-all group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#f59e0b]/20 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="text-2xl mb-2 opacity-30 group-hover:opacity-50 transition-opacity">📊</div>
                  <p className="text-white/60 text-xs mb-2">Quiz Results</p>
                  <p className="text-3xl font-bold text-white">
                    {completedQuizzes.length}<span className="text-white/50 text-lg">/{lessons.length}</span>
                  </p>
                  <p className="text-white/50 text-xs mt-1">passed</p>
                  <div className="mt-2 flex justify-center gap-1">
                    {lessons.slice(0, 3).map((lesson, i) => {
                      const isPassed = completedQuizzes.includes(lesson.id);
                      const isFailed = failedQuizzes.includes(lesson.id);
                      
                      return (
                        <div 
                          key={i} 
                          className={`w-8 h-2 rounded-full transition-all ${
                            isPassed 
                              ? 'bg-gradient-to-r from-[#10b981] to-[#34d399]' 
                              : isFailed
                              ? 'bg-gradient-to-r from-red-500 to-red-600'
                              : 'bg-white/10'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* REP Earned */}
              <div className="relative overflow-hidden bg-[#0f0f1a]/80 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:border-white/30 transition-all group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#6105b6]/20 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="text-2xl mb-2 opacity-30 group-hover:opacity-50 transition-opacity">💎</div>
                  <p className="text-white/60 text-xs mb-2">REP Earned</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-[#6105b6] to-[#8b5cf6] bg-clip-text text-transparent">
                    {totalRepPoints}
                  </p>
                  <p className="text-white/50 text-xs mt-1">total points</p>
                  <div className="mt-2 h-6 flex items-center justify-center">
                    <div className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-[#6105b6]/30 to-[#8b5cf6]/30 rounded-full text-white/70 font-semibold">
                      LEVEL {Math.floor(totalRepPoints / 100) || 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons Section - Shows if not all completed */}
          {lessons.length > 0 && (completedQuizzes.length + failedQuizzes.length) < lessons.length && (
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Available Lessons
              </h2>
              
              <div className="w-full max-w-2xl space-y-4">
                {lessons.map((lesson, index) => {
                  const isCompleted = lesson.completed;
                  const isFailed = lesson.failed;
                  const isDisabled = isCompleted || isFailed;
                  
                  return (
                    <div 
                      key={lesson.id}
                      className={`relative group ${isDisabled ? 'opacity-75' : ''}`}
                    >
                      {!isDisabled && (
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6105b6]/20 to-[#2280cd]/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                      )}
                      
                      <div className={`relative bg-[#0f0f1a]/80 backdrop-blur-md border ${
                        isCompleted ? 'border-[#6105b6]/40' : isFailed ? 'border-red-500/40' : 'border-white/20'
                      } rounded-xl p-6 flex justify-between items-center transition-all hover:scale-[1.01] ${
                        isDisabled ? '' : 'hover:border-white/30'
                      }`}>
                        
                        <div className="absolute -top-2 -left-2">
                          <div className={`w-8 h-8 rounded-full ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-[#6105b6] to-[#8b5cf6]'
                              : isFailed
                              ? 'bg-gradient-to-br from-red-500 to-red-700' 
                              : 'bg-gradient-to-br from-white/20 to-white/10'
                          } flex items-center justify-center border border-white/20`}>
                            <span className="text-xs font-bold text-white">
                              {isCompleted ? '✓' : isFailed ? '✗' : index + 1}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 pl-4">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {lesson.title}
                            </h3>
                            {isCompleted && (
                              <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-[#6105b6]/30 to-[#8b5cf6]/30 text-[#8b5cf6] rounded-full font-semibold border border-[#6105b6]/30">
                                ✓ COMPLETED
                              </span>
                            )}
                            {isFailed && (
                              <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-red-500/30 to-red-700/30 text-red-500 rounded-full font-semibold border border-red-500/30">
                                ✗ ATTEMPTS EXCEEDED
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/70 mb-3">
                            {lesson.description}
                          </p>
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1 text-white/50">
                              <span className="opacity-70">📹</span> {lesson.contentType || lesson.type}
                            </span>
                            <span className="flex items-center gap-1 text-white/50">
                              <span className="opacity-70">⏱</span> {lesson.duration}
                            </span>
                            {!isDisabled && (
                              <span className="flex items-center gap-1 text-[#6105b6]/70">
                                <span className="opacity-70">🏆</span> +{repConfig.pass} REP
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleStartLesson(lesson.id, lesson.title)}
                          disabled={isDisabled}
                          className={`relative ml-4 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                            isDisabled
                              ? 'bg-white/10 text-white/40 cursor-not-allowed'
                              : 'group/btn'
                          }`}
                        >
                          {!isDisabled && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#6105b6] to-[#2280cd] rounded-lg"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-[#6105b6] to-[#2280cd] rounded-lg blur opacity-50 group-hover/btn:opacity-100 transition-opacity"></div>
                              <span className="relative text-white">Start</span>
                            </>
                          )}
                          {isCompleted && 'Completed'}
                          {isFailed && 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completion Message */}
          {lessons.length > 0 && (completedQuizzes.length + failedQuizzes.length) === lessons.length && (
            <div className="flex justify-center mt-10">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6105b6] to-[#2280cd] rounded-xl opacity-50 blur animate-pulse"></div>
                <div className="relative w-full max-w-2xl p-8 bg-[#0f0f1a]/90 backdrop-blur-md rounded-xl border border-[#6105b6]/40 text-center">
                  <div className="flex justify-center mb-4">
                    <img 
                      src="/iopn.jpg" 
                      alt="IOPn" 
                      className="w-24 h-24 rounded-xl border-2 border-[#6105b6]/50 shadow-lg shadow-[#6105b6]/30"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {failedQuizzes.length === 0 ? 'Congratulations!' : 'Learning Journey Complete'}
                  </h3>
                  <p className="text-white/80 text-base">
                    {failedQuizzes.length === 0 
                      ? "You've successfully completed all available lessons! Thank you for participating in the IOPn Learn program."
                      : `You've completed your learning journey. You passed ${completedQuizzes.length} out of ${lessons.length} lessons.`}
                  </p>
                  <div className="mt-6 text-lg text-[#6105b6] font-bold">
                    Total REP Points Earned: {totalRepPoints}
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