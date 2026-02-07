import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { memuService } from '../services/memuService.js';

const router = express.Router();

// Store EPDS screening result
router.post('/epds', authenticateToken, async (req: any, res) => {
  try {
    const { answers, totalScore, item10Score, crisisLevel } = req.body;
    const userId = req.user.id;

    if (totalScore === undefined || !answers || !crisisLevel) {
      return res.status(400).json({ error: 'Screening data is required' });
    }

    const timestamp = new Date().toISOString();

    // Store in memU memory
    const memuResult = await memuService.storeScreeningResult(userId, {
      totalScore,
      item10Score,
      crisisLevel,
      answers,
      timestamp,
    });

    // If score indicates concern, create a specific memory about it
    if (totalScore >= 9) {
      await memuService.createMemoryItem({
        memory_type: 'profile',
        memory_content: `EPDS score of ${totalScore} on ${timestamp} indicates possible postpartum depression. ` +
          `Crisis level: ${crisisLevel}. Professional consultation recommended. ` +
          `Areas of highest concern: ${getHighConcernAreas(answers)}.`,
        memory_categories: ['screening_history', 'personal_context'],
        metadata: { type: 'clinical_flag', totalScore, crisisLevel, timestamp },
      }, userId);
    }

    res.json({
      success: true,
      result: { totalScore, item10Score, crisisLevel, timestamp },
      memoryStored: memuResult.success,
    });
  } catch (error) {
    console.error('Screening error:', error);
    res.status(500).json({ error: 'Failed to store screening result' });
  }
});

// Get screening history from memU
router.get('/history', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const results = await memuService.retrieve(
      'What are the EPDS screening scores and history?',
      userId,
      'rag',
      10
    );

    res.json({
      success: true,
      history: results.items
        .filter(item => item.summary.toLowerCase().includes('epds') || item.summary.toLowerCase().includes('screening'))
        .map(item => item.summary),
    });
  } catch (error) {
    console.error('Screening history error:', error);
    res.status(500).json({ error: 'Failed to get screening history' });
  }
});

// Helper: identify high-concern areas from EPDS answers
function getHighConcernAreas(answers: number[]): string {
  const areas: string[] = [];
  const labels = [
    'laughing/humor', 'enjoyment/anticipation', 'self-blame',
    'anxiety', 'panic/fear', 'things piling up',
    'sleep difficulty', 'sadness', 'crying', 'self-harm thoughts'
  ];

  answers.forEach((score, i) => {
    if (score >= 2) {
      areas.push(labels[i]);
    }
  });

  return areas.length > 0 ? areas.join(', ') : 'general elevated scores';
}

export default router;
