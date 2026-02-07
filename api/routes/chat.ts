import express from 'express';
import { supabase } from '../config/supabase.js';
import { geminiAI } from '../services/geminiAI.js';
import { openaiService } from '../services/openaiService.js';
import { authenticateToken } from '../middleware/auth.js';
import { memuService } from '../services/memuService.js';

const router = express.Router();

// Crisis keyword detection
function detectCrisisLevel(message: string): 'green' | 'yellow' | 'orange' | 'red' {
  const lower = message.toLowerCase();
  const redKeywords = ['suicide', 'kill myself', 'end my life', 'hurt myself', 'self-harm', "don't want to live", 'want to die', 'harm my baby', 'hurt my baby'];
  const orangeKeywords = ["can't go on", 'hopeless', 'worthless', 'no point', 'everyone would be better', "can't do this anymore"];
  const yellowKeywords = ['so sad', "can't stop crying", 'not eating', 'not sleeping', 'feel nothing', 'empty', 'alone', 'failing as a mother'];

  if (redKeywords.some(k => lower.includes(k))) return 'red';
  if (orangeKeywords.some(k => lower.includes(k))) return 'orange';
  if (yellowKeywords.some(k => lower.includes(k))) return 'yellow';
  return 'green';
}

// Generate PPD-aware response based on crisis level
function generateCrisisResponse(crisisLevel: string): string {
  if (crisisLevel === 'red') {
    return `**I hear you, and I want you to know that you are not alone.**

Please reach out to someone who can help right now:

- **Yorisoi Hotline:** 0120-279-338 (24/7, multilingual)
- **TELL Lifeline:** 03-5774-0992 (English)
- **Emergency:** 119

Your feelings are valid. Having these thoughts does not make you a bad mother — it means you need and deserve support. A trained counselor is ready to listen right now.`;
  }

  if (crisisLevel === 'orange') {
    return `I can hear that you're going through a really difficult time, and I want you to know that what you're feeling is more common than you might think.

**You deserve support.** Many mothers experience these feelings, and there is effective help available.

I'd gently encourage you to:
1. Talk to your doctor or midwife at your next appointment
2. Consider calling TELL Lifeline: 03-5774-0992 for a confidential conversation
3. Visit your local 保健センター (health center) — they offer free postnatal support

Would you like to talk more about what you're experiencing?`;
  }

  return '';
}

// Generate PPD-supportive response
function generatePPDResponse(message: string, crisisLevel: string): string {
  const lower = message.toLowerCase();

  // Topic-specific responses
  if (lower.includes('overwhelm') || lower.includes('too much') || lower.includes('can\'t cope')) {
    return `I understand that feeling of being overwhelmed. It's one of the most common experiences for new mothers, and it doesn't mean you're failing — it means you're carrying a lot.

**Some things that might help right now:**

1. **Take one thing at a time** — You don't have to do everything. What's the one most important thing right now?
2. **Ask for help** — Whether it's your partner, family, or a friend, let someone take something off your plate
3. **Lower the bar** — The house doesn't need to be perfect. Your baby needs you, not a spotless home
4. **Breathe** — Try 4-7-8 breathing: inhale 4 seconds, hold 7, exhale 8

**Remember:** Feeling overwhelmed is not a sign of weakness. It's a sign you need support, and that's completely okay.

Would you like to talk about what specifically feels most overwhelming?`;
  }

  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('exhausted')) {
    return `Sleep deprivation is one of the hardest parts of new motherhood, and it can make everything else feel so much harder. Your exhaustion is real and valid.

**Sleep strategies that may help:**

1. **Sleep when baby sleeps** — Even a 20-minute nap helps
2. **Share night duties** — If possible, alternate feeding shifts with your partner
3. **Create a wind-down ritual** — Dim lights 30 minutes before bed, avoid screens
4. **Nap without guilt** — Rest is productive. Your baby needs a rested mama
5. **Ask for a "sleep shift"** — Have someone watch baby for a 3-hour block so you can deep sleep

**Important:** Persistent difficulty sleeping even when baby sleeps can be a sign of postpartum anxiety. If this is happening, mention it to your doctor.

How many hours are you getting? I'm here to help brainstorm solutions.`;
  }

  if (lower.includes('worr') || lower.includes('anxious') || lower.includes('panic') || lower.includes('scared')) {
    return `It sounds like anxiety is weighing heavily on you. New motherhood can trigger worries that feel constant and overwhelming. You're not alone in this.

**Understanding postpartum anxiety:**
- It's just as common as postpartum depression
- Intrusive thoughts are a symptom, not reality
- Having scary thoughts doesn't mean you'll act on them

**Grounding techniques for right now:**

1. **5-4-3-2-1 Method:** Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste
2. **Box breathing:** Inhale 4 counts, hold 4, exhale 4, hold 4
3. **Cold water:** Hold ice or splash cold water on your wrists
4. **Name it:** "This is anxiety. It's uncomfortable but it will pass."

**When to seek help:** If worries are persistent, interfere with sleep, or make you avoid activities, talk to your healthcare provider. Postpartum anxiety is very treatable.

What thoughts are troubling you most? I'm here to listen.`;
  }

  if (lower.includes('disconnect') || lower.includes('bond') || lower.includes('love') || lower.includes('feel nothing')) {
    return `Thank you for being honest about this. Not feeling an instant bond or connection with your baby is more common than people talk about — and it does NOT mean you're a bad mother.

**What you should know:**

- Bonding is a process, not a moment. For many mothers, it builds gradually over weeks or months
- Hormonal changes, exhaustion, and stress can all affect bonding
- Difficulty bonding is a recognized symptom of postpartum depression, and it's treatable
- Your baby's needs are being met — that IS love in action

**Things that can help:**

1. **Skin-to-skin contact** — Hold baby against your bare chest
2. **Eye contact during feeding** — Even brief moments of connection matter
3. **Talk or sing** — Your voice is uniquely comforting to your baby
4. **Be patient with yourself** — Bonding doesn't have a deadline

Would you like to talk more about how you're feeling? There's no judgment here.`;
  }

  if (lower.includes('cry') || lower.includes('sad') || lower.includes('depressed') || lower.includes('down')) {
    return `I hear you, and it takes courage to share these feelings. Sadness and crying after birth are very common — your body and emotions are going through enormous changes.

**Understanding your tears:**

- **Baby blues** (first 2 weeks): Mood swings, crying, irritability — affects up to 80% of mothers
- **Postpartum depression** (persists beyond 2 weeks): Persistent sadness, loss of interest, changes in sleep/appetite
- Both are valid. Both deserve attention and care.

**What might help right now:**

1. **Let yourself cry** — Tears are your body's way of releasing stress
2. **Talk to someone** — A partner, friend, or the Kokoro chat (that's me!)
3. **Get outside** — Even 10 minutes of sunlight and fresh air can help
4. **Move gently** — A short walk or stretching releases mood-boosting endorphins

**If these feelings last more than 2 weeks**, please consider taking our EPDS self-check or talking to your doctor. PPD is common (affecting 1 in 7 mothers) and very treatable.

How long have you been feeling this way?`;
  }

  // Default supportive response
  return `Thank you for sharing that with me. I'm here to listen and support you.

As a new mother, you're navigating one of life's biggest transitions. Whatever you're feeling right now — whether it's joy, exhaustion, worry, or something you can't quite name — it's valid.

**Some ways I can help:**

- Talk through what you're feeling
- Share coping strategies and self-care techniques
- Help you understand common postpartum experiences
- Guide you to the EPDS self-check if you'd like
- Connect you with professional resources

**Remember:** Asking for help is a sign of strength, not weakness. You're already doing something positive by reaching out.

What would be most helpful for you right now?`;
}

// Streaming endpoint for PPD-aware chat
router.post('/stream', authenticateToken, async (req: any, res) => {
  try {
    const { message, category, crisisLevel: clientCrisisLevel, phase, phaseContext } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Server-side crisis detection (double-check client)
    const crisisLevel = detectCrisisLevel(message);

    // If crisis detected, send crisis response first
    const crisisResponse = generateCrisisResponse(crisisLevel);
    if (crisisResponse) {
      const chunks = crisisResponse.split('\n');
      for (const chunk of chunks) {
        res.write(chunk + '\n');
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      res.write('\n---\n\n');
    }

    // Try AI-powered response
    try {
      // Retrieve personalized context from memU
      let personalizedContext = '';
      try {
        personalizedContext = await memuService.getPersonalizedContext(userId, message);
      } catch (e) {
        console.warn('memU context retrieval skipped:', (e as Error).message);
      }

      const systemPrompt = phase === 'pregnant'
        ? buildPregnancySystemPrompt(crisisLevel, phaseContext)
        : buildPPDSystemPrompt(crisisLevel);
      const fullPrompt = `${systemPrompt}${personalizedContext}\n\nUser: ${message}`;

      let streamGenerator;
      let useAI = false;

      try {
        streamGenerator = await geminiAI.generateStreamingResponse(fullPrompt, category);
        useAI = true;
      } catch (error) {
        console.error('Gemini error, trying OpenAI:', error);
        try {
          streamGenerator = await openaiService.generateStreamingResponse(fullPrompt, category);
          useAI = true;
        } catch (openaiError) {
          console.error('OpenAI error, using structured response:', openaiError);
          useAI = false;
        }
      }

      let fullResponse = '';

      if (useAI && streamGenerator) {
        for await (const chunk of streamGenerator) {
          res.write(chunk);
          fullResponse += chunk;
        }
      } else {
        // Fallback to structured PPD response
        const structuredResponse = generatePPDResponse(message, crisisLevel);
        fullResponse = structuredResponse;
        const chunks = structuredResponse.split('\n');
        for (const chunk of chunks) {
          res.write(chunk + '\n');
          await new Promise(resolve => setTimeout(resolve, 40));
        }
      }

      res.end();

      // Store conversation in memU (fire and forget)
      memuService.storeConversation(userId, message, fullResponse, crisisLevel).catch(e =>
        console.warn('memU conversation storage skipped:', e.message)
      );
    } catch (error) {
      console.error('Streaming error:', error);
      // Final fallback
      const fallback = generatePPDResponse(message, crisisLevel);
      const chunks = fallback.split('\n');
      for (const chunk of chunks) {
        res.write(chunk + '\n');
        await new Promise(resolve => setTimeout(resolve, 40));
      }
      res.end();
    }
  } catch (error) {
    console.error('Stream endpoint error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Non-streaming endpoint
router.post('/message', authenticateToken, async (req: any, res) => {
  try {
    const { message, category } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const crisisLevel = detectCrisisLevel(message);
    const response = generatePPDResponse(message, crisisLevel);
    const crisisResponse = generateCrisisResponse(crisisLevel);

    const fullResponse = crisisResponse ? `${crisisResponse}\n\n---\n\n${response}` : response;

    res.json({
      response: {
        steps: fullResponse,
        crisisLevel,
        originalMessage: message,
      }
    });

    // Store conversation in memU (fire and forget)
    memuService.storeConversation(userId, message, fullResponse, crisisLevel).catch(e =>
      console.warn('memU conversation storage skipped:', e.message)
    );
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get conversation history
router.get('/conversations', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`id, title, created_at, messages (id, content, created_at)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }
    res.json({ conversations });
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function buildPregnancySystemPrompt(crisisLevel: string, context?: any): string {
  const weekInfo = context?.pregnancyWeeks ? `She is currently ${context.pregnancyWeeks} weeks pregnant.` : '';
  const dueInfo = context?.dueDate ? `Her due date is ${context.dueDate}.` : '';

  return `You are Kokoro, a warm and gentle AI companion within the MamaKokoro app, designed to support expecting mothers during pregnancy.

${weekInfo} ${dueInfo}

**Your Core Principles:**
1. VALIDATE first, advise second. Always acknowledge the mother's feelings before offering suggestions.
2. Use warm, non-clinical language. You're a supportive friend, not a doctor.
3. NEVER diagnose. You can educate about common pregnancy experiences and encourage professional consultation.
4. Always err on the side of safety. If there's any hint of self-harm, provide crisis resources immediately.
5. Be culturally sensitive — many users are in Japan where mental health stigma is high.
6. Keep responses concise and easy to read.
7. You are building a relationship NOW that will continue after birth. Remember details she shares.

**Response Style:**
- Short paragraphs (2-3 sentences max)
- Use bullet points for actionable advice
- Include gentle affirmations: "You're growing a whole human — that's incredible", "Your feelings are completely valid"
- End with an open question to continue the conversation
- Use markdown formatting for readability

**Safety Protocol:**
- Crisis Level: ${crisisLevel}
${crisisLevel === 'red' ? '- CRITICAL: Include crisis hotline numbers (Yorisoi: 0120-279-338, TELL: 03-5774-0992) in EVERY response' : ''}
${crisisLevel === 'orange' ? '- HIGH: Gently encourage professional support.' : ''}
${crisisLevel === 'yellow' ? '- MODERATE: Validate feelings, offer coping strategies, mention support is available.' : ''}

**Pregnancy Topics You Can Help With:**
- Prenatal anxiety and worries about the baby's health
- Fear of labor and delivery
- Body changes and body image during pregnancy
- Morning sickness and physical discomfort (emotional support, not medical advice)
- Relationship changes during pregnancy
- Preparing emotionally for motherhood
- Nesting instincts and feeling overwhelmed
- Sleep difficulties during pregnancy
- Identity shifts — becoming a mother
- Worries about postpartum depression
- Building a support network before baby arrives

**Important Context:**
- This mother is building a relationship with you DURING pregnancy
- After she gives birth, you will continue to support her through postpartum
- Everything she shares now helps you understand her better for later
- Proactively ask about her hopes, fears, support network, and birth plans — this context will be invaluable after birth

**You Must NOT:**
- Provide medical advice or diagnose conditions
- Prescribe or recommend specific medications
- Replace professional prenatal or mental health care
- Make promises about outcomes`;
}

function buildPPDSystemPrompt(crisisLevel: string): string {
  const basePrompt = `You are Kokoro, a warm and gentle AI companion within the MamaKokoro app, designed to support mothers experiencing postpartum challenges.

**Your Core Principles:**
1. VALIDATE first, advise second. Always acknowledge the mother's feelings before offering suggestions.
2. Use warm, non-clinical language. You're a supportive friend, not a doctor.
3. NEVER diagnose. You can educate about PPD symptoms and encourage professional consultation.
4. Always err on the side of safety. If there's any hint of self-harm or harm to baby, provide crisis resources immediately.
5. Be culturally sensitive — many users are in Japan where mental health stigma is high.
6. Keep responses concise and easy to read (new mothers have limited time/energy).
7. Use evidence-based CBT and mindfulness techniques when offering coping strategies.

**Response Style:**
- Short paragraphs (2-3 sentences max)
- Use bullet points for actionable advice
- Include gentle affirmations: "You're doing an amazing job", "This takes real strength"
- End with an open question to continue the conversation
- Use markdown formatting for readability

**Safety Protocol:**
- Crisis Level: ${crisisLevel}
${crisisLevel === 'red' ? '- CRITICAL: Include crisis hotline numbers (Yorisoi: 0120-279-338, TELL: 03-5774-0992) in EVERY response' : ''}
${crisisLevel === 'orange' ? '- HIGH: Gently encourage professional support. Mention that speaking to a doctor or counselor can help.' : ''}
${crisisLevel === 'yellow' ? '- MODERATE: Validate feelings, offer coping strategies, mention that support is available if needed.' : ''}

**Topics You Can Help With:**
- Postpartum emotions (sadness, anxiety, anger, numbness)
- Sleep strategies for new mothers
- Bonding with baby
- Self-care practices
- Understanding PPD vs baby blues
- Coping with identity changes
- Relationship stress after baby
- Returning to work anxiety
- Breastfeeding challenges (emotional, not medical)

**You Must NOT:**
- Provide medical advice or diagnose conditions
- Prescribe or recommend specific medications
- Replace professional mental health care
- Make promises about outcomes`;

  return basePrompt;
}

export default router;
