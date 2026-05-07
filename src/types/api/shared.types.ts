// src/types/api/shared.types.ts

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DetailResponse {
  detail: string;
} 