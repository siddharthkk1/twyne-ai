
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuth();

  useEffect(() => {
    // Simple redirect to home after a short delay to let auth settle
    const timer = setTimeout(() => {
      console.log('Auth callback complete, redirecting to home');
      navigate('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
