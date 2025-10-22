import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { courseRoutes } from './courseRoutes';
import { videoRoutes } from './videoRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/course', courseRoutes);
router.use('/video', videoRoutes);

export { router as apiRoutes };

export const apiChildrenRouters = [
	{ base: '/auth', router: authRoutes },
	{ base: '/course', router: courseRoutes },
	{ base: '/video', router: videoRoutes },
];
