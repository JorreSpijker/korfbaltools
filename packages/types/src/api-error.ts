export const API_ERROR_CODES = [
  "unauthorized",
  "forbidden",
  "not_found",
  "validation_error",
  "conflict",
  "internal_error",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation_error: 422,
  conflict: 409,
  internal_error: 500,
};

export function apiErrorStatus(code: ApiErrorCode): number {
  return STATUS_BY_CODE[code];
}

export function apiError(code: ApiErrorCode, message: string, details?: unknown): ApiErrorBody {
  return { error: { code, message, details } };
}
