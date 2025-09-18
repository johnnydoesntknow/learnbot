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

  useEffect(() => {
    fetchQuestions();
    updateActivity('Taking Quiz', lessonId);
  }, [lessonId]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/quiz/${lessonId}`);
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const startQuiz = () => {
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
  } catch (error) {
    console.error('Failed to submit quiz:', error);
  }
};

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#f8f6f1] mb-4">Ready for the Quiz?</h1>
          <p className="text-[#f8f6f1]/70 mb-8">Test your knowledge about IOPn</p>
          <button
            onClick={startQuiz}
            className="px-8 py-3 bg-gradient-to-r from-[#6105b6] to-[#6305b6] rounded-lg font-semibold text-[#f8f6f1] hover:scale-105 transition-transform"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizComplete && results) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-[#1d2449]/30 backdrop-blur-sm rounded-xl p-8 border border-[#6105b6]/20">
          <h2 className="text-3xl font-bold text-[#f8f6f1] mb-4">
            Quiz Complete!
          </h2>
          <div className="text-6xl font-bold text-[#6105b6] mb-4">
            {results.percentage}%
          </div>
          <p className="text-[#f8f6f1]/70 mb-2">
            You got {results.score} out of {results.totalQuestions} questions correct
          </p>
          <p className="text-[#6105b6] font-semibold mb-6">
            +{results.points} REP Points Earned!
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#1d2449] text-[#f8f6f1] rounded-lg hover:bg-[#1d2449]/80 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {currentQuestion && (
        <div className="w-full max-w-3xl">
          <div className="mb-6">
            <div className="flex justify-between text-[#f8f6f1]/60 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>3-second delay active</span>
            </div>
            <div className="w-full bg-[#0f112a]/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#6105b6] to-[#6305b6] h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-[#1d2449]/30 backdrop-blur-sm rounded-xl p-8 border border-[#6105b6]/20">
            <h2 className="text-2xl font-semibold text-[#f8f6f1] mb-8">
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
                      ? 'bg-[#1d2449]/30 border-[#6105b6]/20 opacity-50 cursor-not-allowed'
                      : 'bg-[#1d2449]/50 border-[#6105b6]/30 hover:bg-[#6105b6]/20 hover:border-[#6105b6]/60 cursor-pointer'
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-[#6105b6]/20 flex items-center justify-center text-sm font-semibold">
                      {option.id.toUpperCase()}
                    </span>
                    <span>{option.text}</span>
                  </span>
                </button>
              ))}
            </div>
            
            {!answerClickable && countdown > 0 && (
              <div className="mt-8 text-center">
                <div className="text-4xl font-bold text-[#6105b6]">
                  {countdown}
                </div>
                <p className="text-sm text-[#f8f6f1]/60 mt-2">
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