import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { memuService } from '../services/memuService.js';

const router = express.Router();

// Store a journal entry
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { content, mood, gratitude } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Journal content is required' });
    }

    const timestamp = new Date().toISOString();

    // Store in memU memory
    const memuResult = await memuService.storeJournalEntry(userId, {
      content,
      mood,
      gratitude,
      timestamp,
    });

    // If gratitude is provided, also store as a coping strategy
    if (gratitude) {
      await memuService.createMemoryItem({
        memory_type: 'profile',
        memory_content: `The mother expressed gratitude for: "${gratitude}". Gratitude practice is an active coping strategy.`,
        memory_categories: ['coping_strategies'],
        metadata: { type: 'gratitude_entry', timestamp },
      }, userId);
    }

    res.json({
      success: true,
      entry: { content, mood, gratitude, timestamp },
      memoryStored: memuResult.success,
    });
  } catch (error) {
    console.error('Journal entry error:', error);
    res.status(500).json({ error: 'Failed to store journal entry' });
  }
});

// Get journal insights from memU
router.get('/insights', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const results = await memuService.retrieve(
      'What are the key themes and insights from journal entries?',
      userId,
      'rag',
      10
    );

    res.json({
      success: true,
      insights: results.items.map(item => item.summary),
      categories: results.categories,
    });
  } catch (error) {
    console.error('Journal insights error:', error);
    res.status(500).json({ error: 'Failed to get journal insights' });
  }
});

export default router;
