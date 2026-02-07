import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { memuService } from '../services/memuService.js';

const router = express.Router();

// Store a mood entry
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { value, label, note, sleep } = req.body;
    const userId = req.user.id;

    if (value === undefined || !label) {
      return res.status(400).json({ error: 'Mood value and label are required' });
    }

    const timestamp = new Date().toISOString();

    // Store in memU memory
    const memuResult = await memuService.storeMoodEntry(userId, {
      value,
      label,
      note,
      sleep,
      timestamp,
    });

    // Also store a coping/trigger memory if mood is low and note is provided
    if (value <= 2 && note) {
      await memuService.createMemoryItem({
        memory_type: 'profile',
        memory_content: `When feeling ${label}, the mother noted: "${note}". This may indicate a trigger or pattern worth tracking.`,
        memory_categories: ['triggers', 'mood_patterns'],
        metadata: { type: 'trigger_observation', mood_value: value, timestamp },
      }, userId);
    }

    res.json({
      success: true,
      entry: { value, label, note, sleep, timestamp },
      memoryStored: memuResult.success,
    });
  } catch (error) {
    console.error('Mood entry error:', error);
    res.status(500).json({ error: 'Failed to store mood entry' });
  }
});

// Store PHQ-2 result
router.post('/phq2', authenticateToken, async (req: any, res) => {
  try {
    const { answers, total } = req.body;
    const userId = req.user.id;
    const timestamp = new Date().toISOString();

    const content = `PHQ-2 quick screen on ${timestamp}: ` +
      `Score ${total}/6. ` +
      (total >= 3 ? 'Score suggests further EPDS screening recommended.' : 'Score within normal range.');

    await memuService.createMemoryItem({
      memory_type: 'profile',
      memory_content: content,
      memory_categories: ['screening_history'],
      metadata: { type: 'phq2_screening', total, answers, timestamp },
    }, userId);

    res.json({ success: true, total, suggestEPDS: total >= 3 });
  } catch (error) {
    console.error('PHQ-2 error:', error);
    res.status(500).json({ error: 'Failed to store PHQ-2 result' });
  }
});

// Get mood trend/summary from memU
router.get('/trend', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const trend = await memuService.getMoodTrend(userId);
    res.json({ success: true, trend });
  } catch (error) {
    console.error('Mood trend error:', error);
    res.status(500).json({ error: 'Failed to get mood trend' });
  }
});

export default router;
