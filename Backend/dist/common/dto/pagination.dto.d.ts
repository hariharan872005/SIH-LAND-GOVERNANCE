export declare class PaginationDto {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface PaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class PaginatedResult<T> {
    items: T[];
    meta: PaginationMeta;
    constructor(items: T[], total: number, page: number, pageSize: number);
}
