export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    stack?: string;
    timestamp: string;
    path: string;
    method: string;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  isOperational?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===========================================
// TIPOS ESPECÍFICOS DE REQUESTS Y RESPONSES
// ===========================================

import { Event, ExtractedData } from './models';

export interface ExtractEventRequest {
  url: string;
}

export interface ExtractEventResponse {
  success: boolean;
  data?: {
    id: string;
    extracted: ExtractedData;
    event: Event;
  };
  error?: string;
  message?: string;
}

export interface EventsListResponse {
  success: boolean;
  data: {
    events: Event[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface HealthResponse {
  status: 'OK' | 'healthy' | 'unhealthy';
  timestamp: string;
  service?: string;
  version?: string;
  services?: {
    database: 'connected' | 'disconnected';
    scraper: 'available' | 'unavailable';
  };
  uptime?: number;
} 