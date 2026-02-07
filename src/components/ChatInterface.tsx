import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Phone } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  crisisLevel?: 'green' | 'yellow' | 'orange' | 'red';
}

const pregnancyTopics = [
  { label: "I'm anxious about labor and delivery", icon: "🌊" },
  { label: "My body is changing and I feel overwhelmed", icon: "🦋" },
  { label: "I'm worried I won't be a good mother", icon: "💭" },
  { label: "I can't sleep and I'm exhausted", icon: "🌙" },
];

const postpartumTopics = [
  { label: "I'm feeling overwhelmed", icon: "🌊" },
  { label: "I can't stop worrying about my baby", icon: "💭" },
  { label: "I feel disconnected from my baby", icon: "💔" },
  { label: "I need help sleeping", icon: "🌙" },
];

// Crisis keyword detection (client-side safety net)
function detectCrisisLevel(message: string): 'green' | 'yellow' | 'orange' | 'red' {
  const lower = message.toLowerCase();
  const redKeywords = ['suicide', 'kill myself', 'end my life', 'hurt myself', 'self-harm', 'don\'t want to live', 'want to die', 'harm my baby', 'hurt my baby'];
  const orangeKeywords = ['can\'t go on', 'hopeless', 'worthless', 'no point', 'everyone would be better', 'can\'t do this anymore'];
  const yellowKeywords = ['so sad', 'can\'t stop crying', 'not eating', 'not sleeping', 'feel nothing', 'empty', 'alone', 'failing'];

  if (redKeywords.some(k => lower.includes(k))) return 'red';
  if (orangeKeywords.some(k => lower.includes(k))) return 'orange';
  if (yellowKeywords.some(k => lower.includes(k))) return 'yellow';
  return 'green';
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, token } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !token) return;

    // Crisis detection
    const crisisLevel = detectCrisisLevel(messageText);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      crisisLevel,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // If RED crisis, show immediate support before AI response
    if (crisisLevel === 'red') {
      const crisisMessage: Message = {
        id: (Date.now() + 0.5).toString(),
        content: `**You are not alone. Help is available right now.**\n\n📞 **Yorisoi Hotline:** [0120-279-338](tel:0120279338) (24/7, multilingual)\n📞 **TELL Lifeline:** [03-5774-0992](tel:0357740992) (English)\n📞 **Emergency:** 119\n\nYour feelings are valid, and reaching out for help is a sign of strength. A trained person is ready to listen to you right now.`,
        sender: 'ai',
        timestamp: new Date(),
        crisisLevel: 'red',
      };
      setMessages(prev => [...prev, crisisMessage]);
    }

    // Stream AI response
    await streamResponse(messageText, crisisLevel);
  };

  const streamResponse = async (messageText: string, crisisLevel: string) => {
    setIsStreaming(true);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          category: user?.phase === 'pregnant' ? 'pregnancy-support' : 'ppd-support',
          crisisLevel,
          phase: user?.phase || 'postpartum',
          phaseContext: {
            pregnancyWeeks: user?.pregnancyWeeks,
            dueDate: user?.dueDate,
            babyName: user?.babyName,
            babyAgeWeeks: user?.babyAgeWeeks,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to stream');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.sender === 'ai') {
              lastMessage.content = accumulatedText;
            }
            return [...newMessages];
          });
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      // Fallback response
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai') {
          lastMessage.content = "I hear you, and I'm here for you. Sometimes just sharing what's on your mind is an important first step. Would you like to tell me more about how you're feeling?";
        }
        return [...newMessages];
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-cream-50 via-white to-lavender-50">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-lavender-100">
          <Heart className="w-12 h-12 text-lavender-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to MamaKokoro</h2>
          <p className="text-gray-600">Please log in to talk with Kokoro</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-cream-50 via-white to-lavender-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-8">
            <div className="w-16 h-16 bg-gradient-to-br from-lavender-200 to-peach-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Hi {user.username}, I'm Kokoro</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              {user.phase === 'pregnant'
                ? "I'm here to support you through your pregnancy journey. Whatever you're feeling is valid."
                : "I'm here to listen and support you. Whatever you're feeling is valid. There's no judgment here."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              {(user.phase === 'pregnant' ? pregnancyTopics : postpartumTopics).map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => sendMessage(topic.label)}
                  className="p-3 bg-white/80 rounded-2xl shadow-sm border border-lavender-100 hover:shadow-md hover:border-lavender-200 transition-all text-left"
                >
                  <span className="text-lg mr-2">{topic.icon}</span>
                  <span className="text-sm text-gray-700">{topic.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-lavender-400 to-lavender-500 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-md'
                  : message.crisisLevel === 'red'
                  ? 'bg-red-50 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border-2 border-red-200'
                  : 'bg-white/90 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-lavender-100'
              }`}
            >
              {message.sender === 'user' ? (
                <p className="text-sm leading-relaxed">{message.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content || '...'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-white/90 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-lavender-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-lavender-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-lavender-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-lavender-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-400">Kokoro is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Crisis Banner (always visible) */}
      <div className="bg-peach-50 border-t border-peach-100 px-4 py-1.5">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Phone className="w-3 h-3" />
          <span>In crisis? <a href="tel:0120279338" className="font-semibold text-peach-500 hover:underline">Yorisoi: 0120-279-338</a></span>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-lavender-100 p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStreaming ? "Kokoro is responding..." : "Share what's on your mind..."}
            disabled={isStreaming}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lavender-300 bg-white text-sm disabled:bg-gray-50 disabled:cursor-not-allowed placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-3 bg-gradient-to-r from-lavender-400 to-lavender-500 text-white rounded-2xl hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
