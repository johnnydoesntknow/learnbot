// frontend/src/pages/LessonView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateActivity } from '../utils/discord';
import LoadingScreen from '../components/common/LoadingScreen';

const LessonView = ({ user }) => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [contentCompleted, setContentCompleted] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  
  useEffect(() => {
    // Fetch lesson content from backend
    const fetchLessonContent = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/lesson/${lessonId}/content`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setLesson({
          title: data.title,
          type: data.contentType,
          content: data.mediaPath,
          duration: data.duration
        });
        
        updateActivity('Viewing Lesson', data.title);
      } catch (error) {
        console.error('Failed to fetch lesson content:', error);
        // Fallback content
        setLesson({
          title: 'Lesson ' + lessonId.split('-')[1],
          type: 'text',
          content: 'Content temporarily unavailable. Please try again.',
          duration: '5 min'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonContent();
  }, [lessonId]);

  // Auto-complete for text/single images after delay
  useEffect(() => {
    if (lesson && lesson.type === 'image') {
      const timer = setTimeout(() => setContentCompleted(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [lesson]);

  const handleVideoProgress = (e) => {
    const video = e.target;
    const progress = (video.currentTime / video.duration) * 100;
    setVideoProgress(progress);
    
    // Mark complete when 90% watched
    if (progress >= 90 && !contentCompleted) {
      setContentCompleted(true);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < lesson.content.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setContentCompleted(true);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleTakeQuiz = () => {
    navigate(`/quiz/${lessonId}`);
  };

  if (loading) return <LoadingScreen />;
  if (!lesson) return null;

  return (
    <div className="min-h-screen p-6 bg-[#0a0a0b]">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-white/60 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
        
        <h1 className="text-3xl font-bold text-white mb-6">
          {lesson.title}
        </h1>
        
        <div className="bg-[#1a1a1f]/90 backdrop-blur-sm rounded-xl p-8 border border-[#6105b6]/20 mb-8">
          
          {/* VIDEO CONTENT */}
          {lesson.type === 'video' && (
            <div className="space-y-4">
              <video 
                controls
                className="w-full rounded-lg"
                onTimeUpdate={handleVideoProgress}
                onEnded={() => setContentCompleted(true)}
              >
                <source src={lesson.content} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#6105b6] to-[#2280cd] h-2 rounded-full transition-all"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              
              {!contentCompleted && (
                <p className="text-sm text-white/50 text-center">
                  ⏱️ Watch at least 90% of the video to unlock the quiz...
                </p>
              )}
            </div>
          )}
          
          {/* SINGLE IMAGE */}
          {lesson.type === 'image' && (
            <div className="space-y-4">
              <img 
                src={lesson.content} 
                alt={lesson.title}
                className="w-full rounded-lg"
              />
              {!contentCompleted && (
                <p className="text-sm text-white/50 text-center">
                  ⏱️ Review the content above. Quiz unlocks in 10 seconds...
                </p>
              )}
            </div>
          )}
          
          {/* MULTIPLE IMAGES (SLIDESHOW) */}
          {lesson.type === 'images' && Array.isArray(lesson.content) && (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={lesson.content[currentImageIndex]} 
                  alt={`${lesson.title} - Slide ${currentImageIndex + 1}`}
                  className="w-full rounded-lg"
                />
                
                {/* Image counter */}
                <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
                  <span className="text-white text-sm">
                    {currentImageIndex + 1} / {lesson.content.length}
                  </span>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevImage}
                  disabled={currentImageIndex === 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentImageIndex === 0
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-[#6105b6]/80 text-white hover:bg-[#6105b6]'
                  }`}
                >
                  ← Previous
                </button>
                
                <div className="flex gap-2">
                  {lesson.content.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-[#6105b6] w-6' 
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={handleNextImage}
                  className="px-4 py-2 bg-[#6105b6]/80 text-white rounded-lg font-semibold hover:bg-[#6105b6] transition-all"
                >
                  {currentImageIndex === lesson.content.length - 1 ? 'Complete' : 'Next →'}
                </button>
              </div>
            </div>
          )}
          
          {/* FALLBACK TEXT CONTENT */}
          {lesson.type === 'text' && (
            <div className="text-white/80">
              <p>{lesson.content}</p>
              {!contentCompleted && (
                <div className="mt-6 text-sm text-white/50">
                  ⏱️ Please review the content completely to unlock the quiz...
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Take Quiz Button */}
        <div className="text-center">
          <button
            onClick={handleTakeQuiz}
            disabled={!contentCompleted}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
              contentCompleted
                ? 'bg-gradient-to-r from-[#6105b6] to-[#2280cd] text-white hover:scale-105'
                : 'bg-[#1a1a1f]/50 text-white/50 cursor-not-allowed'
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