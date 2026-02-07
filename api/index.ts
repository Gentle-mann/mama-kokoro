/**
 * MamaKokoro API - Postpartum Depression Companion
 * Vercel deploy entry handler
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import tipsRoutes from './routes/tips.js';
import categoriesRoutes from './routes/categories.js';
import moodRoutes from './routes/mood.js';
import journalRoutes from './routes/journal.js';
import screeningRoutes from './routes/screening.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/screening', screeningRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MamaKokoro API is running',
  });
});

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
