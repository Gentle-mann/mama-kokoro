import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import ChatInterface from '../components/ChatInterface';

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-lavender-100 p-3 pt-16">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-lavender-50 rounded-full transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-lavender-300 to-peach-200 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">Kokoro</h1>
              <p className="text-xs text-gray-500">Your gentle companion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
