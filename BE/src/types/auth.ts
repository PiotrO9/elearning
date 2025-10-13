export interface RegisterUserData {
	email: string;
	username: string;
	password: string;
}

export interface LoginResult {
	user: {
		id: string;
		username: string;
		email: string;
	};
	accessToken: string;
	refreshToken: string;
}

export interface UserData {
	email: string;
	username: string;
	createdAt: Date;
	lastSeen: Date | null;
}

export class AuthServiceError extends Error {
	constructor(message: string, public statusCode: number, public code?: string) {
		super(message);
		this.name = 'AuthServiceError';
	}
}
