import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Cloud, CloudRain, Zap, Meh, Plus, TrendingUp, Calendar } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface MoodEntry {
  id: string;
  value: number;
  label: string;
  note: string;
  sleep: number;
  createdAt: Date;
}

const moodOptions = [
  { value: 5, label: 'Great', icon: Sun, color: 'text-sage-500', bg: 'bg-sage-100', border: 'border-sage-200' },
  { value: 4, label: 'Good', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 3, label: 'Okay', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { value: 2, label: 'Low', icon: CloudRain, color: 'text-lavender-500', bg: 'bg-lavender-50', border: 'border-lavender-200' },
  { value: 1, label: 'Struggling', icon: Zap, color: 'text-peach-500', bg: 'bg-peach-50', border: 'border-peach-200' },
];

const phq2Questions = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
];

export default function MoodTracker() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [sleepHours, setSleepHours] = useState(6);
  const [showPHQ2, setShowPHQ2] = useState(false);
  const [phq2Answers, setPhq2Answers] = useState<number[]>([0, 0]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSaveMood = async () => {
    if (selectedMood === null) return;

    const mood = moodOptions.find((m) => m.value === selectedMood);
    const entry: MoodEntry = {
      id: Date.now().toString(),
      value: selectedMood,
      label: mood?.label || '',
      note,
      sleep: sleepHours,
      createdAt: new Date(),
    };

    setEntries([entry, ...entries]);
    setSelectedMood(null);
    setNote('');
    setSleepHours(6);
    setIsAdding(false);

    // Store in memU via API
    const { token } = useAuthStore.getState();
    if (token) {
      fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: entry.value, label: entry.label, note: entry.note, sleep: entry.sleep }),
      }).catch(() => {});
    }

    // PHQ-2 trigger: show every 3rd entry or if mood is low
    if (selectedMood <= 2 || entries.length % 3 === 2) {
      setShowPHQ2(true);
    }
  };

  const phq2Total = phq2Answers.reduce((a, b) => a + b, 0);
  const shouldSuggestEPDS = phq2Total >= 3;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const averageMood = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.value, 0) / entries.length).toFixed(1)
    : '--';

  const averageSleep = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length).toFixed(1)
    : '--';

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 pt-20 pb-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mood Tracker</h1>
              <p className="text-xs text-gray-500">Track how you feel over time</p>
            </div>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-sage-200 to-sage-300 text-sage-500 rounded-xl font-semibold text-sm hover:shadow-md transition-all"
            >
              <Plus size={16} />
              Log Mood
            </button>
          )}
        </div>

        {/* PHQ-2 Quick Screen Overlay */}
        {showPHQ2 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-lavender-100 mb-6">
            <h3 className="font-bold text-gray-800 mb-1">Quick Check-in (PHQ-2)</h3>
            <p className="text-xs text-gray-500 mb-4">Over the last 2 weeks, how often have you been bothered by:</p>

            {phq2Questions.map((q, i) => (
              <div key={i} className="mb-4">
                <p className="text-sm text-gray-700 mb-2">{q}</p>
                <div className="flex gap-2">
                  {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((label, score) => (
                    <button
                      key={score}
                      onClick={() => {
                        const newAnswers = [...phq2Answers];
                        newAnswers[i] = score;
                        setPhq2Answers(newAnswers);
                      }}
                      className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                        phq2Answers[i] === score
                          ? 'bg-lavender-200 text-lavender-700 border-2 border-lavender-300'
                          : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {shouldSuggestEPDS && (
              <div className="bg-peach-50 rounded-2xl p-4 border border-peach-200 mb-4">
                <p className="text-sm text-peach-500 font-medium">
                  Based on your responses, we recommend taking the full EPDS self-check for a more complete picture.
                </p>
                <button
                  onClick={() => { setShowPHQ2(false); navigate('/screening'); }}
                  className="mt-2 bg-peach-200 text-peach-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-peach-300 transition-all"
                >
                  Take EPDS Self-Check
                </button>
              </div>
            )}

            <button
              onClick={() => {
                // Store PHQ-2 in memU via API
                const { token } = useAuthStore.getState();
                if (token) {
                  fetch('/api/mood/phq2', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ answers: phq2Answers, total: phq2Total }),
                  }).catch(() => {});
                }
                setShowPHQ2(false);
              }}
              className="w-full bg-gray-100 text-gray-600 py-2 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        )}

        {/* Stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/80 rounded-2xl p-4 text-center border border-gray-100">
              <TrendingUp className="w-5 h-5 text-sage-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">{averageMood}</div>
              <div className="text-xs text-gray-500">Avg Mood</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 text-center border border-gray-100">
              <Calendar className="w-5 h-5 text-lavender-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">{entries.length}</div>
              <div className="text-xs text-gray-500">Entries</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 text-center border border-gray-100">
              <Cloud className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">{averageSleep}h</div>
              <div className="text-xs text-gray-500">Avg Sleep</div>
            </div>
          </div>
        )}

        {/* Add Mood Form */}
        {isAdding && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-sage-100 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">How are you feeling?</h3>

            <div className="flex justify-center gap-3 mb-5">
              {moodOptions.map((mood) => {
                const Icon = mood.icon;
                return (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all min-w-[60px] ${
                      selectedMood === mood.value
                        ? `${mood.bg} ${mood.border} ${mood.color} scale-110 shadow-md`
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium mt-1">{mood.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sleep tracker */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Hours of sleep last night: <span className="font-bold text-lavender-500">{sleepHours}h</span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-lavender-400"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
              </div>
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block">Quick note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's happening in your world right now?"
                className="w-full h-20 p-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sage-200 resize-none text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setIsAdding(false); setSelectedMood(null); }}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMood}
                disabled={selectedMood === null}
                className="flex-1 bg-gradient-to-r from-sage-300 to-sage-400 text-white py-3 rounded-2xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Entries List */}
        {entries.length === 0 && !isAdding ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-sage-100 text-center">
            <TrendingUp className="w-12 h-12 text-sage-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Start tracking your mood</h3>
            <p className="text-sm text-gray-500 mb-4">
              Regular mood tracking helps you understand patterns and share meaningful data with your care team.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-gradient-to-r from-sage-200 to-sage-300 text-sage-500 px-6 py-2 rounded-xl font-semibold text-sm"
            >
              Log Your First Mood
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const mood = moodOptions.find((m) => m.value === entry.value);
              const Icon = mood?.icon || Meh;
              return (
                <div
                  key={entry.id}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border ${mood?.border || 'border-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${mood?.bg || 'bg-gray-50'}`}>
                      <Icon className={`w-5 h-5 ${mood?.color || 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-sm ${mood?.color || 'text-gray-600'}`}>
                          {mood?.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(entry.createdAt)} {formatTime(entry.createdAt)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Sleep: {entry.sleep}h
                      </div>
                      {entry.note && (
                        <p className="text-xs text-gray-600 mt-1">{entry.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
