export type Pagination = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export type Paginated<T> = { data: T[], pagination: Pagination }

