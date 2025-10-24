import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UserRole } from '../types/user';

export interface TokenPayload {
	userId: string;
	email: string;
	role: UserRole;
}

// JWT secret keys from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

// Token expiration times
const ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days

// Sliding session configuration
export const SLIDING_SESSION_ENABLED = process.env.SLIDING_SESSION_ENABLED !== 'false'; // Default: true

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
	return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
		expiresIn: ACCESS_TOKEN_EXPIRES_IN,
	});
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
	return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
		expiresIn: REFRESH_TOKEN_EXPIRES_IN,
	});
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
	try {
		return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
	} catch (error) {
		throw new Error('Invalid access token');
	}
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
	try {
		return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
	} catch (error) {
		throw new Error('Invalid refresh token');
	}
};

/**
 * Set authentication cookies in response
 */
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
	// Set access token cookie (15 minutes)
	res.cookie('accessToken', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production', // HTTPS only in production
		sameSite: 'strict',
		maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
	});

	// Set refresh token cookie (7 days)
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production', // HTTPS only in production
		sameSite: 'strict',
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
	});
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res: Response): void => {
	res.clearCookie('accessToken');
	res.clearCookie('refreshToken');
};
