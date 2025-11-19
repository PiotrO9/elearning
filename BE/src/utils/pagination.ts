import { Pagination } from '../types/api';

/**
 * Buduje obiekt paginacji na podstawie danych
 */
export function buildPagination(total: number, page: number, limit: number): Pagination {
	const totalPages = Math.ceil(total / limit);
	return {
		currentPage: page,
		totalPages,
		totalItems: total,
		limit,
	};
}
