import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../utils/prisma';
import { runSeed } from '../utils/seedData';

/**
 * Seed database with initial data
 * POST /api/seed
 * @access Admin only
 */
export async function seedDatabase(_req: Request, res: Response): Promise<void> {
	try {
		console.log('🌱 Rozpoczynam seedowanie bazy danych przez API...');

		// Wywołaj główną funkcję seedowania
		await runSeed();

		// Pobierz statystyki
		const [usersCount, coursesCount, videosCount, enrollmentsCount] = await Promise.all([
			prisma.user.count(),
			prisma.course.count(),
			prisma.video.count(),
			prisma.courseEnrollment.count(),
		]);

		sendSuccess(
			res,
			{
				message: 'Database seeded successfully',
				stats: {
					users: usersCount,
					courses: coursesCount,
					videos: videosCount,
					enrollments: enrollmentsCount,
				},
				credentials: {
					admin: {
						email: 'admin@elearning.pl',
						username: 'admin',
						password: 'Admin123!',
					},
					testUsers: {
						email: '*@example.com',
						password: 'User123!',
					},
				},
			},
			'Database seeded successfully',
			200,
		);
	} catch (error) {
		console.error('❌ Błąd podczas seedowania:', error);
		sendError(res, 'Failed to seed database', 500, 'SEED_ERROR');
	}
}

/**
 * Clear database (delete all data)
 * DELETE /api/seed
 * @access Admin only
 */
export async function clearDatabaseController(_req: Request, res: Response): Promise<void> {
	try {
		console.log('🗑️  Czyszczenie bazy danych przez API...');

		// Import clearDatabase function
		const { clearDatabase } = await import('../utils/seedData');
		await clearDatabase();

		sendSuccess(res, undefined, 'Database cleared successfully', 200);
	} catch (error) {
		console.error('❌ Błąd podczas czyszczenia bazy:', error);
		sendError(res, 'Failed to clear database', 500, 'CLEAR_ERROR');
	}
}
