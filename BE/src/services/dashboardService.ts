import { prisma } from '../utils/prisma';
import { DashboardData, DashboardMetrics, RecentActivity } from '../types/dashboard';

/**
 * Format time ago in Polish
 */
function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return 'przed chwilą';
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} ${
			diffInMinutes === 1 ? 'minutę' : diffInMinutes < 5 ? 'minuty' : 'minut'
		} temu`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} ${
			diffInHours === 1 ? 'godzinę' : diffInHours < 5 ? 'godziny' : 'godzin'
		} temu`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} ${diffInDays === 1 ? 'dzień' : 'dni'} temu`;
	}

	const diffInWeeks = Math.floor(diffInDays / 7);
	if (diffInWeeks < 4) {
		return `${diffInWeeks} ${
			diffInWeeks === 1 ? 'tydzień' : diffInWeeks < 5 ? 'tygodnie' : 'tygodni'
		} temu`;
	}

	const diffInMonths = Math.floor(diffInDays / 30);
	return `${diffInMonths} ${
		diffInMonths === 1 ? 'miesiąc' : diffInMonths < 5 ? 'miesiące' : 'miesięcy'
	} temu`;
}

/**
 * Get dashboard metrics
 */
async function getDashboardMetrics(): Promise<DashboardMetrics> {
	const [totalCourses, activeCourses, totalUsers, totalTags] = await Promise.all([
		prisma.course.count(),
		prisma.course.count({ where: { isPublished: true } }),
		prisma.user.count({ where: { deletedAt: null } }),
		prisma.tag.count(),
	]);

	return {
		totalCourses,
		activeCourses,
		totalUsers,
		totalTags,
	};
}

/**
 * Get recent activities from all sources
 */
async function getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
	const activities: RecentActivity[] = [];

	const recentCourses = await prisma.course.findMany({
		select: {
			id: true,
			title: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: { updatedAt: 'desc' },
		take: limit * 3,
	});

	for (const course of recentCourses) {
		activities.push({
			description: `Dodano nowy kurs: ${course.title}`,
			timeAgo: formatTimeAgo(course.createdAt),
			type: 'course_added',
			timestamp: course.createdAt,
		});

		const timeDiff = course.updatedAt.getTime() - course.createdAt.getTime();
		if (timeDiff > 60000) {
			activities.push({
				description: `Zaktualizowano kurs: ${course.title}`,
				timeAgo: formatTimeAgo(course.updatedAt),
				type: 'course_updated',
				timestamp: course.updatedAt,
			});
		}
	}

	const recentTags = await prisma.tag.findMany({
		select: {
			id: true,
			name: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: { updatedAt: 'desc' },
		take: limit * 2,
	});

	for (const tag of recentTags) {
		activities.push({
			description: `Dodano nowy tag: ${tag.name}`,
			timeAgo: formatTimeAgo(tag.createdAt),
			type: 'tag_added',
			timestamp: tag.createdAt,
		});

		const timeDiff = tag.updatedAt.getTime() - tag.createdAt.getTime();
		if (timeDiff > 60000) {
			activities.push({
				description: `Zaktualizowano tag: ${tag.name}`,
				timeAgo: formatTimeAgo(tag.updatedAt),
				type: 'tag_updated',
				timestamp: tag.updatedAt,
			});
		}
	}

	const recentUsers = await prisma.user.findMany({
		select: {
			id: true,
			username: true,
			email: true,
			createdAt: true,
		},
		where: { deletedAt: null },
		orderBy: { createdAt: 'desc' },
		take: limit,
	});

	for (const user of recentUsers) {
		activities.push({
			description: `Nowy użytkownik: ${user.username}`,
			timeAgo: formatTimeAgo(user.createdAt),
			type: 'user_registered',
			timestamp: user.createdAt,
		});
	}

	return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

/**
 * Get dashboard data
 */
export async function getDashboardData(): Promise<DashboardData> {
	const [metrics, recentActivities] = await Promise.all([
		getDashboardMetrics(),
		getRecentActivities(10),
	]);

	return {
		metrics,
		recentActivities,
	};
}
