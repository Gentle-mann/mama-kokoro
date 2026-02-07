import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyBNAkr2IxKHz-IJIGHSAsHUdvceQqmUjXY';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateChatResponse(message: string, context?: string): Promise<string> {
    try {
      const prompt = this.buildChatPrompt(message, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      // Return a more specific error message for debugging
      if (error.status === 404) {
        throw new Error(`Gemini API 404 error - Model not found or API key invalid: ${error.message}`);
      }
      throw new Error(`Gemini API error (${error.status || 'unknown'}): ${error.message || 'Failed to generate response'}`);
    }
  }

  async generateStreamingResponse(prompt: string, context?: string): Promise<AsyncIterable<string>> {
    try {
      const result = await this.model.generateContentStream(prompt);

      return this.processGeminiStream(result.stream);
    } catch (error) {
      console.error('Gemini streaming error:', error);
      if (error.status === 404) {
        console.error('Gemini 404 error - Model not found or API key invalid');
      }
      throw error;
    }
  }

  private async* processGeminiStream(stream: any): AsyncIterable<string> {
    try {
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      console.error('Gemini stream processing error:', error);
      yield 'Error processing stream from Gemini';
    }
  }


  async generateRecommendations(userMessage: string, category?: string): Promise<string[]> {
    try {
      const prompt = `Based on this user message about living in Japan: "${userMessage}"
      ${category ? `Category: ${category}` : ''}
      
      Generate 3-5 specific, actionable recommendations for foreigners living in Japan. 
      Focus on practical tips, cultural insights, and helpful resources.
      Format as a simple list, one recommendation per line.
      Keep each recommendation concise but informative.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .slice(0, 5);
    } catch (error) {
      console.error('Gemini recommendations error:', error);
      return [
        'Visit your local city hall for residence registration',
        'Join local community groups to meet people',
        'Learn basic Japanese phrases for daily interactions'
      ];
    }
  }

  async generateTipSummary(content: string): Promise<string> {
    try {
      const prompt = `Summarize this tip for foreigners living in Japan in 1-2 sentences. 
      Make it concise and highlight the key actionable advice:
      
      "${content}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini summary error:', error);
      return content.substring(0, 100) + '...';
    }
  }

  async analyzeUserEmotion(message: string): Promise<{
    emotion: string;
    confidence: number;
    suggestions: string[];
    adaptiveTone: string;
  }> {
    try {
      const prompt = `Analyze the emotional tone of this message from a foreigner living in Japan:
      "${message}"
      
      Respond with a JSON object containing:
      - emotion: one of [stressed, frustrated, confused, curious, excited, happy, calm, neutral]
      - confidence: number between 0-1
      - suggestions: array of 3-5 helpful response strategies
      - adaptiveTone: recommended tone for response
      
      Focus on understanding the challenges of living in a foreign country.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        // Fallback if JSON parsing fails
        return {
          emotion: 'neutral',
          confidence: 0.7,
          suggestions: [
            'Provide clear, helpful information',
            'Be patient and understanding',
            'Offer practical solutions'
          ],
          adaptiveTone: 'friendly and supportive'
        };
      }
    } catch (error) {
      console.error('Gemini emotion analysis error:', error);
      return {
        emotion: 'neutral',
        confidence: 0.5,
        suggestions: ['Be helpful and informative'],
        adaptiveTone: 'friendly and supportive'
      };
    }
  }

  private buildChatPrompt(message: string, context?: string): string {
    const basePrompt = `You are ByteFriend, an AI assistant specializing in helping foreigners navigate life in Japan. You provide concrete, step-by-step guidance with cultural context and empathy.

    **Your Response Style:**
    - Always provide specific, actionable steps (numbered lists)
    - Include exact locations, office hours, and required documents
    - Add cultural context to explain WHY things work this way in Japan
    - Use encouraging, empathetic language that acknowledges the challenges
    - Include relevant Japanese terms with hiragana readings and meanings
    - Provide backup options when possible

    **Core Areas of Expertise:**
    1. **Government Procedures**: Address registration (住民登録), My Number card, residence tax, health insurance enrollment
    2. **Banking**: Account opening procedures, required documents, foreigner-friendly banks
    3. **Mobile Services**: SIM cards, phone contracts, data plans, carrier comparisons
    4. **Housing**: Apartment hunting, contracts, utilities setup, neighborhood integration
    5. **Healthcare**: Finding doctors, insurance claims, emergency procedures
    6. **Cultural Navigation**: Business etiquette, social norms, gift-giving, seasonal customs
    7. **Daily Life**: Transportation, shopping, dining, postal services

    **Response Format:**
    1. Acknowledge their situation with empathy
    2. Provide numbered step-by-step instructions
    3. List required documents/items
    4. Include cultural context and tips
    5. Add relevant Japanese terms
    6. Suggest next steps or alternatives

    **Example Response Structure:**
    "I understand this can feel overwhelming - many foreigners face this same challenge. Here's exactly what you need to do:

    **Step-by-Step Process:**
    1. [Specific action with location/timing]
    2. [Next concrete step]
    3. [Final step]

    **Required Documents:**
    • [Specific document 1]
    • [Specific document 2]

    **Cultural Context:**
    [Explain why this process exists and cultural considerations]

    **Key Japanese Terms:**
    • 住民登録 (jūmin tōroku) - residence registration
    • 市役所 (shiyakusho) - city hall

    **Pro Tips:**
    • [Practical advice to make the process smoother]"

    Remember: Never give vague responses like "you may need to" or "it might be helpful." Always provide concrete, actionable guidance as if you're personally guiding them through the process.`;

    const contextSection = context ? `\n\nContext: ${context}` : '';
    const userSection = `\n\nUser: ${message}`;

    return basePrompt + contextSection + userSection;
  }

  async generateJapaneseTerms(content: string): Promise<Array<{
    term: string;
    reading: string;
    meaning: string;
  }>> {
    try {
      const prompt = `Extract 3-5 relevant Japanese terms from this content about living in Japan:
      "${content}"
      
      For each term, provide:
      - The Japanese term (kanji/hiragana)
      - Reading in hiragana
      - English meaning
      
      Format as JSON array with objects containing: term, reading, meaning
      Focus on practical terms that foreigners would encounter.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        // Fallback terms
        return [
          { term: '外国人', reading: 'がいこくじん', meaning: 'foreigner' },
          { term: '住民票', reading: 'じゅうみんひょう', meaning: 'residence certificate' }
        ];
      }
    } catch (error) {
      console.error('Gemini Japanese terms error:', error);
      return [];
    }
  }
}

export const geminiAI = new GeminiAIService();