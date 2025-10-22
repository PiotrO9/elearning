import type { Router } from 'express';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

type RouteMeta = {
	method: HttpMethod;
	fullPath: string;
	tag: string;
	protected: boolean;
};

function toOpenApiPath(expressPath: string): string {
	if (!expressPath) return '/';
	return expressPath.replace(/:([^/]+)/g, '{$1}');
}

function normalizeBase(base: string): string {
	if (!base.startsWith('/')) return `/${base}`;
	return base;
}

function detectIsProtected(layerHandlers: unknown[]): boolean {
	return layerHandlers.some((h: unknown) => {
		const fn = h as { name?: string };
		return typeof fn === 'function' && !!fn.name && fn.name === 'authenticateToken';
	});
}

export function extractRoutes(base: string, router: Router): RouteMeta[] {
	const routes: RouteMeta[] = [];
	const normalizedBase = normalizeBase(base);

	const stack: any[] = (router as unknown as { stack?: any[] })?.stack || [];
	for (const layer of stack) {
		if (layer?.route) {
			const route = layer.route;
			const routePath: string = `${normalizedBase}${route.path === '/' ? '' : route.path}`;
			const methods: Record<string, boolean> = route.methods || {};
			const handlers: unknown[] = (route.stack || []).map((s: unknown) => {
				// @ts-expect-error Express internals
				return s?.handle || s;
			});
			const isProtected = detectIsProtected(handlers);
			for (const key of Object.keys(methods)) {
				if (!methods[key]) continue;
				const method = key.toLowerCase() as HttpMethod;
				routes.push({
					method,
					fullPath: routePath,
					tag: normalizedBase.replace(/^\//, ''),
					protected: isProtected,
				});
			}
			continue;
		}

		// Nested router mounted under a path, e.g. router.use('/auth', authRoutes)
		if (layer?.name === 'router' && typeof layer?.handle === 'function') {
			// Express 5 keeps the mount path in layer.regexp and sometimes layer.path
			const mountPath: string =
				typeof layer?.path === 'string' && layer.path
					? layer.path
					: extractPathFromRegex(layer?.regexp) || '';
			const childBase = `${normalizedBase}${mountPath}`;
			const childRouter: Router = layer.handle as unknown as Router;
			routes.push(...extractRoutes(childBase, childRouter));
		}
	}

	return routes;
}

function extractPathFromRegex(regexp: unknown): string {
	if (!regexp) return '';
	try {
		const source: string = (regexp as { source?: string })?.source || '';
		// Match literal path like ^\\/auth(?:\\/(?=$))?$
		const literal = source
			.replace(/^\^/, '')
			.replace(/\$$/, '')
			.replace(/\\\//g, '/')
			.replace(/\(\?:\\\/(?=\$)\)\?\/?/g, '')
			.replace(/\(\?:\)\?/g, '')
			.replace(/\[\^\]\+\*\$\|]/g, '')
			.replace(/\(\?:\^\)\?/g, '')
			.replace(/\(\?=\$\)/g, '')
			.replace(/\(\?:\^\$\)\?/g, '')
			.trim();
		return literal.startsWith('/') ? literal : `/${literal}`;
	} catch {
		return '';
	}
}

export function buildOpenApiSpec(options: {
	apiTitle?: string;
	apiVersion?: string;
	serverUrl?: string;
	children: { base: string; router: Router }[];
}): Record<string, unknown> {
	const title = options.apiTitle || 'Elearning API';
	const version = options.apiVersion || '1.0.0';
	const serverUrl = options.serverUrl || 'http://localhost:3000';

	const allRoutes = options.children.flatMap(child => extractRoutes(child.base, child.router));

	const paths: Record<string, any> = {};
	for (const r of allRoutes) {
		const oasPath = toOpenApiPath(r.fullPath);

		if (!paths[oasPath]) paths[oasPath] = {};

		const pathParameters = extractPathParamNamesFromOpenApiPath(oasPath).map(name => ({
			name,
			in: 'path',
			required: true,
			description: `Path parameter: ${name}`,
			schema: { type: 'string' },
		}));

		paths[oasPath][r.method] = {
			tags: [r.tag],
			summary: `${r.method.toUpperCase()} ${oasPath}`,
			parameters: pathParameters,
			responses: {
				200: { description: 'OK' },
			},
			...(r.protected ? { security: [{ bearerAuth: [] }] } : {}),
		};
	}

	return {
		openapi: '3.0.3',
		info: { title, version },
		servers: [{ url: serverUrl }],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
		paths,
	} as Record<string, unknown>;
}

function extractPathParamNamesFromOpenApiPath(oasPath: string): string[] {
	const names: string[] = [];
	const regex = /\{([^}]+)\}/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(oasPath)) !== null) {
		if (match[1]) names.push(match[1]);
	}

	return names;
}
