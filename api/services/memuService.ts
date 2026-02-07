/**
 * memU Cloud API Service
 * Wraps the memU memory framework API (api.memu.so) for MamaKokoro
 *
 * Memory Categories for PPD companion:
 * - mood_patterns: Daily mood entries and emotional trends
 * - triggers: Identified triggers for mood changes
 * - coping_strategies: What works/doesn't work for the user
 * - baby_milestones: Baby age, milestones, feeding/sleep patterns
 * - screening_history: EPDS and PHQ-2 scores over time
 * - personal_context: User preferences, support network, situation
 * - conversation_insights: Key themes from chat sessions
 */

const MEMU_API_BASE = process.env.MEMU_API_URL || 'https://api.memu.so';
const MEMU_API_KEY = process.env.MEMU_API_KEY || '';

// PPD-specific memory categories
export const PPD_MEMORY_CATEGORIES = [
  {
    name: 'mood_patterns',
    description: 'Daily mood entries, emotional trends, sleep quality, and energy levels tracked over time.',
  },
  {
    name: 'triggers',
    description: 'Identified triggers for mood changes — situations, times of day, activities, or thoughts that affect emotional state.',
  },
  {
    name: 'coping_strategies',
    description: 'Coping strategies the mother has tried, what helped, what did not help, and preferred self-care activities.',
  },
  {
    name: 'baby_milestones',
    description: 'Baby age, developmental milestones, feeding patterns, sleep schedule, and caregiving challenges.',
  },
  {
    name: 'screening_history',
    description: 'EPDS scores, PHQ-2 results, and crisis level history over time for longitudinal tracking.',
  },
  {
    name: 'personal_context',
    description: 'User background, support network, living situation, work status, relationship dynamics, and cultural context.',
  },
  {
    name: 'conversation_insights',
    description: 'Key themes, recurring concerns, breakthroughs, and important revelations from chat sessions.',
  },
];

interface MemUResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface MemoryItem {
  id?: string;
  memory_type: string;
  memory_content: string;
  memory_categories: string[];
  metadata?: Record<string, any>;
}

interface RetrieveResult {
  items: Array<{
    id: string;
    summary: string;
    memory_type: string;
    categories: string[];
    score?: number;
  }>;
  categories: Array<{
    name: string;
    summary: string;
  }>;
}

class MemUService {
  private apiBase: string;
  private apiKey: string;
  private initialized: boolean = false;

  constructor() {
    this.apiBase = MEMU_API_BASE;
    this.apiKey = MEMU_API_KEY;
  }

  private isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }

  private async request(endpoint: string, body: any): Promise<MemUResponse> {
    if (!this.isConfigured()) {
      console.warn('memU API key not configured, using local fallback');
      return { success: false, error: 'MEMU_API_KEY not configured' };
    }

    try {
      const response = await fetch(`${this.apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`memU API error (${response.status}):`, errorText);
        return { success: false, error: `API error: ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error('memU API request failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Memorize a conversation or text resource
   */
  async memorize(content: string, userId: string, modality: string = 'conversation'): Promise<MemUResponse> {
    return this.request('/api/v3/memory/memorize', {
      resource_content: content,
      modality,
      user_id: userId,
      memorize_config: {
        memory_categories: PPD_MEMORY_CATEGORIES,
      },
    });
  }

  /**
   * Create a specific memory item directly
   */
  async createMemoryItem(item: MemoryItem, userId: string): Promise<MemUResponse> {
    return this.request('/api/v3/memory/items', {
      memory_type: item.memory_type,
      memory_content: item.memory_content,
      memory_categories: item.memory_categories,
      user_id: userId,
      metadata: item.metadata || {},
    });
  }

  /**
   * Retrieve memories relevant to a query
   */
  async retrieve(query: string, userId: string, method: string = 'rag', limit: number = 5): Promise<RetrieveResult> {
    const result = await this.request('/api/v3/memory/retrieve', {
      queries: [{ role: 'user', content: query }],
      method,
      user_id: userId,
      limit,
    });

    if (result.success && result.data) {
      return {
        items: result.data.items || [],
        categories: result.data.categories || [],
      };
    }

    return { items: [], categories: [] };
  }

  /**
   * List all memory categories for a user
   */
  async listCategories(userId: string): Promise<any[]> {
    const result = await this.request('/api/v3/memory/categories', {
      user_id: userId,
    });

    return result.success ? (result.data?.categories || []) : [];
  }

  /**
   * List memory items, optionally filtered by category
   */
  async listItems(userId: string, category?: string): Promise<any[]> {
    const body: any = { user_id: userId };
    if (category) {
      body.where = { category };
    }

    const result = await this.request('/api/v3/memory/items/list', body);
    return result.success ? (result.data?.items || []) : [];
  }

  // =========================================================
  // PPD-specific convenience methods
  // =========================================================

  /**
   * Store a mood entry as a memory
   */
  async storeMoodEntry(userId: string, mood: {
    value: number;
    label: string;
    note?: string;
    sleep?: number;
    timestamp: string;
  }): Promise<MemUResponse> {
    const content = `Mood entry on ${mood.timestamp}: Feeling ${mood.label} (${mood.value}/5). ` +
      `Sleep: ${mood.sleep || 'not recorded'} hours. ` +
      (mood.note ? `Note: ${mood.note}` : '');

    return this.createMemoryItem({
      memory_type: 'profile',
      memory_content: content,
      memory_categories: ['mood_patterns'],
      metadata: {
        type: 'mood_entry',
        value: mood.value,
        label: mood.label,
        sleep: mood.sleep,
        timestamp: mood.timestamp,
      },
    }, userId);
  }

  /**
   * Store a journal entry as a memory
   */
  async storeJournalEntry(userId: string, entry: {
    content: string;
    mood?: string;
    gratitude?: string;
    timestamp: string;
  }): Promise<MemUResponse> {
    let content = `Journal entry on ${entry.timestamp}: ${entry.content}`;
    if (entry.mood) content += ` Mood: ${entry.mood}.`;
    if (entry.gratitude) content += ` Grateful for: ${entry.gratitude}.`;

    return this.createMemoryItem({
      memory_type: 'profile',
      memory_content: content,
      memory_categories: ['conversation_insights', 'mood_patterns'],
      metadata: {
        type: 'journal_entry',
        mood: entry.mood,
        timestamp: entry.timestamp,
      },
    }, userId);
  }

  /**
   * Store EPDS screening result as a memory
   */
  async storeScreeningResult(userId: string, screening: {
    totalScore: number;
    item10Score: number;
    crisisLevel: string;
    answers: number[];
    timestamp: string;
  }): Promise<MemUResponse> {
    const content = `EPDS screening on ${screening.timestamp}: ` +
      `Total score ${screening.totalScore}/30. ` +
      `Crisis level: ${screening.crisisLevel}. ` +
      `Item 10 (self-harm): ${screening.item10Score}/3. ` +
      (screening.totalScore >= 9 ? 'Score indicates possible PPD — professional follow-up recommended.' : 'Score within normal range.');

    return this.createMemoryItem({
      memory_type: 'profile',
      memory_content: content,
      memory_categories: ['screening_history'],
      metadata: {
        type: 'epds_screening',
        totalScore: screening.totalScore,
        item10Score: screening.item10Score,
        crisisLevel: screening.crisisLevel,
        timestamp: screening.timestamp,
      },
    }, userId);
  }

  /**
   * Store a chat conversation exchange for memory
   */
  async storeConversation(userId: string, userMessage: string, aiResponse: string, crisisLevel: string): Promise<MemUResponse> {
    const content = `User said: "${userMessage}"\nKokoro responded about: ${aiResponse.substring(0, 200)}...\nCrisis level: ${crisisLevel}`;

    return this.memorize(content, userId, 'conversation');
  }

  /**
   * Retrieve personalized context for chat
   * Returns recent mood patterns, coping strategies, and relevant memories
   */
  async getPersonalizedContext(userId: string, currentMessage: string): Promise<string> {
    const memories = await this.retrieve(currentMessage, userId, 'rag', 5);

    if (memories.items.length === 0 && memories.categories.length === 0) {
      return '';
    }

    let context = '\n\n**Relevant memories about this mother:**\n';

    // Add category summaries
    for (const cat of memories.categories) {
      if (cat.summary) {
        context += `- [${cat.name}]: ${cat.summary}\n`;
      }
    }

    // Add specific memory items
    for (const item of memories.items.slice(0, 5)) {
      context += `- ${item.summary}\n`;
    }

    return context;
  }

  /**
   * Get mood trend summary for a user
   */
  async getMoodTrend(userId: string): Promise<string> {
    const result = await this.retrieve(
      'What are the recent mood patterns and emotional trends?',
      userId,
      'rag',
      10
    );

    if (result.items.length === 0) {
      return 'No mood data recorded yet.';
    }

    const moodItems = result.items
      .filter(item => item.summary.toLowerCase().includes('mood') || item.summary.toLowerCase().includes('feeling'))
      .map(item => item.summary);

    return moodItems.length > 0
      ? `Recent mood patterns: ${moodItems.join('; ')}`
      : 'Limited mood data available.';
  }
}

// Singleton export
export const memuService = new MemUService();
