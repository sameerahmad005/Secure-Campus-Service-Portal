import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
} from '../controllers/complaintController.js';

const router = Router();

router.use(authenticate);

router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.post('/:id/status', updateComplaintStatus);

export default router;
