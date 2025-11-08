import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRoutes } from './routes/api';
import { apiChildrenRouters } from './routes/api';
import { buildOpenApiSpec } from './utils/openapi';
import { prisma } from './utils/prisma';
import { handleExpressError } from './utils/response';
import { NotFoundError } from './types/api';

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

app.use((req: Request, res: Response, next: NextFunction) => {
	const traceId = randomUUID();
	(res as any).locals = { ...(res as any).locals, traceId };
	(req as any).traceId = traceId;
	res.setHeader('X-Trace-Id', traceId);
	next();
});

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

app.get('/api/openapi.json', (req: Request, res: Response) => {
	const serverUrl = `${req.protocol}://${req.get('host')}`;
	const spec = buildOpenApiSpec({
		serverUrl,
		children: apiChildrenRouters,
		apiTitle: 'Elearning API',
		apiVersion: '1.0.0',
	});
	res.json(spec);
});

app.get('/api', (_req: Request, res: Response) => {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.send(`<!doctype html>
	<html lang="en">
	<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Elearning API</title>
	<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
	<style>html,body,#swagger-ui{height:100%;margin:0}</style>
	</head>
	<body>
	<div id="swagger-ui"></div>
	<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
	<script>
	window.onload = function handleLoad() {
		SwaggerUIBundle({
			url: '/api/openapi.json',
			dom_id: '#swagger-ui',
			deepLinking: true,
			presets: [SwaggerUIBundle.presets.apis],
			layout: 'BaseLayout'
		});
	};
	</script>
	</body>
	</html>`);
});

app.use('/api', apiRoutes);

app.use('/api', (_req: Request, _res: Response, next: NextFunction) => {
	next(new NotFoundError('Route not found'));
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
	handleExpressError(err, req, res);
});

app.listen(PORT, () => {
	console.log(`🚀 Server is running on http://localhost:${PORT}`);
	console.log(`📚 API available at http://localhost:${PORT}/api`);
	console.log(`💾 Environment: ${process.env.NODE_ENV || 'development'}`);
});
