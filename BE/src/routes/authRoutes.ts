import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @desc Login user and get tokens
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', refresh);

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate tokens
 * @access Public
 */
router.post('/logout', logout);

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user's information
 * @access Private
 */
router.get('/me', authenticateToken, me);

export { router as authRoutes };
