/**
 * Konfiguracja sortowania dla Prisma orderBy
 */
export interface SortConfig {
	/**
	 * Lista dozwolonych pól do sortowania
	 */
	validSortFields: string[];
	/**
	 * Domyślne pole sortowania
	 */
	defaultField: string;
	/**
	 * Domyślny kierunek sortowania
	 */
	defaultOrder?: 'asc' | 'desc';
	/**
	 * Mapowanie nazw pól (np. 'enrolledAt' -> 'createdAt')
	 */
	fieldMapping?: Record<string, string>;
	/**
	 * Konfiguracja sortowania przez relacje (nested)
	 * Klucz to nazwa pola, wartość to ścieżka relacji
	 */
	relationSorts?: Record<string, string>;
	/**
	 * Konfiguracja wielokrotnego sortowania
	 * Klucz to nazwa pola, wartość to tablica dodatkowych sortowań
	 */
	multiSorts?: Record<string, Array<{ field: string; order?: 'asc' | 'desc' }>>;
}

/**
 * Buduje obiekt orderBy dla Prisma na podstawie parametrów sortowania
 */
export function buildOrderBy(
	sortBy: string | undefined,
	config: SortConfig,
	sortOrder?: 'asc' | 'desc',
): any {
	const {
		validSortFields,
		defaultField,
		defaultOrder = 'asc',
		fieldMapping,
		relationSorts,
		multiSorts,
	} = config;

	// Walidacja i wybór pola sortowania
	const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : defaultField;
	const order = sortOrder || defaultOrder;

	// Mapowanie nazwy pola (np. enrolledAt -> createdAt)
	const mappedField = fieldMapping?.[sortField] || sortField;

	// Sprawdź czy to sortowanie przez relację
	if (relationSorts && relationSorts[mappedField]) {
		const relationPath = relationSorts[mappedField];
		const pathParts = relationPath.split('.');
		let orderBy: any = {};
		let current = orderBy;

		// Buduj zagnieżdżoną strukturę
		for (let i = 0; i < pathParts.length - 1; i++) {
			current[pathParts[i]] = {};
			current = current[pathParts[i]];
		}
		current[pathParts[pathParts.length - 1]] = order;

		return orderBy;
	}

	// Sprawdź czy to wielokrotne sortowanie
	if (multiSorts && multiSorts[mappedField]) {
		const additionalSorts = multiSorts[mappedField];
		return [{ [mappedField]: order }, ...additionalSorts.map(s => ({ [s.field]: s.order || 'asc' }))];
	}

	// Proste sortowanie
	return { [mappedField]: order };
}
