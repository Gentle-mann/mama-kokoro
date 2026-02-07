import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { BytePlusAIService } from '../services/byteplusAI.js';

const router = express.Router();
const aiService = BytePlusAIService.getInstance();

// Middleware to verify JWT token (optional for some routes)
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    req.userId = null;
    next();
  }
};

// Required auth middleware
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all tips with optional category filter
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;
    
    let query = supabase
      .from('tips')
      .select(`
        id,
        title,
        content,
        category,
        visual_url,
        created_at,
        users!tips_user_id_fkey (
          name
        ),
        tip_ratings (
          rating
        ),
        tip_likes (
          id
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: tips, error } = await query;

    if (error) {
      console.error('Tips fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch tips' });
    }

    // Calculate average ratings and like counts
    const tipsWithRatings = tips?.map((tip: any) => ({
      ...tip,
      averageRating: tip.tip_ratings.length > 0 
        ? tip.tip_ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / tip.tip_ratings.length
        : 0,
      ratingCount: tip.tip_ratings.length,
      likeCount: tip.tip_likes.length,
      author: tip.users?.name || 'Anonymous'
    })) || [];

    res.json({ tips: tipsWithRatings });
  } catch (error) {
    console.error('Tips error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's own tips
router.get('/my-posts', requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;

    const { data: tips, error } = await supabase
      .from('tips')
      .select(`
        id,
        title,
        content,
        category,
        visual_url,
        created_at,
        users!tips_user_id_fkey (
          name
        ),
        tip_ratings (
          rating
        ),
        tip_likes (
          id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('User tips fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch user tips' });
    }

    // Calculate average ratings and like counts
    const tipsWithRatings = tips?.map((tip: any) => ({
      ...tip,
      averageRating: tip.tip_ratings.length > 0 
        ? tip.tip_ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / tip.tip_ratings.length
        : 0,
      ratingCount: tip.tip_ratings.length,
      likeCount: tip.tip_likes.length,
      author: tip.users?.name || 'Anonymous'
    })) || [];

    res.json({ tips: tipsWithRatings });
  } catch (error) {
    console.error('User tips error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single tip
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const tipId = req.params.id;

    const { data: tip, error } = await supabase
      .from('tips')
      .select(`
        id,
        title,
        content,
        category,
        visual_url,
        created_at,
        users!tips_user_id_fkey (
          name
        ),
        tip_ratings (
          rating
        ),
        tip_likes (
          id
        )
      `)
      .eq('id', tipId)
      .single();

    if (error) {
      console.error('Tip fetch error:', error);
      return res.status(404).json({ error: 'Tip not found' });
    }

    // Calculate average rating and like count
    const averageRating = tip.tip_ratings.length > 0 
      ? tip.tip_ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / tip.tip_ratings.length
      : 0;

    res.json({
      tip: {
        ...tip,
        averageRating,
        ratingCount: tip.tip_ratings.length,
        likeCount: tip.tip_likes.length,
        author: (tip as any).users?.name || 'Anonymous'
      }
    });
  } catch (error) {
    console.error('Tip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new tip
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.userId;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    // Generate AI summary and visual
    const summary = await aiService.generateTipSummary(content);
    const visualUrl = await aiService.generateTipVisual(title, category);

    const { data: tip, error } = await supabase
      .from('tips')
      .insert([
        {
          user_id: userId,
          title,
          content,
          category,
          summary,
          visual_url: visualUrl,
        },
      ])
      .select(`
        id,
        title,
        content,
        category,
        visual_url,
        created_at,
        users!tips_user_id_fkey (
          name
        )
      `)
      .single();

    if (error) {
      console.error('Tip creation error:', error);
      return res.status(500).json({ error: 'Failed to create tip' });
    }

    res.status(201).json({
      message: 'Tip created successfully',
      tip: {
          ...tip,
          author: (tip as any).users?.name || 'Anonymous',
          averageRating: 0,
          ratingCount: 0,
          likeCount: 0
        }
    });
  } catch (error) {
    console.error('Tip creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rate a tip
router.post('/:id/rate', requireAuth, async (req: any, res) => {
  try {
    const tipId = req.params.id;
    const { rating } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if tip exists
    const { data: tip, error: tipError } = await supabase
      .from('tips')
      .select('id')
      .eq('id', tipId)
      .single();

    if (tipError || !tip) {
      return res.status(404).json({ error: 'Tip not found' });
    }

    // Upsert rating
    const { error } = await supabase
      .from('tip_ratings')
      .upsert([
        {
          tip_id: tipId,
          user_id: userId,
          rating,
        },
      ], {
        onConflict: 'tip_id,user_id'
      });

    if (error) {
      console.error('Rating error:', error);
      return res.status(500).json({ error: 'Failed to save rating' });
    }

    res.json({ message: 'Rating saved successfully' });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured tips
router.get('/featured/list', async (req, res) => {
  try {
    const { data: tips, error } = await supabase
      .from('tips')
      .select(`
        id,
        title,
        content,
        category,
        visual_url,
        created_at,
        users!tips_user_id_fkey (
          name
        ),
        tip_ratings (
          rating
        ),
        tip_likes (
          id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Featured tips fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch featured tips' });
    }

    const featuredTips = tips?.map((tip: any) => ({
      ...tip,
      averageRating: tip.tip_ratings.length > 0 
        ? tip.tip_ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / tip.tip_ratings.length
        : 0,
      ratingCount: tip.tip_ratings.length,
      likeCount: tip.tip_likes.length,
      author: tip.users?.name || 'Anonymous'
    })) || [];

    res.json({ tips: featuredTips });
  } catch (error) {
    console.error('Featured tips error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's own tips


// Get comments for a specific tip
router.get('/:tipId/comments', async (req, res) => {
  try {
    const { tipId } = req.params;

    const { data: comments, error } = await supabase
      .from('tip_comments')
      .select(`
        id,
        content,
        created_at,
        users!tip_comments_user_id_fkey (
          id,
          name
        )
      `)
      .eq('tip_id', tipId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Comments fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }

    const formattedComments = comments?.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author: comment.users?.name || 'Anonymous',
      user_id: comment.users?.id
    })) || [];

    res.json({ comments: formattedComments });
  } catch (error) {
    console.error('Comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a comment to a tip
router.post('/:tipId/comments', requireAuth, async (req: any, res) => {
  try {
    const { tipId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Check if tip exists
    const { data: tip, error: tipError } = await supabase
      .from('tips')
      .select('id')
      .eq('id', tipId)
      .single();

    if (tipError || !tip) {
      return res.status(404).json({ error: 'Tip not found' });
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('tip_comments')
      .insert({
        tip_id: tipId,
        user_id: userId,
        content: content.trim()
      })
      .select(`
        id,
        content,
        created_at,
        users!tip_comments_user_id_fkey (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Comment insert error:', error);
      return res.status(500).json({ error: 'Failed to add comment' });
    }

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author: (comment as any).users?.name || 'Anonymous',
      user_id: (comment as any).users?.id
    };

    res.status(201).json({ comment: formattedComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like a tip
router.post('/:id/like', requireAuth, async (req: any, res) => {
  try {
    const tipId = req.params.id;
    const userId = req.userId;

    // Check if tip exists
    const { data: tip, error: tipError } = await supabase
      .from('tips')
      .select('id')
      .eq('id', tipId)
      .single();

    if (tipError || !tip) {
      return res.status(404).json({ error: 'Tip not found' });
    }

    // Check if user already liked this tip
    const { data: existingLike, error: checkError } = await supabase
      .from('tip_likes')
      .select('id')
      .eq('tip_id', tipId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Like check error:', checkError);
      return res.status(500).json({ error: 'Failed to check like status' });
    }

    if (existingLike) {
      return res.status(400).json({ error: 'You have already liked this tip' });
    }

    // Insert like
    const { error: insertError } = await supabase
      .from('tip_likes')
      .insert({
        tip_id: tipId,
        user_id: userId
      });

    if (insertError) {
      console.error('Like insert error:', insertError);
      return res.status(500).json({ error: 'Failed to like tip' });
    }

    // Get updated like count
    const { data: likeCount, error: countError } = await supabase
      .from('tip_likes')
      .select('id', { count: 'exact' })
      .eq('tip_id', tipId);

    if (countError) {
      console.error('Like count error:', countError);
      return res.status(500).json({ error: 'Failed to get like count' });
    }

    res.json({ 
      message: 'Tip liked successfully',
      likeCount: likeCount?.length || 0
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlike a tip
router.delete('/:id/like', requireAuth, async (req: any, res) => {
  try {
    const tipId = req.params.id;
    const userId = req.userId;

    // Delete like
    const { error } = await supabase
      .from('tip_likes')
      .delete()
      .eq('tip_id', tipId)
      .eq('user_id', userId);

    if (error) {
      console.error('Unlike error:', error);
      return res.status(500).json({ error: 'Failed to unlike tip' });
    }

    // Get updated like count
    const { data: likeCount, error: countError } = await supabase
      .from('tip_likes')
      .select('id', { count: 'exact' })
      .eq('tip_id', tipId);

    if (countError) {
      console.error('Like count error:', countError);
      return res.status(500).json({ error: 'Failed to get like count' });
    }

    res.json({ 
      message: 'Tip unliked successfully',
      likeCount: likeCount?.length || 0
    });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;