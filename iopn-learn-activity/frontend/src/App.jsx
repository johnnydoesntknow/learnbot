// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LessonView from './pages/LessonView';
import QuizView from './pages/QuizView';
import LoadingScreen from './components/common/LoadingScreen';
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check URL for token from Discord
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // User came from Discord with token
        const response = await fetch('http://localhost:3001/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user_token', token);
        }
      } else {
        // Check for saved session
        const savedToken = localStorage.getItem('user_token');
        if (savedToken) {
          const response = await fetch('http://localhost:3001/api/verify-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: savedToken })
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        }
      }
    } catch (err) {
      // Silent fail - no console spam
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  
  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h1 style={{ color: '#ffffff', marginBottom: '16px' }}>IOPn Learn</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Please use the /learn command in Discord to access this platform
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/lesson/:lessonId" element={<LessonView user={user} />} />
        <Route path="/quiz/:lessonId" element={<QuizView user={user} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;