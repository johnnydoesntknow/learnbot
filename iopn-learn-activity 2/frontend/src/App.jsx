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
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // AGGRESSIVE DEBUGGING
      const fullUrl = window.location.href;
      const searchParams = window.location.search;
      const hashParams = window.location.hash;
      
      console.log('🌐 FULL URL:', fullUrl);
      console.log('❓ Search params:', searchParams);
      console.log('#️⃣ Hash params:', hashParams);
      
      // Try multiple ways to get params
      const urlParams = new URLSearchParams(window.location.search);
      const hashUrlParams = new URLSearchParams(window.location.hash.replace('#', ''));
      
      // Check every possible place Discord might put data
      const token = urlParams.get('token') || 
                   hashUrlParams.get('token') || 
                   null;
                   
      const user_id = urlParams.get('user_id') || 
                     hashUrlParams.get('user_id') ||
                     urlParams.get('userId') ||
                     hashUrlParams.get('userId') ||
                     null;
                     
      const username = urlParams.get('username') || 
                      hashUrlParams.get('username') ||
                      null;
      
      console.log('🔍 PARSED DATA:', { token, user_id, username });
      
      // PRIORITIZE TOKEN FIRST - IT HAS ALL THE DATA INCLUDING AVATAR!
      if (token) {
        try {
          console.log('🔑 Attempting to decode token...');
          
          // Decode JWT to get full user data including avatar
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const tokenData = JSON.parse(jsonPayload);
          console.log('📦 Token decoded successfully:', tokenData);
          
          // Use token data which includes avatar!
          setUser({
            userId: tokenData.userId,
            username: tokenData.username,
            avatar: tokenData.avatar  // This will have your avatar hash!
          });
          
          localStorage.setItem('user_token', token);
          
          // Build debug string
          const debug = `
            URL: ${fullUrl}
            Token: DECODED ✅
            User ID: ${tokenData.userId}
            Username: ${tokenData.username}
            Avatar: ${tokenData.avatar || 'No custom avatar'}
          `;
          setDebugInfo(debug);
          
          setLoading(false);
          return;
          
        } catch (decodeError) {
          console.error('Failed to decode token, falling back to URL params:', decodeError);
        }
      }
      
      // FALLBACK: Only use URL params if token decode failed
      if (user_id && username) {
        console.log('✅ Using URL params fallback (no avatar available)');
        setUser({
          userId: user_id,
          username: decodeURIComponent(username),
          avatar: null  // URL params don't include avatar
        });
        
        const debug = `
          URL: ${fullUrl}
          Token: ${token ? 'Failed to decode' : 'Not found'}
          User ID: ${user_id}
          Username: ${username}
          Avatar: Not available via URL params
        `;
        setDebugInfo(debug);
        
        setLoading(false);
        return;
      }
      
      // Check saved session
      const savedToken = localStorage.getItem('user_token');
      if (!user && savedToken) {
        try {
          // Try to decode saved token
          const base64Url = savedToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const tokenData = JSON.parse(jsonPayload);
          console.log('📦 Saved token decoded:', tokenData);
          
          setUser({
            userId: tokenData.userId,
            username: tokenData.username,
            avatar: tokenData.avatar
          });
        } catch (err) {
          console.error('Failed to decode saved token:', err);
          localStorage.removeItem('user_token');
        }
      }
      
    } catch (err) {
      console.error('💥 Error:', err);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  
  if (!user) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <h1 style={{ 
          color: '#ffffff', 
          marginBottom: '16px', 
          fontSize: '2.5rem',
          textAlign: 'center' 
        }}>
          IOPn Learn
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          Please use the /learn command in Discord to access this platform
        </p>
        
        {/* DEBUG INFO BOX */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          maxWidth: '90%',
          wordBreak: 'break-all'
        }}>
          <p style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '10px' }}>
            Debug Info (Mobile: {isMobile ? 'Yes' : 'No'})
          </p>
          <pre style={{ 
            color: 'rgba(255,255,255,0.5)', 
            fontSize: '10px',
            whiteSpace: 'pre-wrap'
          }}>
            {debugInfo}
          </pre>
        </div>
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