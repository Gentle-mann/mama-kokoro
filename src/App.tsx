import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Chat from './pages/Chat';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import Screening from './pages/Screening';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, needsOnboarding } = useAuthStore();
  const location = useLocation();
  const exemptPaths = ['/onboarding', '/login', '/register'];

  if (isAuthenticated && needsOnboarding() && !exemptPaths.includes(location.pathname)) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function App() {
  const { token, clearAuth } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          clearAuth();
        }
      })
      .catch(() => {
        clearAuth();
      });
    }
  }, [token, clearAuth]);

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main className="pt-14">
        <OnboardingGuard>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/mood" element={<MoodTracker />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/screening" element={<Screening />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </OnboardingGuard>
      </main>
    </div>
  );
}

export default App;
