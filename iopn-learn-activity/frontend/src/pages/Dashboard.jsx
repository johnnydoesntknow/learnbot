// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateActivity, closeActivity } from '../utils/discord';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
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
  }, []);

  const handleStartLesson = (lessonId, lessonTitle) => {
    updateActivity('Starting Lesson', lessonTitle);
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
          Welcome back
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          {user.username} • Continue your journey in the IOPn ecosystem
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ 
          background: '#1a1a1f', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '12px', 
          padding: '20px' 
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '8px' }}>
            Total REP Points
          </p>
          <p style={{ fontSize: '28px', fontWeight: '600', color: '#6105b6' }}>0</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }}>
            +0 from yesterday
          </p>
        </div>

        <div style={{ 
          background: '#1a1a1f', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '12px', 
          padding: '20px' 
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '8px' }}>
            Lessons Completed
          </p>
          <p style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff' }}>0/3</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }}>
            0% complete
          </p>
        </div>

        <div style={{ 
          background: '#1a1a1f', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '12px', 
          padding: '20px' 
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '8px' }}>
            Current Streak
          </p>
          <p style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff' }}>0</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }}>
            days
          </p>
        </div>
      </div>

      {/* Lessons Section */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
          📚 Available Lessons
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              style={{ 
                background: '#1a1a1f', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '12px', 
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>
                  {lesson.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  {lesson.description}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  <span>📹 {lesson.type}</span>
                  <span>⏱ {lesson.duration}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleStartLesson(lesson.id, lesson.title)}
                style={{
                  background: '#6105b6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#7a1cc7'}
                onMouseLeave={(e) => e.target.style.background = '#6105b6'}
              >
                Start
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;