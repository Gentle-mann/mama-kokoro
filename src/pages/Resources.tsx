import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ExternalLink, Heart, Shield, BookOpen, Baby, Brain, Users } from 'lucide-react';

const crisisLines = [
  {
    name: 'Yorisoi Hotline',
    number: '0120-279-338',
    description: '24/7, multilingual support including English',
    urgent: true,
  },
  {
    name: 'TELL Lifeline',
    number: '03-5774-0992',
    description: 'English counseling, 9am-11pm daily',
    urgent: true,
  },
  {
    name: 'Tokyo English Life Line (TELL)',
    number: '03-5774-0992',
    description: 'Professional counseling in English',
    urgent: false,
  },
  {
    name: 'Inochi no Denwa (いのちの電話)',
    number: '0570-783-556',
    description: 'Japanese suicide prevention hotline',
    urgent: false,
  },
];

const selfCareStrategies = [
  {
    icon: <Baby className="w-5 h-5" />,
    title: 'Sleep When Baby Sleeps',
    description: 'Even 20 minutes of rest can help restore energy. Let go of the need to be productive during nap time.',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Breathing Exercise',
    description: 'Try 4-7-8 breathing: Inhale for 4 seconds, hold for 7, exhale for 8. Repeat 3-4 times.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Accept Help',
    description: 'It takes a village. Say yes when someone offers help. Ask for what you need. This is strength, not weakness.',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'Challenge Negative Thoughts',
    description: 'Notice thoughts like "I\'m a bad mother." Replace with evidence-based thoughts: "I\'m doing my best and learning every day."',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Journal Your Feelings',
    description: 'Writing down emotions helps process them. Even 5 minutes of journaling can provide clarity.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Set Boundaries',
    description: 'It\'s okay to limit visitors, decline social obligations, and prioritize your recovery. Your wellbeing matters.',
  },
];

const educationalResources = [
  {
    title: 'Understanding Postpartum Depression',
    description: 'PPD affects up to 1 in 7 mothers. It\'s a medical condition, not a character flaw. Recovery is possible with proper support.',
  },
  {
    title: 'Baby Blues vs. PPD',
    description: 'Baby blues (mood swings, crying) typically resolve within 2 weeks. If symptoms persist or intensify, it may be PPD. Talk to your doctor.',
  },
  {
    title: 'When to Seek Help',
    description: 'If you feel unable to care for yourself or your baby, have persistent sadness lasting more than 2 weeks, or experience thoughts of harm — reach out to a professional.',
  },
  {
    title: 'Japan-Specific Support',
    description: 'In Japan, your local 保健センター (health center) offers free postnatal check-ups and can connect you with support. Your 1-month and 3-month checkups include PPD screening.',
  },
];

export default function Resources() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-blue-50 pt-20 pb-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Help & Resources</h1>
            <p className="text-xs text-gray-500">Support is always available</p>
          </div>
        </div>

        {/* Crisis Hotlines */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-red-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-800">Crisis Support Lines</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            If you or someone you know is in immediate danger, call 119 (emergency) or contact these helplines:
          </p>
          <div className="space-y-3">
            {crisisLines.map((line, i) => (
              <a
                key={i}
                href={`tel:${line.number.replace(/-/g, '')}`}
                className={`block p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                  line.urgent
                    ? 'border-red-200 bg-red-50 hover:bg-red-100'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-sm ${line.urgent ? 'text-red-700' : 'text-gray-700'}`}>
                      {line.name}
                    </div>
                    <div className={`font-mono text-lg ${line.urgent ? 'text-red-600' : 'text-gray-600'}`}>
                      {line.number}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{line.description}</div>
                  </div>
                  <Phone className={`w-5 h-5 ${line.urgent ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Self-Care Strategies */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-sage-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-sage-400" />
            <h2 className="text-lg font-bold text-gray-800">Self-Care Strategies</h2>
          </div>
          <div className="space-y-4">
            {selfCareStrategies.map((strategy, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 p-2 bg-sage-50 rounded-xl text-sage-400">
                  {strategy.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-700">{strategy.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{strategy.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-lavender-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-lavender-400" />
            <h2 className="text-lg font-bold text-gray-800">Understanding PPD</h2>
          </div>
          <div className="space-y-4">
            {educationalResources.map((resource, i) => (
              <div key={i} className="bg-lavender-50/50 rounded-2xl p-4 border border-lavender-100">
                <h3 className="font-semibold text-sm text-lavender-700 mb-1">{resource.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-peach-50 rounded-2xl p-4 border border-peach-200">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            MamaKokoro is not a substitute for professional medical care.
            If you are experiencing severe symptoms, please consult your doctor or healthcare provider.
            In an emergency, call 119.
          </p>
        </div>
      </div>
    </div>
  );
}
