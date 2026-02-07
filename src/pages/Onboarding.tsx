import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sprout, ArrowRight, Calendar, Baby } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

type Phase = 'pregnant' | 'postpartum';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setPhase } = useAuthStore();
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState(20);
  const [dueDate, setDueDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [babyAgeWeeks, setBabyAgeWeeks] = useState(0);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = () => {
    if (!selectedPhase) return;

    if (selectedPhase === 'pregnant') {
      setPhase('pregnant', { pregnancyWeeks, dueDate: dueDate || undefined });

      // Store pregnancy context in memU via API
      const { token } = useAuthStore.getState();
      if (token) {
        fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            content: `New mother onboarded during pregnancy at ${pregnancyWeeks} weeks.${dueDate ? ` Due date: ${dueDate}.` : ''} Beginning pregnancy companion journey.`,
            mood: 'hopeful',
          }),
        }).catch(() => {});
      }
    } else {
      setPhase('postpartum', { babyName: babyName || undefined, babyAgeWeeks });

      const { token } = useAuthStore.getState();
      if (token) {
        fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            content: `New mother onboarded postpartum.${babyName ? ` Baby's name: ${babyName}.` : ''} Baby is ${babyAgeWeeks} weeks old. Beginning postpartum companion journey.`,
            mood: 'hopeful',
          }),
        }).catch(() => {});
      }
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-lavender-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, {user.username}
          </h1>
          <p className="text-gray-500 text-sm">Let's personalize your experience with Kokoro</p>
        </div>

        {/* Phase Selection */}
        {!selectedPhase && (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600 font-medium mb-2">Where are you on your journey?</p>

            <button
              onClick={() => setSelectedPhase('pregnant')}
              className="w-full bg-gradient-to-br from-sage-50 to-sage-100 border-2 border-sage-200 rounded-3xl p-6 text-left hover:border-sage-400 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sage-200 rounded-2xl group-hover:bg-sage-300 transition-colors">
                  <Sprout className="w-7 h-7 text-sage-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">I'm Pregnant</h3>
                  <p className="text-gray-500 text-sm mt-0.5">Kokoro will support you through pregnancy and beyond</p>
                </div>
                <ArrowRight className="w-5 h-5 text-sage-400 ml-auto" />
              </div>
            </button>

            <button
              onClick={() => setSelectedPhase('postpartum')}
              className="w-full bg-gradient-to-br from-lavender-50 to-peach-50 border-2 border-lavender-200 rounded-3xl p-6 text-left hover:border-lavender-400 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-lavender-200 rounded-2xl group-hover:bg-lavender-300 transition-colors">
                  <Heart className="w-7 h-7 text-lavender-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">I've Had My Baby</h3>
                  <p className="text-gray-500 text-sm mt-0.5">Kokoro will help you navigate postpartum life</p>
                </div>
                <ArrowRight className="w-5 h-5 text-lavender-400 ml-auto" />
              </div>
            </button>
          </div>
        )}

        {/* Pregnant Details */}
        {selectedPhase === 'pregnant' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-sage-100">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedPhase(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                &larr; Back
              </button>
              <div className="p-2 bg-sage-100 rounded-xl">
                <Sprout className="w-5 h-5 text-sage-500" />
              </div>
              <h3 className="font-bold text-gray-800">Tell us about your pregnancy</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  How many weeks along are you? <span className="font-bold text-sage-500">{pregnancyWeeks} weeks</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="42"
                  value={pregnancyWeeks}
                  onChange={(e) => setPregnancyWeeks(parseInt(e.target.value))}
                  className="w-full accent-sage-400"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>4 weeks</span>
                  <span>20 weeks</span>
                  <span>42 weeks</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sage-400" />
                  Estimated due date (optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sage-200 text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 bg-gradient-to-r from-sage-300 to-sage-400 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Start My Journey
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Postpartum Details */}
        {selectedPhase === 'postpartum' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-lavender-100">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedPhase(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                &larr; Back
              </button>
              <div className="p-2 bg-lavender-100 rounded-xl">
                <Heart className="w-5 h-5 text-lavender-500" />
              </div>
              <h3 className="font-bold text-gray-800">Tell us about your baby</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block flex items-center gap-1">
                  <Baby className="w-3 h-3 text-lavender-400" />
                  Baby's name (optional)
                </label>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="What's your little one's name?"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-300 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  How old is your baby? <span className="font-bold text-lavender-500">{babyAgeWeeks} weeks</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="52"
                  value={babyAgeWeeks}
                  onChange={(e) => setBabyAgeWeeks(parseInt(e.target.value))}
                  className="w-full accent-lavender-400"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Newborn</span>
                  <span>6 months</span>
                  <span>1 year</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 bg-gradient-to-r from-lavender-400 to-lavender-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Start My Journey
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
