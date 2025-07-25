// ===========================================
// TIPOS PRINCIPALES DEL BACKEND
// ===========================================

// Evento base
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time?: string; // HH:MM format
  location?: string;
  imageUrl?: string;
  instagramUrl: string;
  confidence?: number; // 0-1 confidence score
  createdAt: string;
  updatedAt: string;
}

// Datos extraídos de Instagram
export interface ExtractedData {
  title: string;
  description: string;
  date?: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  confidence: number;
  metadata: {
    postType: 'post' | 'reel' | 'igtv' | 'story';
    extractedAt: string;
    processingTime: number;
  };
}

// Request para extraer evento
export interface ExtractEventRequest {
  url: string;
}

// Response de extracción exitosa
export interface ExtractEventResponse {
  success: true;
  data: {
    id: string;
    extracted: ExtractedData;
    event: Event;
  };
  message: string;
}

// Response de error
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Respuesta de health check
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    scraper: 'available' | 'unavailable';
  };
  uptime: number;
}

// Lista de eventos
export interface EventsListResponse {
  success: true;
  data: {
    events: Event[];
    total: number;
    page: number;
    limit: number;
  };
}

// Configuración de validación
export interface ValidationConfig {
  instagram: {
    allowedPatterns: RegExp[];
    blockedPatterns: RegExp[];
    maxUrlLength: number;
  };
}

// Configuración del scraper (para futura integración MCP)
export interface ScraperConfig {
  timeout: number;
  retries: number;
  rateLimiting: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  userAgent: string;
  headers: Record<string, string>;
}

// Resultado del scraping
export interface ScrapingResult {
  success: boolean;
  data?: any;
  error?: {
    type: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'RATE_LIMIT' | 'INVALID_URL' | 'ACCESS_DENIED';
    message: string;
    retryAfter?: number;
  };
  metadata: {
    processingTime: number;
    attempts: number;
    url: string;
  };
}

// Parámetros de consulta para eventos
export interface EventsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Usuario (para futuro)
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  preferences: {
    timezone: string;
    defaultCalendar: string;
  };
}

// ===========================================
// TIPOS DE MIDDLEWARE
// ===========================================

export interface RequestWithUser extends Request {
  user?: User;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// ===========================================
// ENUMS Y CONSTANTES
// ===========================================

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled'
}

export enum ScrapingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  EVENTS: '/api/events',
  EXTRACT: '/api/events/extract',
  EVENT_BY_ID: '/api/events/:id'
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_URL: 'INVALID_URL',
  SCRAPING_FAILED: 'SCRAPING_FAILED'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500
} as const; 