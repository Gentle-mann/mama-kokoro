import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BYTEPLUS_ACCESS_KEY_ID = process.env.BYTEPLUS_ACCESS_KEY_ID;
const BYTEPLUS_ACCESS_KEY_SECRET = process.env.BYTEPLUS_ACCESS_KEY_SECRET;
const BYTEPLUS_API_KEY = process.env.BYTEPLUS_API_KEY;

export interface AIResponse {
  steps: string;
  culturalContext: string;
  visualUrl: string;
  audioUrl: string;
  japaneseTerms: Array<{
    term: string;
    romanization: string;
    meaning: string;
  }>;
  emotion?: string;
  adaptiveTone?: string;
}

export class BytePlusAIService {
  private static instance: BytePlusAIService;

  public static getInstance(): BytePlusAIService {
    if (!BytePlusAIService.instance) {
      BytePlusAIService.instance = new BytePlusAIService();
    }
    return BytePlusAIService.instance;
  }

  async generateResponse(message: string, category?: string, emotion?: string): Promise<AIResponse> {
    try {
      // For demo purposes, we'll simulate AI responses
      // In production, you would integrate with actual BytePlus APIs
      
      const mockResponse = await this.generateMockResponse(message, category, emotion);
      return mockResponse;
    } catch (error) {
      console.error('BytePlus AI Service Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private async generateMockResponse(message: string, category?: string, emotion: string = 'neutral'): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Detect topic from message content
    const detectedCategory = this.detectCategory(message);
    const finalCategory = category || detectedCategory;

    const responses = {
      living: {
        steps: "1. Visit your local city hall (市役所) within 14 days of moving\n2. Bring your residence card, passport, and My Number card\n3. Fill out the address registration form (住民票)\n4. Submit the form at the registration counter\n5. Receive confirmation and updated residence certificate",
        culturalContext: "In Japan, address registration is mandatory and essential for receiving mail, accessing healthcare, and tax purposes. It's considered the foundation of your legal residence status.",
        japaneseTerms: [
          { term: "市役所", romanization: "shiyakusho", meaning: "city hall" },
          { term: "住民票", romanization: "jūminhyō", meaning: "residence certificate" }
        ]
      },
      mobile: {
        steps: "1. Choose a carrier (SoftBank, au, or Docomo)\n2. Bring residence card, passport, and bank account info\n3. Visit a store with English support if needed\n4. Select a plan that fits your needs\n5. Set up payment method (bank transfer recommended)\n6. Receive your phone and SIM card",
        culturalContext: "Japanese mobile contracts often require a Japanese bank account and can involve lengthy paperwork. Many stores now offer English support for foreigners.",
        japaneseTerms: [
          { term: "携帯電話", romanization: "keitai denwa", meaning: "mobile phone" },
          { term: "契約", romanization: "keiyaku", meaning: "contract" }
        ]
      },
      banking: {
        steps: "1. Choose a bank (Japan Post Bank is foreigner-friendly)\n2. Prepare required documents: residence card, passport, My Number card\n3. Visit the branch with a Japanese speaker if possible\n4. Fill out the application form\n5. Make initial deposit (usually ¥1,000 minimum)\n6. Receive your cash card in 1-2 weeks",
        culturalContext: "Japanese banks are very document-focused and prefer in-person visits. Having a Japanese guarantor or bringing a Japanese-speaking friend can significantly help the process.",
        japaneseTerms: [
          { term: "銀行", romanization: "ginkō", meaning: "bank" },
          { term: "口座", romanization: "kōza", meaning: "bank account" }
        ]
      },
      'city-hall': {
        steps: "1. Locate your ward office (区役所) or city hall (市役所)\n2. Bring required documents (varies by procedure)\n3. Take a number and wait for your turn\n4. Complete forms with staff assistance\n5. Pay any required fees\n6. Receive certificates or confirmation",
        culturalContext: "City hall procedures are formal but staff are generally helpful. Many offices now have multilingual support or translation services available.",
        japaneseTerms: [
          { term: "区役所", romanization: "kuyakusho", meaning: "ward office" },
          { term: "手数料", romanization: "tesūryō", meaning: "handling fee" }
        ]
      },
      language: {
        steps: "1. Start with basic greetings and polite expressions\n2. Learn essential phrases for daily situations\n3. Practice reading hiragana and katakana\n4. Join local Japanese classes or language exchange\n5. Use language learning apps consistently\n6. Practice with native speakers when possible",
        culturalContext: "Japanese people appreciate any effort to speak their language, even if imperfect. Politeness levels (keigo) are important in formal situations.",
        japaneseTerms: [
          { term: "日本語", romanization: "nihongo", meaning: "Japanese language" },
          { term: "敬語", romanization: "keigo", meaning: "polite language" }
        ]
      },
      culture: {
        steps: "1. Observe and respect local customs\n2. Learn about seasonal traditions and holidays\n3. Understand workplace or school etiquette\n4. Practice proper bowing and greeting\n5. Respect personal space and quiet public behavior\n6. Participate in community events when invited",
        culturalContext: "Japanese culture values harmony, respect, and consideration for others. Small gestures of politeness go a long way in building relationships.",
        japaneseTerms: [
          { term: "文化", romanization: "bunka", meaning: "culture" },
          { term: "礼儀", romanization: "reigi", meaning: "etiquette" }
        ]
      },
      food: {
        steps: "1. Try local convenience stores (konbini) for quick meals\n2. Learn basic restaurant etiquette and ordering phrases\n3. Explore different types of restaurants (ramen, sushi, izakaya)\n4. Use food delivery apps like Uber Eats or Demae-can\n5. Visit local supermarkets to cook at home\n6. Don't forget to say 'itadakimasu' before eating!",
        culturalContext: "Japanese food culture emphasizes freshness, seasonality, and presentation. Slurping noodles is acceptable and shows appreciation. Tipping is not customary.",
        japaneseTerms: [
          { term: "コンビニ", romanization: "konbini", meaning: "convenience store" },
          { term: "いただきます", romanization: "itadakimasu", meaning: "thank you for the meal" }
        ]
      },
      transportation: {
        steps: "1. Get an IC card (Suica/Pasmo) for trains and buses\n2. Download Google Maps or Hyperdia for route planning\n3. Learn basic train etiquette (no talking on phone, priority seats)\n4. Understand rush hour times (7-9 AM, 5-7 PM)\n5. Consider getting a bicycle for short distances\n6. Use taxi apps like GO or JapanTaxi for late nights",
        culturalContext: "Japanese public transportation is incredibly punctual and efficient. Being quiet and orderly is expected. Last trains usually run around midnight.",
        japaneseTerms: [
          { term: "電車", romanization: "densha", meaning: "train" },
          { term: "切符", romanization: "kippu", meaning: "ticket" }
        ]
      },
      shopping: {
        steps: "1. Learn basic shopping phrases and numbers\n2. Understand tax-free shopping for tourists\n3. Bring cash as many places don't accept cards\n4. Know store hours (many close early, around 8 PM)\n5. Use shopping apps like Rakuten or Amazon Japan\n6. Explore different shopping areas (Shibuya, Harajuku, Ginza)",
        culturalContext: "Customer service in Japan is exceptional. Staff will often go above and beyond to help. Bargaining is not common except at some markets.",
        japaneseTerms: [
          { term: "買い物", romanization: "kaimono", meaning: "shopping" },
          { term: "レシート", romanization: "reshīto", meaning: "receipt" }
        ]
      },
      work: {
        steps: "1. Understand Japanese work culture and hierarchy\n2. Learn proper business card exchange (meishi koukan)\n3. Arrive early and stay late to show dedication\n4. Participate in after-work socializing (nomikai)\n5. Dress conservatively and professionally\n6. Learn key business Japanese phrases",
        culturalContext: "Japanese workplace culture emphasizes teamwork, respect for seniority, and consensus-building. Building relationships with colleagues is crucial for success.",
        japaneseTerms: [
          { term: "会社", romanization: "kaisha", meaning: "company" },
          { term: "名刺", romanization: "meishi", meaning: "business card" }
        ]
      },
      healthcare: {
        steps: "1. Enroll in National Health Insurance (kokumin hoken)\n2. Find a local clinic or hospital\n3. Bring your insurance card and cash for payment\n4. Learn basic medical vocabulary\n5. Use translation apps if needed\n6. Keep all medical receipts for tax purposes",
        culturalContext: "Japanese healthcare is high quality and affordable with insurance. Doctors may seem formal but are very thorough. Preventive care is emphasized.",
        japaneseTerms: [
          { term: "病院", romanization: "byōin", meaning: "hospital" },
          { term: "保険", romanization: "hoken", meaning: "insurance" }
        ]
      },
      general: {
        steps: this.generateGeneralResponse(message),
        culturalContext: "Living in Japan is an amazing experience! Every challenge is an opportunity to learn and grow. The Japanese people are generally very helpful and patient with foreigners who are making an effort to adapt.",
        japaneseTerms: [
          { term: "頑張って", romanization: "ganbatte", meaning: "good luck/do your best" },
          { term: "ありがとう", romanization: "arigatou", meaning: "thank you" }
        ]
      }
    };

    const responseData = responses[finalCategory as keyof typeof responses] || responses.general;

    // Adapt tone based on emotion
    let adaptiveTone = '';
    let adaptedSteps = responseData.steps;
    let adaptedCulturalContext = responseData.culturalContext;

    if (emotion === 'stressed') {
      adaptiveTone = 'calming';
      adaptedSteps = "Don't worry! " + (await responseData.steps).replace(/\d\./g, (match) => `${match} Take your time: `);
      adaptedCulturalContext = "Remember, you're not alone in this process. " + responseData.culturalContext + " Take it one step at a time, and you'll do great!";
    } else if (emotion === 'confused') {
      adaptiveTone = 'explanatory';
      adaptedSteps = "Let me break this down clearly:\n" + (await responseData.steps);
      adaptedCulturalContext = "This might seem complex at first, but here's why it matters: " + responseData.culturalContext;
    } else if (emotion === 'curious') {
      adaptiveTone = 'encouraging';
      adaptedCulturalContext = responseData.culturalContext + " Your curiosity will help you adapt quickly to Japanese life!";
    }

    return {
      steps: await adaptedSteps,
      culturalContext: adaptedCulturalContext,
      visualUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`Japanese ${finalCategory || 'life'} illustration, clean modern style, friendly atmosphere, helpful guide`)}&image_size=landscape_4_3`,
      audioUrl: '', // Would be generated by Seed Speech API
      japaneseTerms: responseData.japaneseTerms,
      emotion,
      adaptiveTone
    };
  }

  private detectCategory(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Banking and finance
    if (lowerMessage.includes('bank') || lowerMessage.includes('account') || lowerMessage.includes('money') || lowerMessage.includes('atm') || lowerMessage.includes('card')) {
      return 'banking';
    }
    
    // Mobile and phone
    if (lowerMessage.includes('phone') || lowerMessage.includes('mobile') || lowerMessage.includes('sim') || lowerMessage.includes('carrier') || lowerMessage.includes('softbank') || lowerMessage.includes('docomo')) {
      return 'mobile';
    }
    
    // Living and housing
    if (lowerMessage.includes('apartment') || lowerMessage.includes('house') || lowerMessage.includes('rent') || lowerMessage.includes('address') || lowerMessage.includes('moving') || lowerMessage.includes('residence')) {
      return 'living';
    }
    
    // City hall and administration
    if (lowerMessage.includes('city hall') || lowerMessage.includes('ward office') || lowerMessage.includes('registration') || lowerMessage.includes('certificate') || lowerMessage.includes('document') || lowerMessage.includes('visa')) {
      return 'city-hall';
    }
    
    // Language learning
    if (lowerMessage.includes('japanese') || lowerMessage.includes('language') || lowerMessage.includes('learn') || lowerMessage.includes('speak') || lowerMessage.includes('hiragana') || lowerMessage.includes('katakana') || lowerMessage.includes('kanji')) {
      return 'language';
    }
    
    // Culture and customs
    if (lowerMessage.includes('culture') || lowerMessage.includes('custom') || lowerMessage.includes('tradition') || lowerMessage.includes('etiquette') || lowerMessage.includes('manner') || lowerMessage.includes('bow')) {
      return 'culture';
    }
    
    // Food and dining
    if (lowerMessage.includes('food') || lowerMessage.includes('restaurant') || lowerMessage.includes('eat') || lowerMessage.includes('sushi') || lowerMessage.includes('ramen') || lowerMessage.includes('cooking') || lowerMessage.includes('grocery')) {
      return 'food';
    }
    
    // Transportation
    if (lowerMessage.includes('train') || lowerMessage.includes('bus') || lowerMessage.includes('transport') || lowerMessage.includes('subway') || lowerMessage.includes('taxi') || lowerMessage.includes('bicycle') || lowerMessage.includes('suica') || lowerMessage.includes('pasmo')) {
      return 'transportation';
    }
    
    // Shopping
    if (lowerMessage.includes('shop') || lowerMessage.includes('buy') || lowerMessage.includes('store') || lowerMessage.includes('mall') || lowerMessage.includes('market') || lowerMessage.includes('purchase')) {
      return 'shopping';
    }
    
    // Work and employment
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('office') || lowerMessage.includes('business') || lowerMessage.includes('company') || lowerMessage.includes('employment')) {
      return 'work';
    }
    
    // Healthcare
    if (lowerMessage.includes('doctor') || lowerMessage.includes('hospital') || lowerMessage.includes('health') || lowerMessage.includes('medical') || lowerMessage.includes('insurance') || lowerMessage.includes('clinic')) {
      return 'healthcare';
    }
    
    return 'general';
  }

  private generateGeneralResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced pattern matching for better guidance
    const patterns = {
      address: ['address', 'register', 'registration', 'move', 'moving', 'residence', 'jūmin', 'juminhyo'],
      banking: ['bank', 'account', 'money', 'atm', 'card', 'finance', 'payment', 'cash'],
      mobile: ['phone', 'mobile', 'sim', 'contract', 'carrier', 'docomo', 'softbank', 'au'],
      cityHall: ['city hall', 'ward office', 'government', 'official', 'document', 'certificate', 'shiyakusho', 'kuyakusho'],
      health: ['health', 'insurance', 'doctor', 'hospital', 'medical', 'clinic', 'medicine', 'byoin'],
      transport: ['train', 'subway', 'bus', 'transport', 'travel', 'station', 'ticket', 'ic card'],
      work: ['work', 'job', 'employment', 'visa', 'company', 'office', 'salary', 'tax'],
      housing: ['apartment', 'house', 'rent', 'lease', 'utilities', 'electricity', 'gas', 'water'],
      shopping: ['shop', 'store', 'buy', 'purchase', 'market', 'supermarket', 'convenience', 'konbini'],
      culture: ['culture', 'etiquette', 'manner', 'bow', 'gift', 'festival', 'tradition', 'custom']
    };

    // Find the best matching category
    let bestMatch = 'general';
    let maxMatches = 0;
    
    for (const [category, keywords] of Object.entries(patterns)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    }

    // Enhanced responses with structured guidance
    const responses = {
      address: `**📍 Address Registration (住民登録) - Complete Guide:**

**Step-by-Step Process:**
1. **Visit your local city hall** (市役所, shiyakusho) within 14 days of moving
2. **Go to the Resident Registration counter** (住民登録窓口)
3. **Submit the moving notification form** (転入届, tennyu-todoke)
4. **Receive your new residence certificate** (住民票, jūminhyō)
5. **Update your My Number card address** if you have one

**Required Documents:**
• Passport with valid visa
• Previous residence certificate (if moving within Japan)
• Moving notification from previous city (if applicable)
• My Number card (if you have one)

**Cultural Context:**
Address registration is mandatory and affects everything from banking to healthcare. Japanese bureaucracy values precision and completeness.

**Key Terms:**
• 住民登録 (jūmin tōroku) - residence registration
• 市役所 (shiyakusho) - city hall
• 転入届 (tennyu-todoke) - moving-in notification

**Pro Tips:**
• Bring a Japanese speaker if possible
• Visit early morning (9-10 AM) for shorter lines
• Some offices have English forms available`,

      banking: `**💰 Opening a Bank Account - Complete Guide:**

**Step-by-Step Process:**
1. **Choose a foreigner-friendly bank** (Japan Post Bank recommended)
2. **Visit the branch with all required documents**
3. **Fill out the application form** (口座開設申込書)
4. **Set up your PIN and initial deposit**
5. **Receive your cash card** (usually takes 1-2 weeks)

**Required Documents:**
• Passport with valid visa
• Residence card (在留カード)
• Proof of address (住民票 or utility bill)
• Personal seal (印鑑) or signature
• Initial deposit (usually ¥1,000-10,000)

**Cultural Context:**
Japanese banks are very security-conscious. The process may seem lengthy, but it ensures your account's safety.

**Key Terms:**
• 銀行口座 (ginkō kōza) - bank account
• 口座開設 (kōza kaisetsu) - account opening
• キャッシュカード (kyasshu kādo) - cash card

**Pro Tips:**
• Japan Post Bank has English support
• Bring your phone for verification
• Consider online banks like Rakuten for easier setup`,

      mobile: `**📱 Mobile Phone Contract - Complete Guide:**

**Step-by-Step Process:**
1. **Choose your carrier** (Docomo, SoftBank, or au recommended for foreigners)
2. **Visit a store with English support**
3. **Bring required documents for identity verification**
4. **Choose your plan and phone**
5. **Set up payment method** (bank account or credit card)
6. **Activate your service** (usually immediate)

**Required Documents:**
• Passport with valid visa
• Residence card (在留カード)
• Bank account or credit card for payment
• Proof of address (住民票)

**Cultural Context:**
Japanese carriers offer comprehensive service but contracts can be complex. Staff are trained to help foreigners.

**Key Terms:**
• 携帯電話 (keitai denwa) - mobile phone
• 契約 (keiyaku) - contract
• 料金プラン (ryōkin puran) - rate plan

**Pro Tips:**
• Consider MVNO carriers for cheaper options
• Ask about foreigner-specific plans
• Bring a Japanese speaker for complex negotiations`,

      general: `**🎌 Living in Japan - Your Complete Support Guide:**

I'm here to provide **concrete, step-by-step guidance** for any aspect of Japanese life! Instead of general advice, I specialize in giving you **exact instructions** with:

**✅ What I Can Help You With:**
• **Government procedures** - Address registration, My Number, taxes
• **Banking & Finance** - Account opening, money transfers, ATM usage
• **Mobile & Internet** - Phone contracts, WiFi setup, data plans
• **Healthcare** - Insurance enrollment, finding doctors, prescriptions
• **Housing** - Apartment hunting, utilities, neighborhood integration
• **Transportation** - Train passes, driving licenses, bike registration
• **Work & Visa** - Employment procedures, visa renewals, tax filing
• **Daily Life** - Shopping, dining etiquette, cultural norms

**🎯 How I Help You Succeed:**
1. **Numbered step-by-step instructions** - No guesswork
2. **Exact document lists** - Know what to bring
3. **Cultural context** - Understand the "why" behind procedures
4. **Japanese terms with readings** - Communicate effectively
5. **Pro tips** - Insider knowledge to make things easier
6. **Backup options** - Alternative solutions when things don't go as planned

**💬 Just tell me:**
• What specific task you're trying to complete
• Where you're currently stuck
• What documents/information you have

I'll give you a **complete action plan** that thousands of foreigners have successfully used! 🚀`
    };

    return responses[bestMatch as keyof typeof responses] || responses.general;
  }

  async generateTipSummary(content: string): Promise<string> {
    // Simulate AI summarization
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const words = content.split(' ');
    if (words.length <= 20) return content;
    
    return words.slice(0, 20).join(' ') + '...';
  }

  async generateTipVisual(title: string, category: string): Promise<string> {
    const prompt = `${title} in Japan, ${category} category, illustration style, helpful and friendly`;
    return `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`;
  }
}