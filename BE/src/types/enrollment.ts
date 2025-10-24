export interface CourseEnrollment {
	id: string;
	userId: string;
	courseId: string;
	enrolledBy: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface EnrollmentWithUser {
	id: string;
	userId: string;
	courseId: string;
	enrolledBy: string | null;
	createdAt: Date;
	user: {
		id: string;
		username: string;
		email: string;
	};
}

export interface EnrollmentWithCourse {
	id: string;
	userId: string;
	courseId: string;
	enrolledBy: string | null;
	createdAt: Date;
	course: {
		id: string;
		title: string;
		summary: string;
		imagePath: string;
		isPublic: boolean;
	};
}

export interface EnrollUserInput {
	userId: string;
	courseId: string;
}

export interface EnrollmentDto {
	id: string;
	userId: string;
	username: string;
	email: string;
	enrolledAt: Date;
	enrolledBy: string | null;
}

export interface UserCourseDto {
	id: string;
	title: string;
	summary: string;
	imagePath: string;
	isPublic: boolean;
	enrolledAt: Date;
}
