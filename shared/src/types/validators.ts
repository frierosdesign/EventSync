import { z } from 'zod';
import {
  EventSchema,
  ExtractedDataSchema,
  UserSchema,
  EventStatus,
  EventType,
  EventCategory,
  ExtractionConfidence,
  type Event,
  type ExtractedData,
  type User,
  type EventFilters
} from './models';

// ===========================================
// VALIDADORES DE ENTRADA DE DATOS
// ===========================================

// Esquema para validar URLs de Instagram (más robusto)
export const InstagramUrlSchema = z.object({
  url: z
    .string()
    .min(1, 'La URL es requerida')
    .url('Debe ser una URL válida')
    .regex(
      /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|igtv|stories)\/[A-Za-z0-9_.-]+\/?[0-9]*\/?(\?.*)?$/,
      'Debe ser una URL válida de Instagram (post, reel, IGTV o story)'
    )
    .refine(
      (url) => {
        // Validación adicional para asegurar que no sea una URL de perfil
        return !url.match(/^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/?$/);
      },
      'La URL debe ser de un post específico, no de un perfil'
    )
    .transform((url) => {
      // Normalizar URL removiendo parámetros innecesarios
      try {
        const urlObj = new URL(url);
        // Remover parámetros de tracking
        ['utm_source', 'utm_medium', 'utm_campaign', 'igshid', 'hl'].forEach(param => {
          urlObj.searchParams.delete(param);
        });
        // Asegurar protocolo HTTPS
        urlObj.protocol = 'https:';
        // Asegurar dominio www
        if (urlObj.hostname === 'instagram.com') {
          urlObj.hostname = 'www.instagram.com';
        }
        return urlObj.toString();
      } catch {
        return url;
      }
    })
});

// Esquema para crear eventos desde datos extraídos
export const CreateEventFromExtractionSchema = z.object({
  extractedData: ExtractedDataSchema,
  overrides: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    status: z.nativeEnum(EventStatus).optional(),
    type: z.nativeEnum(EventType).optional(),
    category: z.nativeEnum(EventCategory).optional(),
    isPublic: z.boolean().optional(),
    isFeatured: z.boolean().optional()
  }).optional()
});

// Esquema para filtros de búsqueda de eventos
export const EventFiltersSchema = z.object({
  status: z.array(z.nativeEnum(EventStatus)).optional(),
  type: z.array(z.nativeEnum(EventType)).optional(),
  category: z.array(z.nativeEnum(EventCategory)).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  location: z.string().optional(),
  organizer: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  search: z.string().optional()
});

// Esquema para paginación
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'startDate', 'title', 'registeredCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ===========================================
// FUNCIONES DE VALIDACIÓN ESPECÍFICAS
// ===========================================

/**
 * Valida si una URL es de Instagram
 */
export function validateInstagramUrl(url: string): {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
} {
  try {
    const result = InstagramUrlSchema.parse({ url });
    return {
      isValid: true,
      normalizedUrl: result.url
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.issues[0]?.message || 'URL inválida'
      };
    }
    return {
      isValid: false,
      error: 'Error de validación'
    };
  }
}

/**
 * Valida datos extraídos antes de procesarlos
 */
export function validateExtractedData(data: unknown): {
  isValid: boolean;
  data?: ExtractedData;
  errors?: string[];
} {
  try {
    const validData = ExtractedDataSchema.parse(data);
    return {
      isValid: true,
      data: validData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      };
    }
    return {
      isValid: false,
      errors: ['Error de validación desconocido']
    };
  }
}

/**
 * Valida un evento completo
 */
export function validateEvent(data: unknown): {
  isValid: boolean;
  event?: Event;
  errors?: string[];
} {
  try {
    const validEvent = EventSchema.parse(data);
    return {
      isValid: true,
      event: validEvent
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      };
    }
    return {
      isValid: false,
      errors: ['Error de validación desconocido']
    };
  }
}

/**
 * Valida filtros de búsqueda de eventos
 */
export function validateEventFilters(filters: unknown): {
  isValid: boolean;
  filters?: EventFilters & { search?: string };
  errors?: string[];
} {
  try {
    const validFilters = EventFiltersSchema.parse(filters);
    return {
      isValid: true,
      filters: validFilters
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      };
    }
    return {
      isValid: false,
      errors: ['Error de validación desconocido']
    };
  }
}

/**
 * Valida el nivel de confianza de extracción
 */
export function validateExtractionConfidence(confidence: number): ExtractionConfidence {
  if (confidence >= 0.9) return ExtractionConfidence.VERY_HIGH;
  if (confidence >= 0.7) return ExtractionConfidence.HIGH;
  if (confidence >= 0.4) return ExtractionConfidence.MEDIUM;
  return ExtractionConfidence.LOW;
}

/**
 * Valida si una fecha está en el futuro
 */
export function validateFutureDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
  } catch {
    return false;
  }
}

/**
 * Valida rangos de fechas
 */
export function validateDateRange(startDate: string, endDate?: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    const start = new Date(startDate);
    
    if (endDate) {
      const end = new Date(endDate);
      if (end <= start) {
        return {
          isValid: false,
          error: 'La fecha de fin debe ser posterior a la fecha de inicio'
        };
      }
    }
    
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Formato de fecha inválido'
    };
  }
}

/**
 * Valida coordenadas geográficas
 */
export function validateCoordinates(lat: number, lng: number): {
  isValid: boolean;
  error?: string;
} {
  if (lat < -90 || lat > 90) {
    return {
      isValid: false,
      error: 'La latitud debe estar entre -90 y 90 grados'
    };
  }
  
  if (lng < -180 || lng > 180) {
    return {
      isValid: false,
      error: 'La longitud debe estar entre -180 y 180 grados'
    };
  }
  
  return { isValid: true };
}

/**
 * Valida formato de timezone
 */
export function validateTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida formato de email (más robusto que el estándar)
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Formato de email inválido'
    };
  }
  
  // Validaciones adicionales
  if (email.length > 254) {
    return {
      isValid: false,
      error: 'Email demasiado largo'
    };
  }
  
  const [localPart] = email.split('@');
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Parte local del email demasiado larga'
    };
  }
  
  return { isValid: true };
}

// ===========================================
// TIPOS DERIVADOS PARA VALIDACIÓN
// ===========================================

export type InstagramUrlInput = z.infer<typeof InstagramUrlSchema>;
export type CreateEventFromExtractionInput = z.infer<typeof CreateEventFromExtractionSchema>;
export type EventFiltersInput = z.infer<typeof EventFiltersSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;

// ===========================================
// VALIDADORES DE RUNTIME PARA TIPOS ESPECÍFICOS
// ===========================================

/**
 * Type guard para verificar si un objeto es un Event válido
 */
export function isValidEvent(obj: unknown): obj is Event {
  try {
    EventSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard para verificar si un objeto es ExtractedData válido
 */
export function isValidExtractedData(obj: unknown): obj is ExtractedData {
  try {
    ExtractedDataSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard para verificar si un objeto es User válido
 */
export function isValidUser(obj: unknown): obj is User {
  try {
    UserSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
} 