import { Router } from 'express';
import {
  getCategories,
  getSubcategories,
  getDepartments,
  getHalls,
  getCourses,
} from '../controllers/catalogController.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/subcategories', getSubcategories);
router.get('/departments', getDepartments);
router.get('/halls', getHalls);
router.get('/courses', getCourses);

export default router;
