import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { courseRoutes } from './courseRoutes';
import { videoRoutes } from './videoRoutes';
import enrollmentRoutes from './enrollmentRoutes';
import seedRoutes from './seedRoutes';
import tagRoutes from './tagRoutes';
import { userRoutes } from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/course', courseRoutes);
router.use('/video', videoRoutes);
router.use('/courses', enrollmentRoutes);
router.use('/seed', seedRoutes);
router.use('/tags', tagRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };

export const apiChildrenRouters = [
	{ base: '/auth', router: authRoutes },
	{ base: '/course', router: courseRoutes },
	{ base: '/video', router: videoRoutes },
	{ base: '/courses', router: enrollmentRoutes },
	{ base: '/seed', router: seedRoutes },
	{ base: '/tags', router: tagRoutes },
	{ base: '/users', router: userRoutes },
];
