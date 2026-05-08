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

export interface QuotaExceededError {
  code: 'QUOTA_EXCEEDED';
  message: string;
  quota: number;
  current: number;
}

export interface FeatureNotActiveError {
  code: 'FEATURE_NOT_ACTIVE';
  message: string;
  feature_slug: string;
}