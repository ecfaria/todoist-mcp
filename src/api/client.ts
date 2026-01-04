/**
 * Todoist API HTTP client with error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { TodoistApiError, RateLimitError } from './errors.js';
import { logger } from '../utils/logger.js';

/**
 * HTTP client for Todoist REST API v2
 */
export class TodoistClient {
  private client: AxiosInstance;

  /**
   * Create a new Todoist API client
   * @param apiToken Todoist API token
   */
  constructor(apiToken: string) {
    // Initialize axios with base configuration
    this.client = axios.create({
      baseURL: 'https://api.todoist.com/rest/v2',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * Handle API errors with proper categorization
   */
  private handleError(error: AxiosError): never {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      logger.debug(`API error: ${status}`, data);

      // Rate limiting (429)
      if (status === 429) {
        logger.error('Rate limit exceeded');
        throw new RateLimitError();
      }

      // Client errors (4xx) - don't retry
      if (status >= 400 && status < 500) {
        const message = data?.error || data?.message || `HTTP ${status}: Invalid request`;
        throw new TodoistApiError(message, status, false);
      }

      // Server errors (5xx) - retryable
      if (status >= 500) {
        const message = data?.error || data?.message || 'Todoist server error';
        throw new TodoistApiError(message, status, true);
      }
    }

    // Network errors (no response received)
    if (error.request) {
      logger.error('Network error:', error.message);
      throw new TodoistApiError(
        'Network error. Please check your internet connection.',
        0,
        true
      );
    }

    // Other errors
    logger.error('Unexpected error:', error.message);
    throw new TodoistApiError(error.message || 'Unknown error occurred', 0, false);
  }

  /**
   * Perform a GET request
   * @param path API endpoint path
   * @param params Query parameters
   * @returns Response data
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    logger.debug(`GET ${path}`, params);
    const response = await this.client.get<T>(path, { params });
    return response.data;
  }

  /**
   * Perform a POST request
   * @param path API endpoint path
   * @param data Request body data
   * @returns Response data
   */
  async post<T>(path: string, data?: Record<string, any>): Promise<T> {
    logger.debug(`POST ${path}`, data);
    const response = await this.client.post<T>(path, data);
    return response.data;
  }

  /**
   * Perform a DELETE request
   * @param path API endpoint path
   * @returns void
   */
  async delete(path: string): Promise<void> {
    logger.debug(`DELETE ${path}`);
    await this.client.delete(path);
  }
}
