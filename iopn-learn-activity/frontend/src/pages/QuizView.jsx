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

  useEffect(() => {
  const checkAttemptsAndFetch = async () => {
    try {
      // Get token for API call
      const token = localStorage.getItem('user_token');
      
      // Fetch quiz data which includes attempt checking
      const response = await fetch(`http://localhost:3001/api/quiz/${lessonId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const data = await response.json();
      
      // Check if exceeded attempts (from API)
      if (data.error === 'exceeded_attempts') {
        alert(data.message);
        navigate('/');
        return;
      }
      
      // Set quiz data from API
      setQuestions(data.questions);
      setAttempts(data.attemptNumber - 1); // attemptNumber is the next attempt, so subtract 1 for current
      
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      navigate('/');
    }
  };
  
  checkAttemptsAndFetch();
  updateActivity('Taking Quiz', lessonId);
  
  // Warning on page leave
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = 'You will lose your progress. You only have 3 attempts!';
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Clear session on unmount if quiz completed
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    if (quizComplete) {
      sessionStorage.removeItem('activeQuizSession');
    }
  };
}, [lessonId, navigate]);

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
    // Increment attempt count
    const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
    quizAttempts[lessonId] = (quizAttempts[lessonId] || 0) + 1;
    localStorage.setItem('quizAttempts', JSON.stringify(quizAttempts));
    navigate('/');
  };

  const startQuiz = () => {
    // Increment attempt count when starting
    const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '{}');
    quizAttempts[lessonId] = (quizAttempts[lessonId] || 0) + 1;
    localStorage.setItem('quizAttempts', JSON.stringify(quizAttempts));
    
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
    
    const newAnswers = { ...answers, [questions[currentIndex].id]: answerId };
    setAnswers(newAnswers);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      startCountdown();
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch('http://localhost:3001/api/quiz/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          answers: finalAnswers, 
          lessonId 
        })
      });
      const data = await response.json();
      setResults(data);
      setQuizComplete(true);
      
      // Mark as completed if passed
      // Update points - USE USER ID FOR UNIQUE STORAGE
if (data.passed) {
  const completed = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
  completed.push(lessonId);
  localStorage.setItem('completedQuizzes', JSON.stringify(completed));
  
  // Store points with userId to persist properly
  const currentRep = parseInt(localStorage.getItem(`repPoints_${user.userId}`) || '0');
  const currentPulse = parseInt(localStorage.getItem(`pulsePoints_${user.userId}`) || '0');
  localStorage.setItem(`repPoints_${user.userId}`, String(currentRep + data.points));
  localStorage.setItem(`pulsePoints_${user.userId}`, String(currentPulse + 10));
}
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

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
            You have {3 - attempts} attempt(s) remaining.
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
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Ready for the Quiz?</h1>
          <p className="text-white/70 mb-4">Test your knowledge about IOPn</p>
          <p className="text-sm text-[#f59e0b] mb-8">
            ⚠️ You have {3 - attempts} attempt(s) remaining
          </p>
          <button
            onClick={startQuiz}
            className="px-8 py-3 bg-gradient-to-r from-[#6105b6] to-[#2280cd] rounded-lg font-semibold text-white hover:scale-105 transition-transform"
          >
            Start Quiz
          </button>
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
            <>
              <p className="text-[#6105b6] font-semibold mb-2">
                +{results.points} REP Points Earned!
              </p>
              <p className="text-[#2280cd] font-semibold mb-6">
                +10 Pulse Points Bonus!
              </p>
            </>
          ) : (
            <p className="text-[#f59e0b] mb-6">
              You need 70% to pass. Attempts remaining: {3 - attempts - 1}
            </p>
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
              <span>Attempt {attempts + 1} of 3</span>
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