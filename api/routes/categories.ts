import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Categories fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    res.json({ categories });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get category with tips count
router.get('/with-counts', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        tips (count)
      `)
      .order('name');

    if (error) {
      console.error('Categories with counts fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    const categoriesWithCounts = categories?.map(category => ({
      ...category,
      tipCount: category.tips?.[0]?.count || 0
    })) || [];

    res.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Categories with counts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;