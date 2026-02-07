import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Smile, Frown, Meh, BookOpen, Phone, Activity, Sun, Cloud, CloudRain, Zap, Moon } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const moodOptions = [
  { emoji: <Sun className="w-8 h-8" />, label: 'Great', value: 5, color: 'bg-sage-200 border-sage-300 text-sage-500' },
  { emoji: <Cloud className="w-8 h-8" />, label: 'Good', value: 4, color: 'bg-blue-100 border-blue-200 text-blue-500' },
  { emoji: <Meh className="w-8 h-8" />, label: 'Okay', value: 3, color: 'bg-cream-200 border-cream-300 text-yellow-600' },
  { emoji: <CloudRain className="w-8 h-8" />, label: 'Low', value: 2, color: 'bg-lavender-100 border-lavender-200 text-lavender-500' },
  { emoji: <Zap className="w-8 h-8" />, label: 'Struggling', value: 1, color: 'bg-peach-100 border-peach-200 text-peach-500' },
];

function getQuickActions(phase?: string) {
  const base = [
    {
      icon: <MessageCircle className="w-7 h-7" />,
      title: 'Talk to Kokoro',
      description: phase === 'pregnant' ? 'Your pregnancy companion' : 'Chat with your AI companion',
      path: '/chat',
      color: 'from-lavender-200 to-lavender-300',
      textColor: 'text-lavender-700',
      borderColor: 'border-lavender-300',
    },
    {
      icon: <Activity className="w-7 h-7" />,
      title: 'Mood Tracker',
      description: 'Track how you feel over time',
      path: '/mood',
      color: 'from-sage-100 to-sage-200',
      textColor: 'text-sage-500',
      borderColor: 'border-sage-300',
    },
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: 'Journal',
      description: 'Write your thoughts',
      path: '/journal',
      color: 'from-peach-100 to-peach-200',
      textColor: 'text-peach-500',
      borderColor: 'border-peach-300',
    },
  ];

  if (phase === 'pregnant') {
    base.push({
      icon: <Heart className="w-7 h-7" />,
      title: 'Pregnancy Check-in',
      description: 'Talk about how you feel',
      path: '/chat',
      color: 'from-pink-100 to-pink-200',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-300',
    });
  } else {
    base.push({
      icon: <Heart className="w-7 h-7" />,
      title: 'Self-Check',
      description: 'EPDS screening',
      path: '/screening',
      color: 'from-pink-100 to-pink-200',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-300',
    });
  }

  base.push(
    {
      icon: <Phone className="w-7 h-7" />,
      title: 'Resources',
      description: 'Help & crisis support',
      path: '/resources',
      color: 'from-blue-100 to-blue-200',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-300',
    },
    {
      icon: <Moon className="w-7 h-7" />,
      title: 'Sleep & Rest',
      description: 'Relaxation techniques',
      path: '/resources',
      color: 'from-indigo-100 to-indigo-200',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-300',
    },
  );

  return base;
}

export default function Home() {
  const { user } = useAuthStore();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
    setMoodSaved(true);
    setTimeout(() => setMoodSaved(false), 3000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-lavender-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-lavender-200/20 to-peach-200/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-lavender-500 via-pink-400 to-peach-400 bg-clip-text text-transparent">
                MamaKokoro
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-2">
              {user ? `${getGreeting()}, ${user.username}` : 'Your gentle companion through motherhood'}
            </p>
            <p className="text-base text-gray-500 max-w-xl mx-auto">
              {user?.phase === 'pregnant'
                ? "You're growing a whole human \u2014 that's incredible. Let's check in with how you're feeling."
                : "You're doing an amazing job. Let's take a moment to check in with yourself."}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Mood Check-in */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-lavender-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            How are you feeling right now?
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 min-w-[72px] ${
                  selectedMood === mood.value
                    ? `${mood.color} scale-110 shadow-md`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={selectedMood === mood.value ? '' : 'text-gray-400'}>
                  {mood.emoji}
                </div>
                <span className={`text-xs font-medium mt-1 ${
                  selectedMood === mood.value ? mood.color.split(' ')[2] : 'text-gray-500'
                }`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
          {moodSaved && (
            <p className="text-center text-sm text-sage-500 mt-3 font-medium animate-pulse">
              Thank you for checking in with yourself today
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {getQuickActions(user?.phase).map((action) => (
            <Link
              key={action.title}
              to={user ? action.path : '/login'}
              className="group"
            >
              <div className={`bg-gradient-to-br ${action.color} rounded-2xl p-5 border ${action.borderColor} hover:shadow-lg transition-all duration-300 transform hover:scale-105 h-full`}>
                <div className={`${action.textColor} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h3 className={`text-base font-bold ${action.textColor} mb-1`}>
                  {action.title}
                </h3>
                <p className={`text-xs ${action.textColor} opacity-75`}>
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Gentle Reminder */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-lavender-100 via-white to-peach-100 rounded-3xl p-6 border border-lavender-200">
          <div className="text-center">
            <p className="text-gray-600 text-sm leading-relaxed max-w-lg mx-auto">
              {user?.phase === 'pregnant'
                ? "Pregnancy can bring up complex emotions. Whether you're excited, nervous, or something in between \u2014 MamaKokoro is here for you."
                : "Postpartum feelings are real and valid. Whether you're having a good day or a hard one, MamaKokoro is here for you \u2014 no judgment, just support."}
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-lavender-400 to-lavender-500 text-white px-6 py-3 rounded-full font-semibold text-sm hover:shadow-lg transition-all duration-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/register"
                  className="bg-white/80 text-gray-600 px-6 py-3 rounded-full font-semibold text-sm border border-gray-200 hover:border-lavender-300 transition-all duration-200"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crisis Banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-peach-50 rounded-2xl p-4 border border-peach-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-peach-500" />
              <span className="text-sm text-gray-700">
                Need immediate support? <strong>Yorisoi Hotline: 0120-279-338</strong> (24/7, multilingual)
              </span>
            </div>
            <Link to="/resources" className="text-sm text-lavender-500 font-semibold hover:underline">
              More resources
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-lavender-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-peach-200 to-lavender-200 bg-clip-text text-transparent">
            MamaKokoro
          </h3>
          <p className="text-lavender-200 text-sm">
            A gentle AI companion for mothers. Built with care and clinical awareness.
          </p>
          <p className="text-lavender-300 text-xs mt-2">
            Not a substitute for professional medical advice. If you are in crisis, please contact emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}
