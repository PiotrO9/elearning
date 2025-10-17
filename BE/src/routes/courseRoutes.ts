import { Router } from 'express';
import { handleGetCourses, handleGetCourseById } from '../controllers/courseController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', handleGetCourses);
router.get('/:id', optionalAuth, handleGetCourseById);

export { router as courseRoutes };
