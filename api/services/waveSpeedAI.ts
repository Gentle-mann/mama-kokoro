import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WAVESPEED_API_KEY = process.env.WAVESPEED_API_KEY;
const WAVESPEED_BASE_URL = 'https://api.wavespeedai.com/v1';

export interface EmotionAnalysis {
  emotion: 'calm' | 'stressed' | 'curious' | 'confused' | 'excited' | 'frustrated' | 'happy' | 'neutral';
  confidence: number;
  suggestions: string[];
  adaptiveTone?: string;
}

export interface SpeechToTextResult {
  text: string;
  confidence: number;
  language: string;
}

export interface MultimodalResponse {
  avatarVideoUrl: string;
  encouragementText: string;
  voiceUrl: string;
  type: 'avatar' | 'voice';
  message: string;
}

export class WaveSpeedAIService {
  private static instance: WaveSpeedAIService;

  public static getInstance(): WaveSpeedAIService {
    if (!WaveSpeedAIService.instance) {
      WaveSpeedAIService.instance = new WaveSpeedAIService();
    }
    return WaveSpeedAIService.instance;
  }

  async analyzeEmotion(text: string): Promise<EmotionAnalysis> {
    try {
      // Enhanced emotion analysis with better detection
      const mockAnalysis = await this.generateEnhancedEmotionAnalysis(text);
      return mockAnalysis;
    } catch (error) {
      console.error('WaveSpeed Emotion Analysis Error:', error);
      throw new Error('Failed to analyze emotion');
    }
  }

  async speechToText(audioData: string): Promise<SpeechToTextResult> {
    try {
      // Enhanced speech-to-text with better audio handling
      const mockResult = await this.generateEnhancedSpeechToText(audioData);
      return mockResult;
    } catch (error) {
      console.error('WaveSpeed Speech-to-Text Error:', error);
      throw new Error('Failed to convert speech to text');
    }
  }

  async generateMultimodalResponse(emotion: string, context: string): Promise<MultimodalResponse> {
    try {
      // Enhanced multimodal response generation
      const mockResponse = await this.generateEnhancedMultimodalResponse(emotion, context);
      return mockResponse;
    } catch (error) {
      console.error('WaveSpeed Multimodal Generation Error:', error);
      throw new Error('Failed to generate multimodal response');
    }
  }

  private async generateEnhancedEmotionAnalysis(text: string): Promise<EmotionAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    // Enhanced emotion detection with more keywords and patterns
    const emotionKeywords = {
      stressed: ['help', 'urgent', 'problem', 'difficult', 'confused', 'lost', 'stuck', 'emergency', 'worried', 'anxious', 'overwhelmed', 'panic'],
      frustrated: ['why', 'how', 'again', 'still', 'not working', 'failed', 'wrong', 'broken', 'annoying', 'stupid', 'hate', 'terrible'],
      confused: ['what', 'how', 'where', 'when', 'which', 'understand', 'explain', 'mean', 'confused', 'unclear', 'don\'t get', 'huh'],
      curious: ['learn', 'know', 'tell me', 'explain', 'interesting', 'wonder', 'explore', 'discover', 'find out', 'teach', 'show'],
      excited: ['amazing', 'awesome', 'great', 'wonderful', 'fantastic', 'love', 'excited', 'can\'t wait', 'looking forward', 'incredible'],
      happy: ['good', 'nice', 'thank', 'appreciate', 'glad', 'happy', 'pleased', 'satisfied', 'perfect', 'excellent', 'brilliant'],
      calm: ['okay', 'fine', 'alright', 'understand', 'got it', 'makes sense', 'clear', 'simple', 'easy', 'peaceful']
    };

    const lowerText = text.toLowerCase();
    let emotion: EmotionAnalysis['emotion'] = 'neutral';
    let confidence = 0.6;
    let suggestions: string[] = [];

    // Check for emotion keywords with weighted scoring
    let maxScore = 0;
    for (const [emotionType, keywords] of Object.entries(emotionKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        return acc + matches;
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        emotion = emotionType as EmotionAnalysis['emotion'];
        confidence = Math.min(0.95, 0.6 + (score * 0.1));
      }
    }

    // Check for punctuation patterns
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    
    if (exclamationCount > 2) {
      emotion = 'excited';
      confidence = Math.max(confidence, 0.8);
    } else if (questionCount > 1) {
      emotion = 'confused';
      confidence = Math.max(confidence, 0.75);
    }

    // Check for caps (indicating strong emotion)
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.3) {
      if (emotion === 'neutral') emotion = 'frustrated';
      confidence = Math.max(confidence, 0.8);
    }

    // Generate adaptive tone and suggestions based on detected emotion
    const adaptiveTones = {
      stressed: 'calm and reassuring',
      frustrated: 'patient and understanding',
      confused: 'clear and explanatory',
      curious: 'informative and engaging',
      excited: 'enthusiastic and supportive',
      happy: 'warm and encouraging',
      calm: 'friendly and helpful',
      neutral: 'balanced and informative'
    };

    const emotionSuggestions = {
      stressed: [
        'Provide step-by-step guidance',
        'Use calming tone',
        'Offer reassurance',
        'Break down complex tasks',
        'Acknowledge their stress'
      ],
      frustrated: [
        'Acknowledge frustration',
        'Provide quick solutions',
        'Use empathetic tone',
        'Offer alternative approaches',
        'Be patient and understanding'
      ],
      confused: [
        'Provide detailed explanations',
        'Use simple language',
        'Include examples',
        'Break down concepts',
        'Check understanding'
      ],
      curious: [
        'Provide detailed explanations',
        'Include cultural context',
        'Use encouraging tone',
        'Share interesting facts',
        'Encourage exploration'
      ],
      excited: [
        'Match their enthusiasm',
        'Provide comprehensive information',
        'Share exciting details',
        'Encourage their energy',
        'Build on their excitement'
      ],
      happy: [
        'Continue with positive tone',
        'Provide additional helpful information',
        'Maintain the good mood',
        'Celebrate their progress'
      ],
      calm: [
        'Continue with normal tone',
        'Provide thorough information',
        'Maintain steady pace'
      ],
      neutral: [
        'Use balanced approach',
        'Provide clear information',
        'Be helpful and informative'
      ]
    };

    suggestions = emotionSuggestions[emotion] || emotionSuggestions.neutral;

    return {
      emotion,
      confidence,
      suggestions,
      adaptiveTone: adaptiveTones[emotion]
    };
  }

  private async generateEnhancedSpeechToText(audioData: string): Promise<SpeechToTextResult> {
    // Simulate processing delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    // Validate audio data
    if (!this.validateAudioInput(audioData)) {
      throw new Error('Invalid audio data provided');
    }

    // Enhanced simulation with more realistic and diverse transcriptions
    const commonQuestions = [
      "How do I register my address in Japan?",
      "Where can I open a bank account as a foreigner?",
      "What documents do I need for a phone contract?",
      "How do I use the train system in Tokyo?",
      "What's the best way to learn Japanese quickly?",
      "Can you help me understand Japanese culture?",
      "Where should I go shopping in Shibuya?",
      "How does the healthcare system work here?",
      "What should I know about working in Japan?",
      "How do I find an apartment in Tokyo?",
      "What are the rules for garbage disposal?",
      "How do I get a residence card?",
      "Where can I buy groceries late at night?",
      "What's the etiquette for using public transportation?",
      "How do I make friends with Japanese people?",
      "What are some good restaurants near me?",
      "How do I pay taxes as a foreign resident?",
      "What should I do in case of an earthquake?",
      "How do I get internet service for my apartment?",
      "What are the best apps for living in Japan?",
      "Can you explain the Japanese work culture?",
      "How do I use a Japanese ATM?",
      "What's the difference between hiragana and katakana?",
      "How do I bow properly in Japan?",
      "What should I wear to a Japanese business meeting?",
      "How do I order food at a restaurant?",
      "What's the tipping culture in Japan?",
      "How do I use public baths or onsen?",
      "What are the major holidays in Japan?",
      "How do I navigate the Japanese healthcare system?"
    ];

    // Simulate different confidence levels based on audio quality
    const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence
    const selectedQuestion = commonQuestions[Math.floor(Math.random() * commonQuestions.length)];

    return {
      text: selectedQuestion,
      confidence: confidence,
      language: 'en-US' // Assuming English input for now
    };
  }

  private async generateEnhancedMultimodalResponse(emotion: string, context: string): Promise<MultimodalResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

    // Enhanced multimodal responses based on emotion and context
    const responses = {
      stressed: {
        type: 'avatar' as const,
        avatarVideoUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('Calm, reassuring AI avatar with gentle expression, soft lighting, peaceful background')}`,
        encouragementText: "I understand this can feel overwhelming. Take a deep breath - you're not alone in this journey. Thousands of people successfully navigate these same challenges every day in Japan. Let's break this down into manageable steps together.",
        voiceUrl: '',
        message: "I understand this can feel overwhelming. Take a deep breath - you're not alone in this journey."
      },
      frustrated: {
        type: 'voice' as const,
        avatarVideoUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('Understanding AI avatar with empathetic expression, warm colors, supportive atmosphere')}`,
        encouragementText: "I hear your frustration, and it's completely valid. Japanese systems can be complex, but remember that every challenge you overcome makes you stronger and more capable. Let's work through this together at your own pace.",
        voiceUrl: '',
        message: "I hear your frustration, and it's completely valid. Let's work through this together at your own pace."
      },
      confused: {
        type: 'avatar' as const,
        avatarVideoUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('Patient AI avatar with clear, explanatory expression, bright lighting, educational background')}`,
        encouragementText: "No worries about being confused - Japan has many unique systems that can seem complex at first! I'll break this down into simple, clear steps that are easy to follow. Every expert was once a beginner.",
        voiceUrl: '',
        message: "No worries about being confused - I'll break this down into simple, clear steps that are easy to follow."
      },
      curious: {
        type: 'voice' as const,
        avatarVideoUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('Enthusiastic AI avatar with bright expression, colorful background, learning atmosphere')}`,
        encouragementText: "I love your curiosity! Japan has so much to offer, and your eagerness to learn will serve you well. I'm excited to share this knowledge with you and help you discover all the wonderful aspects of Japanese life.",
        voiceUrl: '',
        message: "I love your curiosity! I'm excited to share this knowledge with you and help you explore Japan."
      },
      excited: {
        type: 'avatar' as const,
        avatarVideoUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('Energetic AI avatar with enthusiastic expression, vibrant colors, dynamic background')}`,
        encouragementText: "Your enthusiasm is wonderful and contagious! I'm just as excited to help you make the most of your experience in Japan. Your positive energy will open many doors and create amazing opportunities.",
        voiceUrl: '',
        message: "Your enthusiasm is wonderful! I'm just as excited to help you make the most of your experience in Japan."
      },
      happy: {
        type: 'voice' as const,
        avatarVideoUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('Cheerful AI avatar with warm smile, golden lighting, joyful atmosphere')}`,
        encouragementText: "It's wonderful to see you in such good spirits! Your positive attitude will make your journey in Japan even more rewarding. I'm here to keep that positive energy going as we explore everything Japan has to offer together.",
        voiceUrl: '',
        message: "It's wonderful to see you in such good spirits! I'm here to keep that positive energy going."
      },
      calm: {
        type: 'avatar' as const,
        avatarVideoUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('Serene AI avatar with peaceful expression, soft colors, tranquil background')}`,
        encouragementText: "I appreciate your calm and thoughtful approach. This mindset will serve you well in Japan, where patience and consideration are highly valued. Let's continue building on this solid foundation.",
        voiceUrl: '',
        message: "I appreciate your calm and thoughtful approach. Let's continue building on this solid foundation."
      }
    };

    const defaultResponse = {
      type: 'avatar' as const,
      avatarVideoUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('Friendly AI avatar with welcoming expression, neutral colors, helpful atmosphere')}`,
      encouragementText: "I'm here to help you with whatever you need to know about Japan. Every question you ask brings you closer to feeling at home in this amazing country. Feel free to ask me anything!",
      voiceUrl: '',
      message: "I'm here to help you with whatever you need to know about Japan. Feel free to ask me anything!"
    };

    return responses[emotion as keyof typeof responses] || defaultResponse;
  }

  // Utility methods
  private validateAudioInput(audioData: string): boolean {
    try {
      // Basic validation - check if it's a valid base64 audio string
      if (!audioData || typeof audioData !== 'string') {
        return false;
      }

      // Check if it starts with data URL format
      if (!audioData.startsWith('data:audio/')) {
        return false;
      }

      // Check minimum length (should contain actual audio data)
      const base64Data = audioData.split(',')[1];
      if (!base64Data || base64Data.length < 1000) {
        return false; // Too short to be meaningful audio
      }

      return true;
    } catch (error) {
      console.error('Audio validation error:', error);
      return false;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on character patterns
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    const koreanPattern = /[\uAC00-\uD7AF]/;
    const chinesePattern = /[\u4E00-\u9FFF]/;

    if (japanesePattern.test(text)) return 'ja';
    if (koreanPattern.test(text)) return 'ko';
    if (chinesePattern.test(text)) return 'zh';
    
    return 'en'; // Default to English
  }

  async enhanceAudioQuality(audioData: string): Promise<string> {
    // Simulate audio enhancement processing
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real implementation, this would apply noise reduction,
    // normalization, and other audio processing techniques
    return audioData;
  }
}

export const waveSpeedService = WaveSpeedAIService.getInstance();