import { z } from 'zod';

// ===========================================
// ENUMS Y CONSTANTES
// ===========================================

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
  COMPLETED = 'completed'
}

export enum EventType {
  CONCERT = 'concert',
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  PARTY = 'party',
  EXHIBITION = 'exhibition',
  SPORTS = 'sports',
  NETWORKING = 'networking',
  WEBINAR = 'webinar',
  FESTIVAL = 'festival',
  MEETUP = 'meetup',
  OTHER = 'other'
}

export enum EventCategory {
  MUSIC = 'music',
  TECHNOLOGY = 'technology',
  BUSINESS = 'business',
  ART_CULTURE = 'art_culture',
  SPORTS_FITNESS = 'sports_fitness',
  FOOD_DRINK = 'food_drink',
  EDUCATION = 'education',
  HEALTH_WELLNESS = 'health_wellness',
  FASHION = 'fashion',
  TRAVEL = 'travel',
  OTHER = 'other'
}

export enum InstagramContentType {
  POST = 'post',
  REEL = 'reel',
  IGTV = 'igtv',
  STORY = 'story'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum ExtractionConfidence {
  LOW = 'low',           // 0.0 - 0.4
  MEDIUM = 'medium',     // 0.4 - 0.7  
  HIGH = 'high',         // 0.7 - 0.9
  VERY_HIGH = 'very_high' // 0.9 - 1.0
}

// ===========================================
// ESQUEMAS ZOD DE VALIDACIÓN
// ===========================================

// Coordenadas geográficas
export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional()
});

// Ubicación completa
export const LocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255),
  address: z.string().optional(),
  city: z.string().optional(), 
  country: z.string().optional(),
  zipCode: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
  placeId: z.string().optional(), // Para Google Places, etc.
  instagramLocationId: z.string().optional()
});

// Precio del evento
export const PriceSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().length(3), // ISO 4217 (USD, EUR, etc.)
  tier: z.enum(['free', 'paid', 'donation', 'varies']).optional(),
  description: z.string().optional() // "Early bird", "VIP", etc.
});

// Organizador del evento
export const OrganizerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255),
  instagramHandle: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  verified: z.boolean().default(false)
});

// Fecha y hora del evento
export const EventDateTimeSchema = z.object({
  startDate: z.string().datetime(), // ISO 8601
  endDate: z.string().datetime().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone: z.string().default('UTC'), // IANA timezone
  allDay: z.boolean().default(false),
  recurring: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).default(1),
    endDate: z.string().datetime().optional(),
    count: z.number().min(1).optional()
  }).optional()
});

// Metadatos de extracción
export const ExtractionMetadataSchema = z.object({
  extractedAt: z.string().datetime(),
  processingTime: z.number().min(0), // milliseconds
  instagramPostId: z.string(),
  contentType: z.nativeEnum(InstagramContentType),
  confidence: z.number().min(0).max(1),
  confidenceLevel: z.nativeEnum(ExtractionConfidence),
  extractorVersion: z.string().default('1.0.0'),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([])
});

// Contenido multimedia
export const MediaContentSchema = z.object({
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    size: z.number().optional() // bytes
  })).default([]),
  videos: z.array(z.object({
    url: z.string().url(),
    thumbnail: z.string().url().optional(),
    duration: z.number().optional(), // seconds
    size: z.number().optional() // bytes
  })).default([])
});

// Contenido social
export const SocialContentSchema = z.object({
  hashtags: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
  likes: z.number().min(0).optional(),
  comments: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  views: z.number().min(0).optional()
});

// ===========================================
// ESQUEMA PRINCIPAL: EXTRACTED DATA
// ===========================================

export const ExtractedDataSchema = z.object({
  // Información básica del evento
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  
  // Fecha y hora
  dateTime: EventDateTimeSchema,
  
  // Ubicación
  location: LocationSchema.optional(),
  
  // Categorización
  type: z.nativeEnum(EventType).optional(),
  category: z.nativeEnum(EventCategory).optional(),
  tags: z.array(z.string()).default([]),
  
  // Precio
  price: PriceSchema.optional(),
  
  // Organizador
  organizer: OrganizerSchema.optional(),
  
  // Contenido multimedia
  media: MediaContentSchema.default({ images: [], videos: [] }),
  
  // Contenido social  
  social: SocialContentSchema.default({ hashtags: [], mentions: [] }),
  
  // Metadatos de extracción
  metadata: ExtractionMetadataSchema,
  
  // Contenido original
  rawContent: z.string(),
  originalUrl: z.string().url()
});

// ===========================================
// ESQUEMA PRINCIPAL: EVENT
// ===========================================

export const EventSchema = z.object({
  // Identificación
  id: z.string().uuid(),
  slug: z.string().min(1).max(255), // URL-friendly identifier
  
  // Información básica
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  summary: z.string().max(500).optional(), // Short description
  
  // Fecha y hora
  dateTime: EventDateTimeSchema,
  
  // Ubicación
  location: LocationSchema.optional(),
  
  // Categorización
  type: z.nativeEnum(EventType).default(EventType.OTHER),
  category: z.nativeEnum(EventCategory).default(EventCategory.OTHER),
  status: z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
  tags: z.array(z.string()).default([]),
  
  // Precio y capacidad
  price: PriceSchema.optional(),
  capacity: z.number().min(0).optional(),
  registeredCount: z.number().min(0).default(0),
  
  // Organizador
  organizer: OrganizerSchema.optional(),
  
  // Contenido multimedia
  media: MediaContentSchema.default({ images: [], videos: [] }),
  
  // Contenido social
  social: SocialContentSchema.default({ hashtags: [], mentions: [] }),
  
  // URLs relacionadas
  urls: z.object({
    website: z.string().url().optional(),
    tickets: z.string().url().optional(),
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).default({}),
  
  // Datos de extracción
  extractedData: ExtractedDataSchema.optional(),
  
  // Configuración de visibilidad
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  
  // Metadatos del sistema
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid().optional(),
  lastModifiedBy: z.string().uuid().optional()
});

// ===========================================
// ESQUEMA PRINCIPAL: USER
// ===========================================

export const UserPreferencesSchema = z.object({
  timezone: z.string().default('UTC'),
  language: z.string().length(2).default('en'), // ISO 639-1
  defaultCalendar: z.string().optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false)
  }).default({ email: true, push: true, sms: false }),
  eventCategories: z.array(z.nativeEnum(EventCategory)).default([]),
  autoSyncCalendar: z.boolean().default(false)
});

export const UserSchema = z.object({
  // Identificación
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  
  // Información personal
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
  
  // Configuración
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  preferences: UserPreferencesSchema.default({
    timezone: 'UTC',
    language: 'en',
    notifications: { email: true, push: true, sms: false },
    eventCategories: [],
    autoSyncCalendar: false
  }),
  
  // Estado de la cuenta
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  lastLoginAt: z.string().datetime().optional(),
  
  // Metadatos del sistema
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// ===========================================
// TIPOS TYPESCRIPT INFERIDOS
// ===========================================

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Price = z.infer<typeof PriceSchema>;
export type Organizer = z.infer<typeof OrganizerSchema>;
export type EventDateTime = z.infer<typeof EventDateTimeSchema>;
export type ExtractionMetadata = z.infer<typeof ExtractionMetadataSchema>;
export type MediaContent = z.infer<typeof MediaContentSchema>;
export type SocialContent = z.infer<typeof SocialContentSchema>;
export type ExtractedData = z.infer<typeof ExtractedDataSchema>;
export type Event = z.infer<typeof EventSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type User = z.infer<typeof UserSchema>;

// ===========================================
// TIPOS AUXILIARES
// ===========================================

export type EventCreateInput = Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'slug'>;
export type EventUpdateInput = Partial<Omit<Event, 'id' | 'createdAt' | 'slug'>>;
export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UserUpdateInput = Partial<Omit<User, 'id' | 'createdAt'>>;

// Tipos para filtrado y búsqueda
export type EventFilters = {
  status?: EventStatus[];
  type?: EventType[];
  category?: EventCategory[];
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  organizer?: string;
  tags?: string[];
  isPublic?: boolean;
  isFeatured?: boolean;
};

export type EventSortOptions = {
  field: 'createdAt' | 'updatedAt' | 'startDate' | 'title' | 'registeredCount';
  direction: 'asc' | 'desc';
}; 