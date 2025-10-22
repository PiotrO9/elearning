// Import seed functions from src/utils/seedData.ts
// This file is just a wrapper for Prisma CLI to run the seed
import { runSeed } from '../src/utils/seedData';

async function main() {
	try {
		await runSeed();
	} catch (error) {
		console.error('❌ Błąd podczas seedowania:', error);
		throw error;
	}
}

// Run seed only when executed directly (not imported)
if (require.main === module) {
	main()
		.catch(error => {
			console.error(error);
			process.exit(1);
		})
		.finally(async () => {
			await prisma.$disconnect();
		});
}
