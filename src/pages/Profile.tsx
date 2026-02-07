import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Edit3, Save, X, LogOut, ArrowLeft, Heart, Activity, BookOpen, Sprout, Baby, PartyPopper } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, setUser, setPhase, token } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionBabyName, setTransitionBabyName] = useState('');
  const [transitionBabyAge, setTransitionBabyAge] = useState(0);
  const [editData, setEditData] = useState({
    name: user?.username || '',
    email: user?.email || '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    setUser({
      ...user,
      username: editData.name,
      email: editData.email,
    }, token || '');
    setIsEditing(false);
    toast.success('Profile updated');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-lavender-50 pt-20 pb-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-lavender-100 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-lavender-400 to-peach-300 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {user.username?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{user.username}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-300 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-300 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-lavender-400 to-lavender-500 text-white py-2.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-lavender-50 text-lavender-600 rounded-2xl font-medium text-sm hover:bg-lavender-100 transition-colors"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 bg-red-50 text-red-500 rounded-2xl font-medium text-sm hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Phase Card */}
        {user.phase === 'pregnant' && (
          <div className="bg-gradient-to-r from-sage-50 via-white to-peach-50 rounded-3xl p-6 shadow-lg border border-sage-200 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-sage-100 rounded-xl">
                <Sprout className="w-5 h-5 text-sage-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Currently: Pregnant</div>
                <div className="text-xs text-gray-500">
                  {user.pregnancyWeeks && `${user.pregnancyWeeks} weeks`}
                  {user.dueDate && ` \u00b7 Due: ${new Date(user.dueDate).toLocaleDateString()}`}
                </div>
              </div>
            </div>

            {!showTransition ? (
              <button
                onClick={() => setShowTransition(true)}
                className="w-full mt-3 bg-gradient-to-r from-lavender-400 to-peach-300 text-white py-3 rounded-2xl font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <PartyPopper className="w-4 h-4" />
                I've Had My Baby!
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block flex items-center gap-1">
                    <Baby className="w-3 h-3 text-lavender-400" /> Baby's name
                  </label>
                  <input
                    type="text"
                    value={transitionBabyName}
                    onChange={(e) => setTransitionBabyName(e.target.value)}
                    placeholder="What's your little one's name?"
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-300 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Baby's age: <span className="font-bold text-lavender-500">{transitionBabyAge} weeks</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={transitionBabyAge}
                    onChange={(e) => setTransitionBabyAge(parseInt(e.target.value))}
                    className="w-full accent-lavender-400"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTransition(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-2xl font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setPhase('postpartum', {
                        babyName: transitionBabyName || undefined,
                        babyAgeWeeks: transitionBabyAge,
                        pregnancyWeeks: undefined,
                        dueDate: undefined,
                      });
                      // Store transition in memU
                      if (token) {
                        fetch('/api/journal', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({
                            content: `Major life transition: Baby has arrived!${transitionBabyName ? ` Baby's name is ${transitionBabyName}.` : ''} Baby is ${transitionBabyAge} weeks old. Transitioning from pregnancy phase to postpartum support.`,
                            mood: 'hopeful',
                          }),
                        }).catch(() => {});
                      }
                      setShowTransition(false);
                      toast.success(`Congratulations! Kokoro is here for you in this new chapter.`);
                    }}
                    className="flex-1 bg-gradient-to-r from-lavender-400 to-peach-300 text-white py-2.5 rounded-2xl font-semibold text-sm"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {user.phase === 'postpartum' && (
          <div className="bg-gradient-to-r from-lavender-50 via-white to-peach-50 rounded-3xl p-5 shadow-lg border border-lavender-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lavender-100 rounded-xl">
                <Heart className="w-5 h-5 text-lavender-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">Postpartum Journey</div>
                <div className="text-xs text-gray-500">
                  {user.babyName && `${user.babyName} \u00b7 `}
                  {user.babyAgeWeeks !== undefined && `${user.babyAgeWeeks} weeks old`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-lavender-100">
          <h3 className="font-semibold text-gray-700 mb-4">Quick Access</h3>
          <div className="space-y-2">
            {user.phase === 'postpartum' ? (
              <button
                onClick={() => navigate('/screening')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-pink-50 rounded-2xl hover:bg-pink-100 transition-colors text-left"
              >
                <Heart className="w-5 h-5 text-pink-400" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Take EPDS Self-Check</div>
                  <div className="text-xs text-gray-500">Clinically validated screening</div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => navigate('/chat')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-pink-50 rounded-2xl hover:bg-pink-100 transition-colors text-left"
              >
                <Heart className="w-5 h-5 text-pink-400" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Talk to Kokoro</div>
                  <div className="text-xs text-gray-500">Your pregnancy companion</div>
                </div>
              </button>
            )}
            <button
              onClick={() => navigate('/mood')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-sage-50 rounded-2xl hover:bg-sage-100 transition-colors text-left"
            >
              <Activity className="w-5 h-5 text-sage-400" />
              <div>
                <div className="text-sm font-medium text-gray-700">Mood History</div>
                <div className="text-xs text-gray-500">Track patterns over time</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/journal')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-peach-50 rounded-2xl hover:bg-peach-100 transition-colors text-left"
            >
              <BookOpen className="w-5 h-5 text-peach-400" />
              <div>
                <div className="text-sm font-medium text-gray-700">Journal Entries</div>
                <div className="text-xs text-gray-500">Your private reflections</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
