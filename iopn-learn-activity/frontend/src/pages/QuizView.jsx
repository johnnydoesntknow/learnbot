// frontend/src/pages/QuizView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateActivity } from '../utils/discord';

const QuizView = ({ user }) => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [answerClickable, setAnswerClickable] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [blockMessage, setBlockMessage] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [passingScore, setPassingScore] = useState(70);

  useEffect(() => {
    const checkAttemptsAndFetch = async () => {
      try {
        // Generate a unique tab ID for this session
        const tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem('tabId', tabId);
        
        // Check if ANY quiz is active in another tab
        const activeQuizData = localStorage.getItem('activeQuizData');
        if (activeQuizData) {
          const data = JSON.parse(activeQuizData);
          const timeDiff = Date.now() - data.startTime;
          
          // If quiz was started less than 30 minutes ago and it's not this tab
          if (timeDiff < 30 * 60 * 1000 && data.tabId !== tabId) {
            // If it's a DIFFERENT quiz, clear the old session and allow this one
            if (data.lessonId !== lessonId) {
              localStorage.removeItem('activeQuizData');
              console.log('Cleared old quiz session for different quiz');
            } else {
              setBlockMessage('This quiz is already open in another tab. Please close that tab first.');
              setShowBlockModal(true);
              // Clear the lock after showing message so user can retry
              setTimeout(() => {
                localStorage.removeItem('activeQuizData');
                setShowBlockModal(false);
                navigate('/');
              }, 2000);
              return;
            }
          } else if (timeDiff >= 30 * 60 * 1000) {
            // Clean up stale session
            localStorage.removeItem('activeQuizData');
          }
        }
        
        // Check local attempts first
        const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
        const currentAttempts = quizAttempts[lessonId] || 0;
        
        // Check if already at or over 3 attempts
        if (currentAttempts >= 3) {
          // Mark as failed if not already completed
          const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
          if (!completedQuizzes.includes(lessonId)) {
            const failedQuizzes = JSON.parse(localStorage.getItem('failedQuizzes') || '[]');
            if (!failedQuizzes.includes(lessonId)) {
              failedQuizzes.push(lessonId);
              localStorage.setItem('failedQuizzes', JSON.stringify(failedQuizzes));
            }
          }
          
          setBlockMessage('You have exceeded the maximum attempts for this quiz.');
          setShowBlockModal(true);
          setTimeout(() => {
            setShowBlockModal(false);
            navigate('/');
          }, 2000);
          return;
        }
        
        setAttempts(currentAttempts);
        
        // Get token for API call
        const token = localStorage.getItem('user_token');
        
        // Fetch quiz data
        const response = await fetch(`http://localhost:3001/api/quiz/${lessonId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        const data = await response.json();
        
        // Set quiz data from API
        setQuestions(data.questions);
        
        // Set passing score if provided
        if (data.passingScore) {
          setPassingScore(data.passingScore);
        }
        
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        navigate('/');
      }
    };
    
    checkAttemptsAndFetch();
    updateActivity('Taking Quiz', lessonId);
  }, [lessonId, navigate]);

  // Separate effect for monitoring other tabs
  useEffect(() => {
    let intervalId;
    
    if (quizStarted && !quizComplete) {
      // Check every second if another tab has taken over THE SAME QUIZ
      intervalId = setInterval(() => {
        const activeQuizData = localStorage.getItem('activeQuizData');
        const myTabId = sessionStorage.getItem('tabId');
        
        if (activeQuizData) {
          const data = JSON.parse(activeQuizData);
          // Only block if it's the SAME quiz in a different tab
          if (data.lessonId === lessonId && data.tabId !== myTabId) {
            setBlockMessage('Another tab has started this quiz. This session will be closed.');
            setShowBlockModal(true);
            setTimeout(() => {
              setShowBlockModal(false);
              navigate('/');
            }, 2500);
          }
          // Different quiz is OK - let them switch between lessons
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [quizStarted, quizComplete, navigate, lessonId]);

  // Clear session when navigating back to dashboard
  useEffect(() => {
    const handlePopState = () => {
      const activeQuizData = localStorage.getItem('activeQuizData');
      const myTabId = sessionStorage.getItem('tabId');
      
      if (activeQuizData) {
        const data = JSON.parse(activeQuizData);
        if (data.tabId === myTabId) {
          localStorage.removeItem('activeQuizData');
          console.log('Cleared session on back navigation');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handle cleanup on unmount or completion
  useEffect(() => {
    return () => {
      // When leaving the quiz page, clear the active session if it belongs to this tab
      const activeQuizData = localStorage.getItem('activeQuizData');
      const myTabId = sessionStorage.getItem('tabId');
      
      if (activeQuizData && myTabId) {
        const data = JSON.parse(activeQuizData);
        if (data.tabId === myTabId) {
          localStorage.removeItem('activeQuizData');
          console.log('Cleared quiz session on unmount');
        }
      }
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/quiz/${lessonId}`);
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleBackToDashboard = () => {
    setShowWarning(true);
  };

  const confirmLeave = () => {
    // Clear session locks when leaving
    const activeQuizData = localStorage.getItem('activeQuizData');
    const myTabId = sessionStorage.getItem('tabId');
    
    if (activeQuizData) {
      const data = JSON.parse(activeQuizData);
      if (data.tabId === myTabId || data.lessonId === lessonId) {
        // Clear if it's our session OR if it's the same quiz (to prevent permanent locks)
        localStorage.removeItem('activeQuizData');
        console.log('Cleared quiz session when leaving');
      }
    }
    
    navigate('/');
  };

  const startQuiz = () => {
    const myTabId = sessionStorage.getItem('tabId');
    
    // Check for active quiz session
    const activeQuizData = localStorage.getItem('activeQuizData');
    if (activeQuizData) {
      const data = JSON.parse(activeQuizData);
      const timeDiff = Date.now() - data.startTime;
      
      // If it's the same quiz in another tab, block it
      if (data.lessonId === lessonId && data.tabId !== myTabId && timeDiff < 30 * 60 * 1000) {
        setBlockMessage('This quiz is already open in another tab. Please close that tab first.');
        setShowBlockModal(true);
        setTimeout(() => {
          localStorage.removeItem('activeQuizData');
          setShowBlockModal(false);
          navigate('/');
        }, 2000);
        return;
      }
      
      // If it's a different quiz, clear the old one and continue
      if (data.lessonId !== lessonId) {
        localStorage.removeItem('activeQuizData');
        console.log('Cleared previous quiz session to start new quiz');
      }
    }
    
    // Set this tab as the active quiz session
    localStorage.setItem('activeQuizData', JSON.stringify({
      lessonId: lessonId,
      tabId: myTabId,
      startTime: Date.now(),
      userId: user.userId
    }));
    
    // Increment attempt count when starting
    const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
    const newAttemptCount = (quizAttempts[lessonId] || 0) + 1;
    quizAttempts[lessonId] = newAttemptCount;
    localStorage.setItem('quizAttempts', JSON.stringify(quizAttempts));
    
    // Update local state
    setAttempts(newAttemptCount);
    setQuizStarted(true);
    startCountdown();
  };

  const startCountdown = () => {
    setAnswerClickable(false);
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setAnswerClickable(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answerId) => {
  if (!answerClickable) return;
  
  // Store the answer
  const newAnswers = { ...answers, [questions[currentIndex].id]: answerId };
  setAnswers(newAnswers);
  
  // Check if this is the last question
  if (currentIndex < questions.length - 1) {
    // NOT the last question - go to next
    setCurrentIndex(currentIndex + 1);
    startCountdown();  // Start countdown for next question
  } else {
    // This IS the last question - submit quiz
    submitQuiz(newAnswers);
  }
};

  const submitQuiz = async (finalAnswers) => {
  try {
    const token = localStorage.getItem('user_token');
    
    // Add this console log to debug
    console.log('Submitting quiz with token:', token ? 'Token exists' : 'No token');
    console.log('Answers:', finalAnswers);
    console.log('LessonId:', lessonId);
    
    const response = await fetch('http://localhost:3001/api/quiz/submit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Make sure this is here
      },
      body: JSON.stringify({ 
        answers: finalAnswers, 
        lessonId,
        token  // Include token in body as backup
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server error:', errorData);
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    setResults(data);
    setQuizComplete(true);
    
    // Rest of your code...
      
      // IMPORTANT: REP Points Logic
      // - Only awarded when passing (70% or higher)
      // - Perfect score (100%) gets bonus points
      // - Failed attempts get 0 points
      // - Backend controls all point values via .env
      
      // Clear active quiz session
      const activeQuizData = localStorage.getItem('activeQuizData');
      const myTabId = sessionStorage.getItem('tabId');
      
      if (activeQuizData) {
        const sessionData = JSON.parse(activeQuizData);
        if (sessionData.tabId === myTabId) {
          localStorage.removeItem('activeQuizData');
        }
      }
      
      // Mark as completed if passed
      if (data.passed) {
        const completed = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
        if (!completed.includes(lessonId)) {
          completed.push(lessonId);
          localStorage.setItem('completedQuizzes', JSON.stringify(completed));
        }
        
        // Store REP points (only awarded when passing, data.points will be > 0)
        if (data.points > 0) {
          const currentRep = parseInt(localStorage.getItem(`repPoints_${user.userId}`) || '0');
          localStorage.setItem(`repPoints_${user.userId}`, String(currentRep + data.points));
        }
      } else {
        // Failed - no REP points awarded
        // Check if this was the third failed attempt
        const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
        if (quizAttempts[lessonId] >= 3) {
          const failedQuizzes = JSON.parse(localStorage.getItem('failedQuizzes') || '[]');
          if (!failedQuizzes.includes(lessonId)) {
            failedQuizzes.push(lessonId);
            localStorage.setItem('failedQuizzes', JSON.stringify(failedQuizzes));
          }
        }
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Clear locks even on error
      const activeQuizData = localStorage.getItem('activeQuizData');
      const myTabId = sessionStorage.getItem('tabId');
      
      if (activeQuizData) {
        const data = JSON.parse(activeQuizData);
        if (data.tabId === myTabId) {
          localStorage.removeItem('activeQuizData');
        }
      }
    }
  };

  // Block Modal (for multi-tab prevention and exceeded attempts)
  if (showBlockModal) {
    const isExceededAttempts = blockMessage?.includes('exceeded');
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
        <div className="relative">
          {/* Glow effect */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${
            isExceededAttempts 
              ? 'from-orange-500 to-red-500' 
              : 'from-red-500 to-red-600'
          } rounded-xl opacity-30 blur-lg animate-pulse`}></div>
          <div className={`relative bg-[#1a1a1f]/90 backdrop-blur rounded-xl p-8 border ${
            isExceededAttempts 
              ? 'border-orange-500/30' 
              : 'border-red-500/30'
          } max-w-md`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${
                isExceededAttempts 
                  ? 'from-orange-500/30 to-red-500/30' 
                  : 'from-red-500/30 to-red-600/30'
              } rounded-full flex items-center justify-center animate-pulse`}>
                <span className="text-3xl">{isExceededAttempts ? '❌' : '⚠️'}</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white text-center mb-4">
              {isExceededAttempts ? 'Attempts Exceeded' : 'Quiz Session Blocked'}
            </h2>
            <p className="text-white/70 text-center mb-6">
              {blockMessage}
            </p>
            <div className="flex justify-center">
              <div className={`px-4 py-2 bg-gradient-to-r ${
                isExceededAttempts 
                  ? 'from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/20' 
                  : 'from-red-500/20 to-red-600/20 text-red-400 border-red-500/20'
              } rounded-lg text-sm border animate-pulse`}>
                🔄 Redirecting to dashboard...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Warning Modal
  if (showWarning) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
        <div className="bg-[#1a1a1f]/90 backdrop-blur rounded-xl p-8 border border-[#6105b6]/30 max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            ⚠️ Are you sure you want to leave?
          </h2>
          <p className="text-white/70 mb-6">
            You will lose your current progress and this will count as one of your 3 attempts!
            You have used {attempts} of 3 attempts.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowWarning(false)}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Continue Quiz
            </button>
            <button
              onClick={confirmLeave}
              className="flex-1 px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Leave Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    // Clean up any stale quiz sessions on load
    const activeQuizData = localStorage.getItem('activeQuizData');
    if (activeQuizData) {
      const data = JSON.parse(activeQuizData);
      const timeDiff = Date.now() - data.startTime;
      if (timeDiff > 30 * 60 * 1000) {
        localStorage.removeItem('activeQuizData');
      }
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Ready for the Quiz?</h1>
          <p className="text-white/70 mb-4">Test your knowledge about IOPn</p>
          <p className="text-sm text-[#f59e0b] mb-2">
            ⚠️ You have {3 - attempts} attempt(s) remaining
          </p>
          <p className="text-xs text-white/50 mb-8">
            ⚠️ Important: Only one quiz can be taken at a time.
          </p>
          <button
            onClick={startQuiz}
            className="px-8 py-3 bg-gradient-to-r from-[#6105b6] to-[#2280cd] rounded-lg font-semibold text-white hover:scale-105 transition-transform"
          >
            Start Quiz
          </button>
          
          {/* Emergency clear button if stuck */}
          <div className="mt-8">
            <button
              onClick={() => {
                localStorage.removeItem('activeQuizData');
                window.location.reload();
              }}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Stuck? Click here to clear session
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizComplete && results) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
        <div className="text-center bg-[#1a1a1f]/90 backdrop-blur rounded-xl p-8 border border-[#6105b6]/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            {results.passed ? '🎉 Quiz Complete!' : '💪 Keep Learning!'}
          </h2>
          <div className="text-6xl font-bold text-[#6105b6] mb-4">
            {results.percentage}%
          </div>
          <p className="text-white/70 mb-2">
            You got {results.score} out of {results.totalQuestions} questions correct
          </p>
          {results.passed ? (
            <p className="text-[#6105b6] font-semibold mb-6">
              +{results.points} REP Points Earned!
            </p>
          ) : (
            <>
              <p className="text-[#f59e0b] mb-2">
                You need {passingScore || 70}% to pass.
              </p>
              <p className="text-white/60 text-sm mb-6">
                {attempts < 3 
                  ? `You have ${3 - attempts} attempt${3 - attempts === 1 ? '' : 's'} remaining.` 
                  : 'No attempts remaining. This quiz is now locked.'}
              </p>
            </>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#6105b6] to-[#2280cd] text-white rounded-lg hover:scale-105 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
      {currentQuestion && (
        <div className="w-full max-w-3xl">
          <button
            onClick={handleBackToDashboard}
            className="mb-4 text-white/50 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
          
          <div className="mb-6">
            <div className="flex justify-between text-white/60 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>Attempt {attempts} of 3</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#6105b6] to-[#2280cd] h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-[#1a1a1f]/90 backdrop-blur rounded-xl p-8 border border-[#6105b6]/20">
            <h2 className="text-2xl font-semibold text-white mb-8">
              {currentQuestion.question}
            </h2>
            
            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  disabled={!answerClickable}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    !answerClickable
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-white/10 border-[#6105b6]/30 hover:bg-[#6105b6]/20 hover:border-[#6105b6]/60 cursor-pointer'
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-[#6105b6]/20 flex items-center justify-center text-sm font-semibold text-white">
                      {option.id.toUpperCase()}
                    </span>
                    <span className="text-white">{option.text}</span>
                  </span>
                </button>
              ))}
            </div>
            
            {!answerClickable && countdown > 0 && (
              <div className="mt-8 text-center">
                <div className="text-4xl font-bold text-[#6105b6]">
                  {countdown}
                </div>
                <p className="text-sm text-white/60 mt-2">
                  Wait before selecting an answer
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;