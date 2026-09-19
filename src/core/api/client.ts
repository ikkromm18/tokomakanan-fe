import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/core/config/env';
import { tokenStorage } from '@/core/security/tokenStorage';
import { logger } from '@/core/logger/logger';
import { parseApiError } from '@/core/api/errorHandler';
import type { ApiResponse, PaginatedResponse } from '@/core/types/api';

/**
 * Custom event fired when a 401 Unauthorized occurs
 */
export const AUTH_UNAUTHORIZED_EVENT = 'app:auth:unauthorized';

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Inject Bearer token if available
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // 2. Generate and attach X-Request-ID for correlation tracing
    const requestId = generateRequestId();
    config.headers.set('X-Request-ID', requestId);

    logger.debug(`HTTP ${config.method?.toUpperCase()} ${config.url}`, {
      component: 'apiClient',
      requestId,
      method: config.method,
      url: config.url,
    });

    return config;
  },
  (error) => {
    return Promise.reject(parseApiError(error));
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const requestId = response.config.headers['X-Request-ID'] as string;
    logger.debug(`HTTP ${response.status} ${response.config.url}`, {
      component: 'apiClient',
      requestId,
      status: response.status,
    });

    return response;
  },
  (error) => {
    const parsedError = parseApiError(error);

    logger.error(`HTTP Request Failed [${parsedError.status}]: ${parsedError.message}`, {
      component: 'apiClient',
      requestId: parsedError.requestId,
      statusCode: parsedError.status,
      errors: parsedError.fieldErrors,
    });

    // On 401 Unauthorized, automatically clear token and broadcast event
    if (parsedError.status === 401) {
      tokenStorage.removeToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(AUTH_UNAUTHORIZED_EVENT, {
            detail: { message: parsedError.message },
          })
        );
      }
    }

    return Promise.reject(parsedError);
  }
);

/**
 * Standard typed HTTP client helpers unwrapping API envelope
 */
export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  async getPaginated<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    const response = await axiosInstance.get<PaginatedResponse<T>>(url, config);
    return response.data;
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
};
