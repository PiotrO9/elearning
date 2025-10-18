import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRoutes } from './routes/api';
import { prisma } from './utils/prisma';

const app: Express = express();

app.use(
	cors({
		origin: process.env.CLIENT_URL || 'http://localhost:3000',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'X-Requested-With',
			'Accept',
			'Origin',
			'Access-Control-Request-Method',
			'Access-Control-Request-Headers',
		],
		exposedHeaders: ['Set-Cookie'],
		preflightContinue: false,
		optionsSuccessStatus: 204,
	}),
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 3000;

async function handleHealth(req: Request, res: Response): Promise<void> {
	req;
	try {
		await prisma.$queryRaw`SELECT 1`;
		res.json({ status: 'ok', db: 'up', timestamp: new Date().toISOString() });
	} catch (error) {
		res.status(500).json({ status: 'error', db: 'down' });
	}
}

app.get('/', (req: Request, res: Response) => {
	res.json({
		message: 'Elearning Backend',
		timestamp: new Date().toISOString(),
		status: 'Running 🚀',
		accepted: req.accepted,
	});
});

app.get('/health', handleHealth);

app.use('/api', apiRoutes);

app.listen(PORT, () => {
	console.log(`🚀 Server is running on http://localhost:${PORT}`);
	console.log(`📚 API available at http://localhost:${PORT}/api`);
	console.log(`💾 Environment: ${process.env.NODE_ENV || 'development'}`);
});
