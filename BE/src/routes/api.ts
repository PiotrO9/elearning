import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { courseRoutes } from './courseRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/course', courseRoutes);

export { router as apiRoutes };
