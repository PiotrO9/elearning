export type ActivityType =
	| 'course_added'
	| 'course_updated'
	| 'tag_added'
	| 'tag_updated'
	| 'user_registered';

export interface DashboardMetrics {
	totalCourses: number;
	activeCourses: number;
	totalUsers: number;
	totalTags: number;
}

export interface RecentActivity {
	description: string;
	timeAgo: string;
	type: ActivityType;
	timestamp: Date;
}

export interface DashboardData {
	metrics: DashboardMetrics;
	recentActivities: RecentActivity[];
}
