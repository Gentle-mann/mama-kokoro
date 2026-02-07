import OpenAI from 'openai';

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key not found. OpenAI services will be disabled.');
      // Create a dummy OpenAI instance to prevent crashes
      this.openai = new OpenAI({ apiKey: 'dummy-key' });
      return;
    }
    
    this.openai = new OpenAI({ apiKey });
  }

  private isConfigured(): boolean {
    return process.env.OPENAI_API_KEY !== undefined && process.env.OPENAI_API_KEY !== 'dummy-key';
  }

  async generateChatResponse(message: string, context?: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const prompt = this.buildChatPrompt(message, context);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response from OpenAI');
    }
  }

  async generateStreamingResponse(prompt: string, context?: string): Promise<AsyncIterable<string>> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      });

      return this.processStream(stream);
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error('Failed to generate streaming response from OpenAI');
    }
  }

  private async* processStream(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  private async* createFallbackStream(message: string): AsyncIterable<string> {
    // Return a simple fallback message as a stream
    yield message;
  }

  private buildChatPrompt(message: string, context?: string): string {
    return `You are ByteFriend, an AI assistant specializing in helping foreigners navigate life in Japan. You provide concrete, step-by-step guidance with cultural context and empathy.

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
2. Provide numbered, actionable steps
3. Include cultural context and explanations
4. Suggest Japanese terms they should know
5. Offer encouragement and next steps

**Context**: ${context || 'General assistance for living in Japan'}

Remember: You're not just providing information - you're being a supportive friend who understands the challenges of adapting to life in Japan.`;
  }

  async generateRecommendations(message: string, category?: string): Promise<string[]> {
    try {
      const prompt = `Based on this message about ${category || 'living in Japan'}: "${message}"
      
      Generate 3-4 practical recommendations that would help this person. Focus on:
      - Specific actions they can take
      - Resources they should know about
      - Cultural tips that would be helpful
      
      Return as a JSON array of strings.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 300
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          return JSON.parse(response);
        } catch {
          // Fallback recommendations
          return [
            'Visit your local city hall for official procedures',
            'Join community groups to meet locals',
            'Practice Japanese daily for better communication',
            'Keep important documents organized and accessible'
          ];
        }
      }
      
      return [];
    } catch (error) {
      console.error('OpenAI recommendations error:', error);
      return [];
    }
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

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 400
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          return JSON.parse(response);
        } catch {
          // Fallback terms
          return [
            { term: '外国人', reading: 'がいこくじん', meaning: 'foreigner' },
            { term: '住民票', reading: 'じゅうみんひょう', meaning: 'residence certificate' }
          ];
        }
      }
      
      return [];
    } catch (error) {
      console.error('OpenAI Japanese terms error:', error);
      return [];
    }
  }
}

export const openaiService = new OpenAIService();