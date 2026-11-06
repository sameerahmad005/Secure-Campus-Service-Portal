import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getFacultyProfile, updateFacultyProfile } from '../controllers/facultyController.js';

const router = Router();

router.use(authenticate);

// Faculty profile management
router.get('/profile', requireRole('FACULTY', 'CHAIRMAN'), getFacultyProfile);
router.patch('/profile', requireRole('FACULTY', 'CHAIRMAN'), updateFacultyProfile);

export default router;
