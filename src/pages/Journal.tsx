import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, Save, Heart, Cloud, Sun, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  gratitude: string;
  createdAt: Date;
}

const journalPrompts = [
  "What made you smile today, even for a moment?",
  "What's one thing you did well as a mother today?",
  "How did your body feel today? What does it need?",
  "What support would feel helpful right now?",
  "What's something kind you can say to yourself today?",
  "What's one small thing you're looking forward to?",
  "Describe a moment with your baby that touched your heart.",
  "What emotion is strongest right now? Can you sit with it gently?",
];

export default function Journal() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(
    journalPrompts[Math.floor(Math.random() * journalPrompts.length)]
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  const moods = [
    { label: 'Grateful', emoji: '🙏', value: 'grateful' },
    { label: 'Peaceful', emoji: '🕊️', value: 'peaceful' },
    { label: 'Tired', emoji: '😴', value: 'tired' },
    { label: 'Anxious', emoji: '😟', value: 'anxious' },
    { label: 'Hopeful', emoji: '🌱', value: 'hopeful' },
    { label: 'Overwhelmed', emoji: '🌊', value: 'overwhelmed' },
  ];

  const handleSave = () => {
    if (!content.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      content,
      mood: selectedMood,
      gratitude,
      createdAt: new Date(),
    };

    setEntries([entry, ...entries]);
    setContent('');
    setGratitude('');
    setSelectedMood('');
    setIsWriting(false);
    setCurrentPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);

    // Store in memU via API
    const { token } = useAuthStore.getState();
    if (token) {
      fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: entry.content, mood: entry.mood, gratitude: entry.gratitude }),
      }).catch(() => {});
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-peach-50 pt-20 pb-8">
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
              <h1 className="text-xl font-bold text-gray-800">Journal</h1>
              <p className="text-xs text-gray-500">A safe space for your thoughts</p>
            </div>
          </div>
          {!isWriting && (
            <button
              onClick={() => setIsWriting(true)}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-peach-200 to-peach-300 text-peach-500 rounded-xl font-semibold text-sm hover:shadow-md transition-all"
            >
              <Plus size={16} />
              New Entry
            </button>
          )}
        </div>

        {/* Writing Mode */}
        {isWriting && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-peach-100 mb-6">
            {/* Prompt */}
            <div className="bg-lavender-50 rounded-2xl p-4 mb-4 border border-lavender-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-lavender-400" />
                <span className="text-xs font-medium text-lavender-500">Today's prompt</span>
              </div>
              <p className="text-sm text-lavender-700 italic">"{currentPrompt}"</p>
            </div>

            {/* Mood Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedMood === mood.value
                        ? 'bg-lavender-200 text-lavender-700 border-2 border-lavender-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {mood.emoji} {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block">What's on your mind?</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely... this is your safe space."
                className="w-full h-32 p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-300 resize-none text-sm"
              />
            </div>

            {/* Gratitude */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block flex items-center gap-1">
                <Heart className="w-3 h-3 text-peach-400" />
                One thing you're grateful for (optional)
              </label>
              <input
                type="text"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Even the smallest thing counts..."
                className="w-full p-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-peach-200 text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsWriting(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim()}
                className="flex-1 bg-gradient-to-r from-peach-300 to-peach-400 text-white py-3 rounded-2xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Entry
              </button>
            </div>
          </div>
        )}

        {/* Entries List */}
        {entries.length === 0 && !isWriting ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-peach-100 text-center">
            <BookOpen className="w-12 h-12 text-peach-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your journal is empty</h3>
            <p className="text-sm text-gray-500 mb-4">
              Journaling can help process emotions and track your wellbeing over time.
            </p>
            <button
              onClick={() => setIsWriting(true)}
              className="bg-gradient-to-r from-peach-200 to-peach-300 text-peach-500 px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-md transition-all"
            >
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDate(entry.createdAt)}
                  </span>
                  {entry.mood && (
                    <span className="text-xs bg-lavender-50 text-lavender-600 px-2 py-1 rounded-full font-medium">
                      {moods.find((m) => m.value === entry.mood)?.emoji}{' '}
                      {moods.find((m) => m.value === entry.mood)?.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{entry.content}</p>
                {entry.gratitude && (
                  <div className="mt-3 bg-peach-50 rounded-xl p-3 border border-peach-100">
                    <p className="text-xs text-peach-500 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Grateful for: {entry.gratitude}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
