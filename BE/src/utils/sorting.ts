/**
 * Sorting configuration for Prisma orderBy
 */
export interface SortConfig {
	/**
	 * List of allowed fields for sorting
	 */
	validSortFields: string[];
	/**
	 * Default sort field
	 */
	defaultField: string;
	/**
	 * Default sort direction
	 */
	defaultOrder?: 'asc' | 'desc';
	/**
	 * Field name mapping (e.g. 'enrolledAt' -> 'createdAt')
	 */
	fieldMapping?: Record<string, string>;
	/**
	 * Configuration for sorting through relations (nested)
	 * Key is field name, value is relation path
	 */
	relationSorts?: Record<string, string>;
	/**
	 * Configuration for multiple sorting
	 * Key is field name, value is array of additional sorts
	 */
	multiSorts?: Record<string, Array<{ field: string; order?: 'asc' | 'desc' }>>;
}

/**
 * Builds orderBy object for Prisma based on sorting parameters
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

	const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : defaultField;
	const order = sortOrder || defaultOrder;

	const mappedField = fieldMapping?.[sortField] || sortField;

	if (relationSorts && relationSorts[mappedField]) {
		const relationPath = relationSorts[mappedField];
		const pathParts = relationPath.split('.');
		let orderBy: any = {};
		let current = orderBy;

		for (let i = 0; i < pathParts.length - 1; i++) {
			current[pathParts[i]] = {};
			current = current[pathParts[i]];
		}
		current[pathParts[pathParts.length - 1]] = order;

		return orderBy;
	}

	if (multiSorts && multiSorts[mappedField]) {
		const additionalSorts = multiSorts[mappedField];
		return [{ [mappedField]: order }, ...additionalSorts.map(s => ({ [s.field]: s.order || 'asc' }))];
	}

	return { [mappedField]: order };
}
