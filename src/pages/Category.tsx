import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Users, BookOpen, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import ChatInterface from '../components/ChatInterface';

const categoryData = {
  living: {
    emoji: '🏠',
    title: 'Living in Japan',
    description: 'Everything you need to know about housing, utilities, and daily life',
    color: 'from-pink-100 to-pink-200',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-300',
    bgGradient: 'from-pink-50 via-white to-pink-100',
    topics: [
      'Address Registration (住民票)',
      'Finding Apartments',
      'Utilities Setup',
      'Neighborhood Rules',
      'Garbage Disposal',
      'Moving Procedures'
    ],
    tips: [
      'Register your address within 14 days of moving',
      'Keep your residence card updated',
      'Learn your local garbage schedule'
    ]
  },
  mobile: {
    emoji: '📱',
    title: 'Mobile & Internet',
    description: 'Phone contracts, SIM cards, and staying connected',
    color: 'from-blue-100 to-blue-200',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    bgGradient: 'from-blue-50 via-white to-blue-100',
    topics: [
      'Choosing a Carrier',
      'SIM Card Options',
      'Contract Requirements',
      'Internet Setup',
      'Mobile Payment Apps',
      'International Calling'
    ],
    tips: [
      'Bring your bank account info to the store',
      'Consider prepaid options first',
      'Many stores offer English support'
    ]
  },
  banking: {
    emoji: '💰',
    title: 'Banking & Finance',
    description: 'Bank accounts, payments, and financial services',
    color: 'from-green-100 to-green-200',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    bgGradient: 'from-green-50 via-white to-green-100',
    topics: [
      'Opening Bank Accounts',
      'Credit Cards',
      'ATM Usage',
      'Online Banking',
      'Money Transfers',
      'Tax Procedures'
    ],
    tips: [
      'Japan Post Bank is foreigner-friendly',
      'Bring a Japanese speaker if possible',
      'Cash is still king in many places'
    ]
  },
  'city-hall': {
    emoji: '🧾',
    title: 'City Hall Procedures',
    description: 'Official documents, certificates, and government services',
    color: 'from-purple-100 to-purple-200',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    bgGradient: 'from-purple-50 via-white to-purple-100',
    topics: [
      'Residence Registration',
      'Health Insurance',
      'Pension Enrollment',
      'Certificate Requests',
      'Tax Registration',
      'Voting Registration'
    ],
    tips: [
      'Bring all required documents',
      'Take a number and wait patiently',
      'Many offices have multilingual support'
    ]
  },
  language: {
    emoji: '💬',
    title: 'Language Learning',
    description: 'Japanese language skills and communication',
    color: 'from-yellow-100 to-yellow-200',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    bgGradient: 'from-yellow-50 via-white to-yellow-100',
    topics: [
      'Basic Phrases',
      'Hiragana & Katakana',
      'Kanji Learning',
      'Polite Language (Keigo)',
      'Business Japanese',
      'Language Exchange'
    ],
    tips: [
      'Start with basic greetings',
      'Practice daily conversations',
      'Join local language classes'
    ]
  },
  culture: {
    emoji: '🎌',
    title: 'Japanese Culture',
    description: 'Customs, etiquette, and social norms',
    color: 'from-red-100 to-red-200',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    bgGradient: 'from-red-50 via-white to-red-100',
    topics: [
      'Bowing Etiquette',
      'Business Cards (Meishi)',
      'Gift Giving',
      'Seasonal Traditions',
      'Workplace Culture',
      'Social Interactions'
    ],
    tips: [
      'Observe and respect local customs',
      'Small gestures of politeness matter',
      'Participate in community events'
    ]
  }
};

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuthStore();
  const [showChat, setShowChat] = useState(false);

  const category = categoryData[categoryId as keyof typeof categoryData];

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (showChat) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowChat(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.emoji}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{category.title}</h1>
                <p className="text-sm text-gray-600">AI Chat Assistant</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${category.bgGradient}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-6xl">{category.emoji}</span>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">{category.title}</h1>
                <p className="text-lg text-gray-600 mt-2">{category.description}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {user ? (
              <button
                onClick={() => setShowChat(true)}
                className={`flex items-center gap-2 bg-gradient-to-r ${category.color} ${category.textColor} px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 ${category.borderColor}`}
              >
                <MessageCircle size={20} />
                Ask ByteFriend
              </button>
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-2 bg-gradient-to-r ${category.color} ${category.textColor} px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 ${category.borderColor}`}
              >
                <MessageCircle size={20} />
                Login to Chat
              </Link>
            )}
            <Link
              to="/community"
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 transform hover:scale-105"
            >
              <Users size={20} />
              Community Tips
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Topics */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BookOpen className="text-blue-600" />
                Common Topics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.topics.map((topic, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${category.color} p-4 rounded-2xl border-2 ${category.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105`}
                    onClick={() => user && setShowChat(true)}
                  >
                    <h3 className={`font-semibold ${category.textColor} mb-1`}>
                      {topic}
                    </h3>
                    <p className={`text-sm ${category.textColor} opacity-80`}>
                      Click to ask ByteFriend
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Sparkles className="text-purple-600" />
                AI-Powered Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MessageCircle className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Smart Responses</h3>
                    <p className="text-sm text-gray-600">Get personalized advice based on your specific situation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <span className="text-pink-600 text-lg">🎌</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Cultural Context</h3>
                    <p className="text-sm text-gray-600">Understand the cultural reasons behind procedures</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <span className="text-green-600 text-lg">🔊</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Audio Pronunciation</h3>
                    <p className="text-sm text-gray-600">Hear correct Japanese pronunciations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-purple-600 text-lg">🖼️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Visual Guides</h3>
                    <p className="text-sm text-gray-600">See AI-generated illustrations for clarity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                💡 Quick Tips
              </h3>
              <div className="space-y-3">
                {category.tips.map((tip, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${category.color} p-3 rounded-xl border ${category.borderColor}`}
                  >
                    <p className={`text-sm ${category.textColor} font-medium`}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Info */}
            <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-3xl p-6 shadow-lg border-2 border-red-300">
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                🚨 Need Help?
              </h3>
              <div className="space-y-2 text-sm text-red-700">
                <p><strong>Police:</strong> 110</p>
                <p><strong>Fire/Ambulance:</strong> 119</p>
                <p><strong>Tourist Hotline:</strong> 050-3816-2787</p>
              </div>
            </div>

            {/* Related Categories */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Related Categories
              </h3>
              <div className="space-y-2">
                {Object.entries(categoryData)
                  .filter(([id]) => id !== categoryId)
                  .slice(0, 3)
                  .map(([id, cat]) => (
                    <Link
                      key={id}
                      to={`/category/${id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="font-medium text-gray-700">{cat.title}</span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}