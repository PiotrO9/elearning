import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function clearDatabase() {
	console.log('🗑️  Czyszczenie bazy danych...');

	// Usuwamy w odpowiedniej kolejności ze względu na foreign keys
	await prisma.courseEnrollment.deleteMany();
	await prisma.refreshToken.deleteMany();
	await prisma.video.deleteMany();
	await prisma.course.deleteMany();
	await prisma.user.deleteMany();

	console.log('✅ Baza danych wyczyszczona');
}

export async function seedUsers() {
	console.log('👤 Tworzenie użytkowników...');

	const users = [
		{
			email: 'admin@elearning.pl',
			username: 'admin',
			password: 'Admin123!',
			role: UserRole.ADMIN,
		},
		{
			email: 'jan.kowalski@example.com',
			username: 'jankowalski',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'anna.nowak@example.com',
			username: 'annanowak',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'piotr.wisniewski@example.com',
			username: 'piotrwisniewski',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'maria.dabrowska@example.com',
			username: 'mariadabrowska',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'tomasz.lewandowski@example.com',
			username: 'tomaszlewandowski',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'karolina.wojcik@example.com',
			username: 'karolinawojcik',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'marcin.kaminski@example.com',
			username: 'marcinkaminski',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'agnieszka.zielinska@example.com',
			username: 'agnieszkazielinska',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'krzysztof.szymanski@example.com',
			username: 'krzysztofszymanski',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'magdalena.wozniak@example.com',
			username: 'magdalenawozniak',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'adam.kowalczyk@example.com',
			username: 'adamkowalczyk',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'ewa.krawczyk@example.com',
			username: 'ewakrawczyk',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'pawel.piotrowski@example.com',
			username: 'pawelpiotrowski',
			password: 'User123!',
			role: UserRole.USER,
		},
		{
			email: 'natalia.grabowska@example.com',
			username: 'nataliagrabowska',
			password: 'User123!',
			role: UserRole.USER,
		},
	];

	const createdUsers = [];

	for (const userData of users) {
		const hashedPassword = await bcrypt.hash(userData.password, 10);

		const user = await prisma.user.create({
			data: {
				email: userData.email,
				username: userData.username,
				password: hashedPassword,
				role: userData.role,
			},
		});

		createdUsers.push(user);

		console.log(`   ✓ ${userData.username} (${userData.role})`);
	}

	console.log('✅ Utworzono użytkowników');
	return createdUsers;
}

export async function seedCourses() {
	console.log('📚 Tworzenie kursów...');

	const courses = [
		{
			title: 'Wprowadzenie do TypeScript',
			summary: 'Poznaj podstawy TypeScript i zacznij pisać lepszy kod JavaScript',
			descriptionMarkdown: `# Wprowadzenie do TypeScript

## Czego się nauczysz?

W tym kursie poznasz:
- Podstawy TypeScript
- Typy i interfejsy
- Klasy i dziedziczenie
- Generics
- Dekoratory

Kurs jest przeznaczony dla osób znających JavaScript, które chcą poznać TypeScript.`,
			imagePath: 'https://picsum.photos/seed/typescript/800/600',
			isPublished: true,
			isPublic: true,
		},
		{
			title: 'Vue 3 - Kompletny przewodnik',
			summary: 'Od podstaw do zaawansowanych technik w Vue 3 z Composition API',
			descriptionMarkdown: `# Vue 3 - Kompletny przewodnik

## Dla kogo jest ten kurs?

Kurs jest przeznaczony dla:
- Początkujących z podstawową znajomością JavaScript
- Programistów React/Angular chcących poznać Vue
- Programistów Vue 2 migrujących do Vue 3

## Co obejmuje kurs?

- Reactivity system
- Composition API
- Vue Router
- Pinia (state management)
- TypeScript w Vue`,
			imagePath: 'https://picsum.photos/seed/vue3/800/600',
			isPublished: true,
			isPublic: false,
		},
		{
			title: 'Node.js i Express - Backend Development',
			summary: 'Buduj profesjonalne API z Node.js i Express',
			descriptionMarkdown: `# Node.js i Express - Backend Development

## Program kursu

1. Wprowadzenie do Node.js
2. Express.js basics
3. REST API design
4. Bazy danych (MongoDB, PostgreSQL)
5. Autentykacja i autoryzacja
6. Testing
7. Deployment

Kurs kończy się projektem - własne API dla aplikacji e-learning.`,
			imagePath: 'https://picsum.photos/seed/nodejs/800/600',
			isPublished: true,
			isPublic: false,
		},
		{
			title: 'React 18 - Nowoczesne aplikacje webowe',
			summary: 'Naucz się budować interaktywne aplikacje z React 18',
			descriptionMarkdown: `# React 18 - Nowoczesne aplikacje webowe

## Co zawiera kurs?

- Komponenty i JSX
- Hooks (useState, useEffect, useContext)
- React Router
- State management (Redux Toolkit)
- Server Components
- Suspense i Concurrent Mode
- Testing z Jest i React Testing Library

Idealne dla początkujących i średniozaawansowanych.`,
			imagePath: 'https://picsum.photos/seed/react18/800/600',
			isPublished: true,
			isPublic: true,
		},
		{
			title: 'Python dla Data Science',
			summary: 'Analiza danych i Machine Learning z Pythonem',
			descriptionMarkdown: `# Python dla Data Science

## Nauczysz się:

- NumPy i Pandas
- Matplotlib i Seaborn
- Jupyter Notebooks
- Podstawy Machine Learning (scikit-learn)
- Deep Learning (TensorFlow, Keras)
- Projekty praktyczne

Kurs wymaga podstawowej znajomości Pythona.`,
			imagePath: 'https://picsum.photos/seed/python-ds/800/600',
			isPublished: true,
			isPublic: false,
		},
		{
			title: 'Docker i Kubernetes w praktyce',
			summary: 'Konteneryzacja i orkiestracja aplikacji',
			descriptionMarkdown: `# Docker i Kubernetes w praktyce

## Tematy kursu:

- Podstawy Docker
- Docker Compose
- Kubernetes architecture
- Deployments i Services
- ConfigMaps i Secrets
- Helm charts
- CI/CD z Dockerem i K8s

Kurs dla DevOps i Backend Developers.`,
			imagePath: 'https://picsum.photos/seed/docker-k8s/800/600',
			isPublished: true,
			isPublic: false,
		},
		{
			title: 'PostgreSQL - Zaawansowane bazy danych',
			summary: 'Od podstaw do optymalizacji zapytań',
			descriptionMarkdown: `# PostgreSQL - Zaawansowane bazy danych

## Program:

- SQL podstawy i zaawansowane
- Indeksy i optymalizacja
- Transactions i ACID
- Views i Materialized Views
- Triggers i Stored Procedures
- JSON i JSONB
- Performance tuning

Praktyczny kurs dla programistów.`,
			imagePath: 'https://picsum.photos/seed/postgresql/800/600',
			isPublished: true,
			isPublic: true,
		},
		{
			title: 'GraphQL API - Nowoczesne podejście',
			summary: 'Twórz wydajne API z GraphQL',
			descriptionMarkdown: `# GraphQL API - Nowoczesne podejście

## Czego się nauczysz:

- Podstawy GraphQL
- Apollo Server
- Schema design
- Resolvers
- DataLoader
- Authentication
- Subscriptions
- Apollo Client

Kurs dla Backend i Full-stack Developers.`,
			imagePath: 'https://picsum.photos/seed/graphql/800/600',
			isPublished: true,
			isPublic: false,
		},
		{
			title: 'MongoDB i NoSQL',
			summary: 'Dokumentowe bazy danych w praktyce',
			descriptionMarkdown: `# MongoDB i NoSQL

## Zawartość kursu:

- Podstawy MongoDB
- CRUD operations
- Aggregation Pipeline
- Indexing strategies
- Mongoose ODM
- Sharding i Replication
- Performance optimization
- Security best practices

Dla programistów zaczynających z NoSQL.`,
			imagePath: 'https://picsum.photos/seed/mongodb/800/600',
			isPublished: true,
			isPublic: false,
		},
		{
			title: 'Next.js 14 - Full-stack framework',
			summary: 'Server-side rendering i static generation',
			descriptionMarkdown: `# Next.js 14 - Full-stack framework

## W kursie:

- App Router
- Server Components
- API Routes
- Static Site Generation
- Incremental Static Regeneration
- Authentication
- Database integration
- Deployment (Vercel)

Framework do produkcyjnych aplikacji.`,
			imagePath: 'https://picsum.photos/seed/nextjs14/800/600',
			isPublished: true,
			isPublic: true,
		},
		{
			title: 'Tailwind CSS - Utility-first CSS',
			summary: 'Nowoczesne stylowanie aplikacji webowych',
			descriptionMarkdown: `# Tailwind CSS - Utility-first CSS

## Nauczysz się:

- Podstawy Tailwind
- Responsive design
- Dark mode
- Custom themes
- Plugins
- Optimization
- Best practices
- Real-world projects

Dla Frontend Developers.`,
			imagePath: 'https://picsum.photos/seed/tailwind/800/600',
			isPublished: true,
			isPublic: true,
		},
		{
			title: 'AWS dla programistów',
			summary: 'Cloud computing z Amazon Web Services',
			descriptionMarkdown: `# AWS dla programistów

## Tematy:

- EC2 i Auto Scaling
- S3 i CloudFront
- RDS i DynamoDB
- Lambda Functions
- API Gateway
- IAM i Security
- CloudWatch
- Serverless Framework

Kompletny kurs AWS.`,
			imagePath: 'https://picsum.photos/seed/aws-dev/800/600',
			isPublished: true,
			isPublic: false,
		},
	];

	const createdCourses = [];

	for (const courseData of courses) {
		const course = await prisma.course.create({
			data: courseData,
		});

		createdCourses.push(course);
		console.log(`   ✓ ${courseData.title}`);
	}

	console.log('✅ Utworzono kursy');
	return createdCourses;
}

interface Course {
	id: string;
	[key: string]: any;
}

export async function seedVideos(courses: Course[]) {
	console.log('🎥 Tworzenie video...');

	const videosData = [
		// TypeScript course
		{
			courseId: courses[0].id,
			videos: [
				{ title: 'Wprowadzenie do kursu', order: 1, isTrailer: true, durationSeconds: 180 },
				{ title: 'Instalacja TypeScript', order: 2, isTrailer: false, durationSeconds: 420 },
				{ title: 'Podstawowe typy', order: 3, isTrailer: false, durationSeconds: 900 },
				{ title: 'Interfejsy i Type Aliases', order: 4, isTrailer: false, durationSeconds: 1200 },
				{ title: 'Klasy w TypeScript', order: 5, isTrailer: false, durationSeconds: 1350 },
				{ title: 'Generics', order: 6, isTrailer: false, durationSeconds: 1500 },
			],
		},
		// Vue 3 course
		{
			courseId: courses[1].id,
			videos: [
				{ title: 'Witaj w Vue 3', order: 1, isTrailer: true, durationSeconds: 240 },
				{ title: 'Setup projektu z Vite', order: 2, isTrailer: false, durationSeconds: 600 },
				{ title: 'Composition API - podstawy', order: 3, isTrailer: false, durationSeconds: 1500 },
				{ title: 'Reactivity w Vue 3', order: 4, isTrailer: false, durationSeconds: 1800 },
				{ title: 'Komponenty i Props', order: 5, isTrailer: false, durationSeconds: 2100 },
				{ title: 'Vue Router', order: 6, isTrailer: false, durationSeconds: 1650 },
				{ title: 'Pinia - State Management', order: 7, isTrailer: false, durationSeconds: 1900 },
			],
		},
		// Node.js course
		{
			courseId: courses[2].id,
			videos: [
				{ title: 'Czym jest Node.js?', order: 1, isTrailer: true, durationSeconds: 300 },
				{ title: 'Pierwszy serwer Express', order: 2, isTrailer: false, durationSeconds: 900 },
				{ title: 'Routing w Express', order: 3, isTrailer: false, durationSeconds: 1200 },
				{ title: 'Middleware', order: 4, isTrailer: false, durationSeconds: 1350 },
				{ title: 'REST API design', order: 5, isTrailer: false, durationSeconds: 1600 },
				{ title: 'Połączenie z bazą danych', order: 6, isTrailer: false, durationSeconds: 1800 },
			],
		},
		// React 18 course
		{
			courseId: courses[3].id,
			videos: [
				{ title: 'Wprowadzenie do React', order: 1, isTrailer: true, durationSeconds: 270 },
				{ title: 'JSX i komponenty', order: 2, isTrailer: false, durationSeconds: 850 },
				{ title: 'useState Hook', order: 3, isTrailer: false, durationSeconds: 1100 },
				{ title: 'useEffect Hook', order: 4, isTrailer: false, durationSeconds: 1400 },
				{ title: 'React Router', order: 5, isTrailer: false, durationSeconds: 1500 },
				{ title: 'Context API', order: 6, isTrailer: false, durationSeconds: 1300 },
				{ title: 'Redux Toolkit', order: 7, isTrailer: false, durationSeconds: 1800 },
				{ title: 'Server Components', order: 8, isTrailer: false, durationSeconds: 1600 },
			],
		},
		// Python Data Science course
		{
			courseId: courses[4].id,
			videos: [
				{ title: 'Wprowadzenie do Data Science', order: 1, isTrailer: true, durationSeconds: 320 },
				{ title: 'NumPy - podstawy', order: 2, isTrailer: false, durationSeconds: 1200 },
				{ title: 'Pandas - DataFrame', order: 3, isTrailer: false, durationSeconds: 1500 },
				{ title: 'Wizualizacja z Matplotlib', order: 4, isTrailer: false, durationSeconds: 1350 },
				{ title: 'Seaborn - zaawansowane wykresy', order: 5, isTrailer: false, durationSeconds: 1100 },
				{ title: 'Machine Learning - wprowadzenie', order: 6, isTrailer: false, durationSeconds: 1700 },
				{ title: 'Scikit-learn w praktyce', order: 7, isTrailer: false, durationSeconds: 1900 },
			],
		},
		// Docker & Kubernetes course
		{
			courseId: courses[5].id,
			videos: [
				{ title: 'Wprowadzenie do konteneryzacji', order: 1, isTrailer: true, durationSeconds: 280 },
				{ title: 'Dockerfile i obrazy', order: 2, isTrailer: false, durationSeconds: 1100 },
				{ title: 'Docker Compose', order: 3, isTrailer: false, durationSeconds: 1300 },
				{ title: 'Kubernetes basics', order: 4, isTrailer: false, durationSeconds: 1550 },
				{ title: 'Pods i Deployments', order: 5, isTrailer: false, durationSeconds: 1450 },
				{ title: 'Services i Ingress', order: 6, isTrailer: false, durationSeconds: 1600 },
				{ title: 'ConfigMaps i Secrets', order: 7, isTrailer: false, durationSeconds: 1200 },
				{ title: 'Helm charts', order: 8, isTrailer: false, durationSeconds: 1700 },
			],
		},
		// PostgreSQL course
		{
			courseId: courses[6].id,
			videos: [
				{ title: 'Wprowadzenie do PostgreSQL', order: 1, isTrailer: true, durationSeconds: 250 },
				{ title: 'SQL podstawy - SELECT', order: 2, isTrailer: false, durationSeconds: 900 },
				{ title: 'JOIN i relacje', order: 3, isTrailer: false, durationSeconds: 1400 },
				{ title: 'Indeksy i wydajność', order: 4, isTrailer: false, durationSeconds: 1600 },
				{ title: 'Transactions', order: 5, isTrailer: false, durationSeconds: 1250 },
				{ title: 'Views i Materialized Views', order: 6, isTrailer: false, durationSeconds: 1350 },
				{ title: 'JSON w PostgreSQL', order: 7, isTrailer: false, durationSeconds: 1500 },
			],
		},
		// GraphQL course
		{
			courseId: courses[7].id,
			videos: [
				{ title: 'Czym jest GraphQL?', order: 1, isTrailer: true, durationSeconds: 290 },
				{ title: 'Schema i typy', order: 2, isTrailer: false, durationSeconds: 1000 },
				{ title: 'Queries i Mutations', order: 3, isTrailer: false, durationSeconds: 1300 },
				{ title: 'Resolvers', order: 4, isTrailer: false, durationSeconds: 1450 },
				{ title: 'Apollo Server setup', order: 5, isTrailer: false, durationSeconds: 1200 },
				{ title: 'DataLoader', order: 6, isTrailer: false, durationSeconds: 1550 },
				{ title: 'Authentication w GraphQL', order: 7, isTrailer: false, durationSeconds: 1650 },
				{ title: 'Subscriptions', order: 8, isTrailer: false, durationSeconds: 1400 },
			],
		},
		// MongoDB course
		{
			courseId: courses[8].id,
			videos: [
				{ title: 'Wprowadzenie do MongoDB', order: 1, isTrailer: true, durationSeconds: 260 },
				{ title: 'CRUD operations', order: 2, isTrailer: false, durationSeconds: 950 },
				{ title: 'Aggregation Pipeline', order: 3, isTrailer: false, durationSeconds: 1500 },
				{ title: 'Indeksy w MongoDB', order: 4, isTrailer: false, durationSeconds: 1350 },
				{ title: 'Mongoose ODM', order: 5, isTrailer: false, durationSeconds: 1450 },
				{ title: 'Schema validation', order: 6, isTrailer: false, durationSeconds: 1100 },
				{ title: 'Replication', order: 7, isTrailer: false, durationSeconds: 1600 },
			],
		},
		// Next.js 14 course
		{
			courseId: courses[9].id,
			videos: [
				{ title: 'Wprowadzenie do Next.js', order: 1, isTrailer: true, durationSeconds: 300 },
				{ title: 'App Router', order: 2, isTrailer: false, durationSeconds: 1200 },
				{ title: 'Server Components', order: 3, isTrailer: false, durationSeconds: 1500 },
				{ title: 'Client Components', order: 4, isTrailer: false, durationSeconds: 1100 },
				{ title: 'API Routes', order: 5, isTrailer: false, durationSeconds: 1300 },
				{ title: 'Static Site Generation', order: 6, isTrailer: false, durationSeconds: 1450 },
				{ title: 'ISR', order: 7, isTrailer: false, durationSeconds: 1250 },
				{ title: 'Authentication', order: 8, isTrailer: false, durationSeconds: 1700 },
				{ title: 'Deployment na Vercel', order: 9, isTrailer: false, durationSeconds: 900 },
			],
		},
		// Tailwind CSS course
		{
			courseId: courses[10].id,
			videos: [
				{ title: 'Wprowadzenie do Tailwind', order: 1, isTrailer: true, durationSeconds: 220 },
				{ title: 'Utility classes', order: 2, isTrailer: false, durationSeconds: 800 },
				{ title: 'Responsive design', order: 3, isTrailer: false, durationSeconds: 1100 },
				{ title: 'Dark mode', order: 4, isTrailer: false, durationSeconds: 950 },
				{ title: 'Custom configuration', order: 5, isTrailer: false, durationSeconds: 1200 },
				{ title: 'Komponenty wielokrotnego użytku', order: 6, isTrailer: false, durationSeconds: 1350 },
			],
		},
		// AWS course
		{
			courseId: courses[11].id,
			videos: [
				{ title: 'Wprowadzenie do AWS', order: 1, isTrailer: true, durationSeconds: 310 },
				{ title: 'EC2 - podstawy', order: 2, isTrailer: false, durationSeconds: 1300 },
				{ title: 'S3 Storage', order: 3, isTrailer: false, durationSeconds: 1100 },
				{ title: 'RDS i DynamoDB', order: 4, isTrailer: false, durationSeconds: 1500 },
				{ title: 'Lambda Functions', order: 5, isTrailer: false, durationSeconds: 1400 },
				{ title: 'API Gateway', order: 6, isTrailer: false, durationSeconds: 1250 },
				{ title: 'IAM i Security', order: 7, isTrailer: false, durationSeconds: 1600 },
				{ title: 'CloudWatch Monitoring', order: 8, isTrailer: false, durationSeconds: 1150 },
			],
		},
	];

	let totalVideos = 0;

	for (const courseVideos of videosData) {
		for (const videoData of courseVideos.videos) {
			await prisma.video.create({
				data: {
					courseId: courseVideos.courseId,
					title: videoData.title,
					order: videoData.order,
					isTrailer: videoData.isTrailer,
					sourceUrl: `https://example.com/videos/${courseVideos.courseId}/${videoData.order}.mp4`,
					durationSeconds: videoData.durationSeconds,
				},
			});
			totalVideos++;
		}
	}

	console.log(`✅ Utworzono ${totalVideos} video`);
}

interface User {
	id: string;
	[key: string]: any;
}

export async function seedEnrollments(users: User[], courses: Course[]) {
	console.log('📝 Przypisywanie użytkowników do kursów...');

	const enrollmentsData = [
		// Jan Kowalski - frontend enthusiast (TypeScript, React, Vue, Next.js, Tailwind)
		{ userId: users[1].id, courseId: courses[0].id },
		{ userId: users[1].id, courseId: courses[1].id },
		{ userId: users[1].id, courseId: courses[3].id },
		{ userId: users[1].id, courseId: courses[9].id },
		{ userId: users[1].id, courseId: courses[10].id },

		// Anna Nowak - full-stack (TypeScript, Vue, Node.js, PostgreSQL)
		{ userId: users[2].id, courseId: courses[0].id },
		{ userId: users[2].id, courseId: courses[1].id },
		{ userId: users[2].id, courseId: courses[2].id },
		{ userId: users[2].id, courseId: courses[6].id },

		// Piotr Wiśniewski - backend (Node.js, PostgreSQL, GraphQL, MongoDB)
		{ userId: users[3].id, courseId: courses[2].id },
		{ userId: users[3].id, courseId: courses[6].id },
		{ userId: users[3].id, courseId: courses[7].id },
		{ userId: users[3].id, courseId: courses[8].id },

		// Maria Dąbrowska - data science (Python, MongoDB)
		{ userId: users[4].id, courseId: courses[4].id },
		{ userId: users[4].id, courseId: courses[8].id },

		// Tomasz Lewandowski - devops (Docker/K8s, AWS, Node.js, PostgreSQL)
		{ userId: users[5].id, courseId: courses[2].id },
		{ userId: users[5].id, courseId: courses[5].id },
		{ userId: users[5].id, courseId: courses[6].id },
		{ userId: users[5].id, courseId: courses[11].id },

		// Karolina Wójcik - React specialist (TypeScript, React, Next.js, Tailwind)
		{ userId: users[6].id, courseId: courses[0].id },
		{ userId: users[6].id, courseId: courses[3].id },
		{ userId: users[6].id, courseId: courses[9].id },
		{ userId: users[6].id, courseId: courses[10].id },

		// Marcin Kamiński - backend + devops (Node.js, Docker, GraphQL, AWS)
		{ userId: users[7].id, courseId: courses[2].id },
		{ userId: users[7].id, courseId: courses[5].id },
		{ userId: users[7].id, courseId: courses[7].id },
		{ userId: users[7].id, courseId: courses[11].id },

		// Agnieszka Zielińska - fullstack (TypeScript, React, Node.js, Next.js)
		{ userId: users[8].id, courseId: courses[0].id },
		{ userId: users[8].id, courseId: courses[2].id },
		{ userId: users[8].id, courseId: courses[3].id },
		{ userId: users[8].id, courseId: courses[9].id },

		// Krzysztof Szymański - database specialist (PostgreSQL, MongoDB, GraphQL)
		{ userId: users[9].id, courseId: courses[6].id },
		{ userId: users[9].id, courseId: courses[7].id },
		{ userId: users[9].id, courseId: courses[8].id },

		// Magdalena Woźniak - frontend (Vue, React, Tailwind, Next.js)
		{ userId: users[10].id, courseId: courses[1].id },
		{ userId: users[10].id, courseId: courses[3].id },
		{ userId: users[10].id, courseId: courses[9].id },
		{ userId: users[10].id, courseId: courses[10].id },

		// Adam Kowalczyk - versatile learner (wszystkie publiczne)
		{ userId: users[11].id, courseId: courses[0].id },
		{ userId: users[11].id, courseId: courses[3].id },
		{ userId: users[11].id, courseId: courses[6].id },
		{ userId: users[11].id, courseId: courses[9].id },
		{ userId: users[11].id, courseId: courses[10].id },

		// Ewa Krawczyk - data & cloud (Python, MongoDB, AWS)
		{ userId: users[12].id, courseId: courses[4].id },
		{ userId: users[12].id, courseId: courses[8].id },
		{ userId: users[12].id, courseId: courses[11].id },

		// Paweł Piotrowski - modern stack (TypeScript, Next.js, Tailwind, GraphQL)
		{ userId: users[13].id, courseId: courses[0].id },
		{ userId: users[13].id, courseId: courses[7].id },
		{ userId: users[13].id, courseId: courses[9].id },
		{ userId: users[13].id, courseId: courses[10].id },

		// Natalia Grabowska - beginner explorer (tylko publiczne kursy)
		{ userId: users[14].id, courseId: courses[0].id },
		{ userId: users[14].id, courseId: courses[3].id },
		{ userId: users[14].id, courseId: courses[6].id },
		{ userId: users[14].id, courseId: courses[9].id },
		{ userId: users[14].id, courseId: courses[10].id },
	];

	for (const enrollmentData of enrollmentsData) {
		await prisma.courseEnrollment.create({
			data: {
				userId: enrollmentData.userId,
				courseId: enrollmentData.courseId,
			},
		});
	}

	console.log(`✅ Utworzono ${enrollmentsData.length} zapisów na kursy`);
}

export async function runSeed() {
	console.log('🌱 Rozpoczynam seedowanie bazy danych...\n');

	await clearDatabase();
	console.log('');

	const users = await seedUsers();
	console.log('');

	const courses = await seedCourses();
	console.log('');

	await seedVideos(courses);
	console.log('');

	await seedEnrollments(users, courses);

	console.log('\n✨ Seedowanie zakończone pomyślnie!');
	console.log('\n📊 Podsumowanie:');
	console.log(`   Użytkownicy: ${users.length}`);
	console.log(`   Kursy: ${courses.length}`);
	console.log(`   Admin: admin@elearning.pl / Admin123!`);
	console.log(`   Użytkownicy testowi: *@example.com / User123!`);
}
