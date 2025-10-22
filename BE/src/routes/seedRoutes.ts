import { Router } from 'express';
import { seedDatabase, clearDatabaseController } from '../controllers/seedController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/seed:
 *   post:
 *     summary: Seed database with initial data
 *     description: Clears database and creates admin user. Only accessible by admins.
 *     tags: [Seed]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Database seeded successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to seed database
 */
router.post('/', authenticateToken, requireAdmin, seedDatabase);

/**
 * @swagger
 * /api/seed:
 *   delete:
 *     summary: Clear all database data
 *     description: Deletes all data from database. Only accessible by admins.
 *     tags: [Seed]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Database cleared successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to clear database
 */
router.delete('/', authenticateToken, requireAdmin, clearDatabaseController);

export default router;
