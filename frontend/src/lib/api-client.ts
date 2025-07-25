import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ExtractEventRequest, ExtractEventResponse, EventsListResponse, HealthResponse } from '../../../shared/src/types/api';

// ===========================================
// TIPOS Y INTERFACES
// ===========================================

export interface RetryConfig {
  retries: number;
  retryDelay: (retryCount: number) => number;
  retryCondition: (error: AxiosError) => boolean;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retry: RetryConfig;
  headers?: Record<string, string>;
}

export interface RequestOptions extends AxiosRequestConfig {
  skipRetry?: boolean;
  customTimeout?: number;
}

// Tipos de error específicos de la API
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode?: number;
  public readonly originalError?: Error;
  public readonly retryCount: number;
  public readonly response?: AxiosResponse;

  constructor(
    message: string,
    type: ApiErrorType,
    statusCode?: number,
    originalError?: Error,
    retryCount = 0,
    response?: AxiosResponse
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.retryCount = retryCount;
    this.response = response;
  }
}

// ===========================================
// CONFIGURACIÓN POR DEFECTO
// ===========================================

const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000, // 10 segundos
  retry: {
    retries: 3,
    retryDelay: (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 10000), // Exponential backoff
    retryCondition: (error: AxiosError) => {
      // Retry en errores de red, timeouts, y errores 5xx
      return (
        !error.response ||
        error.code === 'ECONNABORTED' ||
        (error.response.status >= 500 && error.response.status < 600) ||
        error.response.status === 429 // Rate limit
      );
    }
  }
};

// ===========================================
// CLIENTE API
// ===========================================

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.axiosInstance = this.createAxiosInstance();
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers
      }
    });

    // Request interceptor para logging
    instance.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params
        });
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para logging y transformación
    instance.interceptors.response.use(
      (response) => {
        console.log(`[API] ${response.status} ${response.config.url}`, {
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('[API] Response error:', error);
        return Promise.reject(error);
      }
    );

    return instance;
  }

  private determineErrorType(error: AxiosError): ApiErrorType {
    if (!error.response) {
      return error.code === 'ECONNABORTED' ? ApiErrorType.TIMEOUT_ERROR : ApiErrorType.NETWORK_ERROR;
    }

    const status = error.response.status;
    
    if (status === 429) return ApiErrorType.RATE_LIMIT_ERROR;
    if (status >= 400 && status < 500) return ApiErrorType.VALIDATION_ERROR;
    if (status >= 500) return ApiErrorType.SERVER_ERROR;
    
    return ApiErrorType.UNKNOWN_ERROR;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipRetry = false } = options;
    const maxRetries = skipRetry ? 0 : this.config.retry.retries;
    
    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await requestFn();
        return response.data;
      } catch (error) {
        lastError = error as AxiosError;
        
        // Si es el último intento, lanzar error
        if (attempt === maxRetries) {
          break;
        }

        // Verificar si deberíamos reintentar
        if (!this.config.retry.retryCondition(lastError)) {
          break;
        }

        // Calcular delay y esperar
        const delay = this.config.retry.retryDelay(attempt);
        console.warn(`[API] Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms:`, lastError.message);
        await this.sleep(delay);
      }
    }

    // Crear y lanzar ApiError final
    const errorType = this.determineErrorType(lastError!);
    throw new ApiError(
      lastError!.message || 'Request failed',
      errorType,
      lastError!.response?.status,
      lastError!,
      maxRetries,
      lastError!.response
    );
  }

  // ===========================================
  // MÉTODOS PÚBLICOS
  // ===========================================

  public async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { customTimeout, ...axiosOptions } = options;
    
    return this.executeWithRetry<T>(
      () => this.axiosInstance.get(url, {
        ...axiosOptions,
        timeout: customTimeout || this.config.timeout
      }),
      options
    );
  }

  public async post<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { customTimeout, ...axiosOptions } = options;
    
    return this.executeWithRetry<T>(
      () => this.axiosInstance.post(url, data, {
        ...axiosOptions,
        timeout: customTimeout || this.config.timeout
      }),
      options
    );
  }

  public async put<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { customTimeout, ...axiosOptions } = options;
    
    return this.executeWithRetry<T>(
      () => this.axiosInstance.put(url, data, {
        ...axiosOptions,
        timeout: customTimeout || this.config.timeout
      }),
      options
    );
  }

  public async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { customTimeout, ...axiosOptions } = options;
    
    return this.executeWithRetry<T>(
      () => this.axiosInstance.delete(url, {
        ...axiosOptions,
        timeout: customTimeout || this.config.timeout
      }),
      options
    );
  }

  // ===========================================
  // MÉTODOS ESPECÍFICOS DE LA API
  // ===========================================

  public async health(): Promise<HealthResponse> {
    // Health endpoint is at root level, not under /api
    const healthUrl = this.config.baseURL.replace('/api', '') + '/health';
    return this.axiosInstance.get(healthUrl, { 
      timeout: 5000 
    }).then(response => response.data);
  }

  public async extractEvent(request: ExtractEventRequest): Promise<ExtractEventResponse> {
    return this.post<ExtractEventResponse>('/events/extract', request, {
      customTimeout: 30000 // Extracción puede tomar más tiempo
    });
  }

  public async getEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<EventsListResponse> {
    return this.get<EventsListResponse>('/events', { params });
  }

  public async getEventById(id: string): Promise<ApiResponse> {
    return this.get<ApiResponse>(`/events/${id}`);
  }

  public async deleteEvent(id: string): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`/events/${id}`);
  }

  public async getStats(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/events/stats');
  }

  public async testExtraction(request: ExtractEventRequest): Promise<ExtractEventResponse> {
    return this.post<ExtractEventResponse>('/events/test-extraction', request, {
      customTimeout: 30000
    });
  }
}

// ===========================================
// INSTANCIA SINGLETON
// ===========================================

export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
});

// Export para testing
export { DEFAULT_CONFIG }; 