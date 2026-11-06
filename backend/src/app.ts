import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import { supabase } from './config/supabase.js';

export const createApp = () => {
  const app = express();

  // CORS configuration
  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }));

  app.use(express.json());

  // Health check endpoint
  app.get('/api/v1/health', async (_req, res) => {
    try {
      const { data, error } = await supabase.from('roles').select('count', { count: 'exact', head: true });
      res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: error ? 'DISCONNECTED' : 'CONNECTED',
        service: 'Secure Campus Service Portal Backend API (v1)',
      });
    } catch {
      res.json({
        status: 'DEGRADED',
        timestamp: new Date().toISOString(),
        database: 'ERROR',
      });
    }
  });

  // Mount API v1 Routers
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/faculty', facultyRoutes);
  app.use('/api/v1/complaints', complaintRoutes);
  app.use('/api/v1/requests', requestRoutes);
  app.use('/api/v1/catalog', catalogRoutes);
  app.use('/api/v1', noticeRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'API route not found' },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
