import axios from 'axios';
import type { ApiErrorResponse, FieldError } from '@/core/types/api';

export class AppApiError extends Error {
  status: number;
  fieldErrors?: FieldError[];
  requestId?: string;
  isBusinessError: boolean;
  isAuthError: boolean;
  isForbidden: boolean;

  constructor(
    message: string,
    status: number,
    fieldErrors?: FieldError[],
    requestId?: string
  ) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.requestId = requestId;
    this.isBusinessError = status === 422;
    this.isAuthError = status === 401;
    this.isForbidden = status === 403;
  }
}

/**
 * Parses axios or generic errors into a typed AppApiError
 */
export function parseApiError(error: unknown): AppApiError {
  if (error instanceof AppApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const data = error.response?.data as ApiErrorResponse | undefined;
    const message = data?.message || error.message || 'Terjadi kesalahan pada sistem';
    const fieldErrors = data?.errors;
    const requestId =
      (error.config?.headers?.['X-Request-ID'] as string) ||
      (error.response?.headers?.['x-request-id'] as string) ||
      undefined;

    return new AppApiError(message, status, fieldErrors, requestId);
  }

  if (error instanceof Error) {
    return new AppApiError(error.message, 500);
  }

  return new AppApiError('Terjadi kesalahan yang tidak diketahui', 500);
}
