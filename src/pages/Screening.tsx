import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, AlertTriangle, Phone, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

// Submit EPDS results to memU via API
function submitEPDSResult(answers: number[], totalScore: number, item10Score: number, crisisLevel: string) {
  const { token } = useAuthStore.getState();
  if (token) {
    fetch('/api/screening/epds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers, totalScore, item10Score, crisisLevel }),
    }).catch(() => {});
  }
}

const epdsQuestions = [
  {
    id: 1,
    question: 'I have been able to laugh and see the funny side of things',
    options: [
      { label: 'As much as I always could', score: 0 },
      { label: 'Not quite so much now', score: 1 },
      { label: 'Definitely not so much now', score: 2 },
      { label: 'Not at all', score: 3 },
    ],
  },
  {
    id: 2,
    question: 'I have looked forward with enjoyment to things',
    options: [
      { label: 'As much as I ever did', score: 0 },
      { label: 'Rather less than I used to', score: 1 },
      { label: 'Definitely less than I used to', score: 2 },
      { label: 'Hardly at all', score: 3 },
    ],
  },
  {
    id: 3,
    question: 'I have blamed myself unnecessarily when things went wrong',
    options: [
      { label: 'No, never', score: 0 },
      { label: 'Not very often', score: 1 },
      { label: 'Yes, some of the time', score: 2 },
      { label: 'Yes, most of the time', score: 3 },
    ],
  },
  {
    id: 4,
    question: 'I have been anxious or worried for no good reason',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'Hardly ever', score: 1 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'Yes, very often', score: 3 },
    ],
  },
  {
    id: 5,
    question: 'I have felt scared or panicky for no very good reason',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'No, not much', score: 1 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'Yes, quite a lot', score: 3 },
    ],
  },
  {
    id: 6,
    question: 'Things have been getting on top of me',
    options: [
      { label: 'No, I have been coping as well as ever', score: 0 },
      { label: 'No, most of the time I have coped quite well', score: 1 },
      { label: 'Yes, sometimes I haven\'t been coping as well as usual', score: 2 },
      { label: 'Yes, most of the time I haven\'t been able to cope at all', score: 3 },
    ],
  },
  {
    id: 7,
    question: 'I have been so unhappy that I have had difficulty sleeping',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'Not very often', score: 1 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'Yes, most of the time', score: 3 },
    ],
  },
  {
    id: 8,
    question: 'I have felt sad or miserable',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'Not very often', score: 1 },
      { label: 'Yes, quite often', score: 2 },
      { label: 'Yes, most of the time', score: 3 },
    ],
  },
  {
    id: 9,
    question: 'I have been so unhappy that I have been crying',
    options: [
      { label: 'No, never', score: 0 },
      { label: 'Only occasionally', score: 1 },
      { label: 'Yes, quite often', score: 2 },
      { label: 'Yes, most of the time', score: 3 },
    ],
  },
  {
    id: 10,
    question: 'The thought of harming myself has occurred to me',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Hardly ever', score: 1 },
      { label: 'Sometimes', score: 2 },
      { label: 'Yes, quite often', score: 3 },
    ],
  },
];

type CrisisLevel = 'green' | 'yellow' | 'orange' | 'red';

function getCrisisLevel(totalScore: number, item10Score: number): CrisisLevel {
  if (item10Score >= 2) return 'red';
  if (totalScore >= 13) return 'orange';
  if (totalScore >= 9) return 'yellow';
  return 'green';
}

export default function Screening() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(10).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);

    if (currentQuestion < 9) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handleSubmit = () => {
    if (answers.every((a) => a !== null)) {
      setShowResults(true);
      const total = answers.reduce((sum, a) => sum + (a || 0), 0);
      const i10 = answers[9] || 0;
      submitEPDSResult(answers as number[], total, i10, getCrisisLevel(total, i10));
    }
  };

  const totalScore = answers.reduce((sum, a) => sum + (a || 0), 0);
  const item10Score = answers[9] || 0;
  const crisisLevel = getCrisisLevel(totalScore, item10Score);
  const progress = ((currentQuestion + 1) / 10) * 100;

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-lavender-50 pt-20 pb-8">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-lavender-100">
            <div className="text-center mb-6">
              <Heart className="w-12 h-12 text-lavender-400 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Self-Check (EPDS)</h1>
              <p className="text-gray-600 text-sm">Edinburgh Postnatal Depression Scale</p>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <p>
                This is a widely used, clinically validated screening tool.
                It helps identify mothers who may be experiencing postpartum depression.
              </p>
              <div className="bg-lavender-50 rounded-2xl p-4 border border-lavender-100">
                <p className="font-medium text-lavender-700 mb-2">What to expect:</p>
                <ul className="space-y-1 text-lavender-600">
                  <li>10 short questions</li>
                  <li>Takes about 2-3 minutes</li>
                  <li>Think about how you've felt in the past 7 days</li>
                  <li>There are no right or wrong answers</li>
                </ul>
              </div>
              <div className="bg-peach-50 rounded-2xl p-4 border border-peach-200">
                <p className="text-peach-500 text-xs">
                  This screening is not a diagnosis. It's a helpful tool to understand how you're feeling.
                  Always consult a healthcare professional for proper evaluation.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full mt-6 bg-gradient-to-r from-lavender-400 to-lavender-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Begin Self-Check
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-lavender-50 pt-20 pb-8">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-lavender-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Results</h1>
              <p className="text-gray-500 text-sm">Score: {totalScore} / 30</p>
            </div>

            {/* Crisis Level Display */}
            {crisisLevel === 'green' && (
              <div className="bg-sage-50 border-2 border-sage-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-sage-500" />
                  <h3 className="font-bold text-sage-500">Low Risk</h3>
                </div>
                <p className="text-sage-500 text-sm">
                  Your score suggests you're coping well. Keep taking care of yourself.
                  It's still good to maintain your support network and check in regularly.
                </p>
              </div>
            )}

            {crisisLevel === 'yellow' && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <h3 className="font-bold text-yellow-700">Mild Concern</h3>
                </div>
                <p className="text-yellow-700 text-sm">
                  Your score indicates some difficulty. This is common and treatable.
                  Consider talking to your healthcare provider at your next visit.
                  Self-care strategies like rest, support, and talking to someone you trust can help.
                </p>
              </div>
            )}

            {crisisLevel === 'orange' && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-orange-700">Moderate Concern</h3>
                </div>
                <p className="text-orange-700 text-sm">
                  Your score suggests you may benefit from professional support.
                  Please consider scheduling an appointment with your doctor or a mental health professional soon.
                  You deserve support, and help is available.
                </p>
              </div>
            )}

            {crisisLevel === 'red' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-6 h-6 text-red-600" />
                  <h3 className="font-bold text-red-700">Please Reach Out Now</h3>
                </div>
                <p className="text-red-700 text-sm mb-4">
                  Your responses indicate you may be having thoughts of self-harm.
                  You are not alone, and help is available right now.
                </p>
                <div className="space-y-2">
                  <a href="tel:0120-279-338" className="flex items-center gap-2 bg-red-100 rounded-xl p-3 hover:bg-red-200 transition-colors">
                    <Phone className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-bold text-red-700 text-sm">Yorisoi Hotline</div>
                      <div className="text-red-600 text-xs">0120-279-338 (24/7, multilingual)</div>
                    </div>
                  </a>
                  <a href="tel:03-5774-0992" className="flex items-center gap-2 bg-red-100 rounded-xl p-3 hover:bg-red-200 transition-colors">
                    <Phone className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-bold text-red-700 text-sm">TELL Lifeline</div>
                      <div className="text-red-600 text-xs">03-5774-0992 (English)</div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setAnswers(new Array(10).fill(null));
                  setShowIntro(true);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-all text-sm"
              >
                Retake
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="flex-1 bg-gradient-to-r from-lavender-400 to-lavender-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all text-sm"
              >
                Talk to Kokoro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = epdsQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-lavender-50 pt-20 pb-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => currentQuestion > 0 ? setCurrentQuestion(currentQuestion - 1) : setShowIntro(true)}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <span className="text-sm text-gray-500 font-medium">
              Question {currentQuestion + 1} of 10
            </span>
            <div className="w-8" />
          </div>
          <div className="w-full bg-lavender-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-lavender-400 to-lavender-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-lavender-100">
          <p className="text-gray-400 text-xs mb-2 font-medium">In the past 7 days...</p>
          <h2 className="text-lg font-semibold text-gray-800 mb-6">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.score)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 text-sm ${
                  answers[currentQuestion] === option.score
                    ? 'border-lavender-400 bg-lavender-50 text-lavender-700'
                    : 'border-gray-200 hover:border-lavender-200 hover:bg-lavender-50/30 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {currentQuestion === 9 && answers[9] !== null && (
            <button
              onClick={handleSubmit}
              disabled={answers.some((a) => a === null)}
              className="w-full mt-6 bg-gradient-to-r from-lavender-400 to-lavender-500 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              View Results
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Question 10 Safety Note */}
        {currentQuestion === 9 && (
          <div className="mt-4 bg-peach-50 rounded-2xl p-4 border border-peach-200">
            <p className="text-peach-500 text-xs">
              If you are having thoughts of harming yourself, please reach out now:
              <strong> Yorisoi Hotline: 0120-279-338</strong> (24/7)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
