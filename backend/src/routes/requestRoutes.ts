import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getServiceRequests,
  createServiceRequest,
} from '../controllers/requestController.js';

const router = Router();

router.use(authenticate);

router.get('/', getServiceRequests);
router.post('/', createServiceRequest);

export default router;
