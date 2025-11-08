import { PrismaClient } from '@prisma/client';

declare global {
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
