import { PrismaClient } from '@prisma/client';

// Ensure a single PrismaClient instance across hot-reloads in development
declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
	if (process.env.NODE_ENV === 'production') {
		return new PrismaClient();
	}

	if (!global.prisma) {
		global.prisma = new PrismaClient();
	}

	return global.prisma;
}

export const prisma = getPrismaClient();
