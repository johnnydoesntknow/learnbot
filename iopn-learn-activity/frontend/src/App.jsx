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
      
      console.log('🔍 Initializing app with params:', { 
        hasToken: !!token, 
        hasUserId: !!user_id, 
        hasUsername: !!username 
      });
      
      // PRIORITIZE TOKEN FIRST - IT HAS ALL THE DATA INCLUDING AVATAR!
      if (token) {
        try {
          // Decode JWT to get full user data including avatar
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const tokenData = JSON.parse(jsonPayload);
          console.log('✅ Token decoded successfully');
          
          // Use token data which includes avatar!
          setUser({
            userId: tokenData.userId,
            username: tokenData.username,
            avatar: tokenData.avatar  // This will have your avatar hash!
          });
          
          // KEEP THIS - needed for API authentication
          localStorage.setItem('user_token', token);
          
          setLoading(false);
          return;
          
        } catch (decodeError) {
          console.error('Failed to decode token, falling back to URL params:', decodeError);
        }
      }
      
      // FALLBACK: Only use URL params if token decode failed
      if (user_id && username) {
        console.log('Using URL params fallback (no avatar available)');
        setUser({
          userId: user_id,
          username: decodeURIComponent(username),
          avatar: null  // URL params don't include avatar
        });
        
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
          console.log('Using saved session');
          
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
      console.error('Error initializing app:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  
  if (!user) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center flex-col p-6">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-bold text-white mb-4">
            IOPn Learn
          </h1>
          <p className="text-white/60 text-lg mb-8">
            Please use the /learn command in Discord to access this platform
          </p>
          
          {/* Mobile hint */}
          {isMobile && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-sm text-white/50">
                📱 Mobile detected: Make sure Discord opens links in your browser
              </p>
            </div>
          )}
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