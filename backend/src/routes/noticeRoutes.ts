import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getNotices, getNotifications } from '../controllers/noticeController.js';

const router = Router();

// Public notices
router.get('/notices', getNotices);

// User-specific notifications
router.get('/notifications', authenticate, getNotifications);

export default router;
