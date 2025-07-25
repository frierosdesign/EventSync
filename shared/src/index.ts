// ===========================================
// TIPOS Y ENUMS PRINCIPALES
// ===========================================
export {
  // Enums principales
  EventStatus,
  EventType,
  EventCategory,
  InstagramContentType,
  UserRole,
  ExtractionConfidence,
  
  // Tipos principales
  type Event,
  type ExtractedData,
  type User,
  type Location,
  type Coordinates,
  type Price,
  type Organizer,
  type EventDateTime,
  type ExtractionMetadata,
  type MediaContent,
  type SocialContent,
  type UserPreferences,
  type EventFilters,
  
  // Schemas de validación
  EventSchema,
  ExtractedDataSchema,
  UserSchema,
  LocationSchema,
  CoordinatesSchema,
  PriceSchema,
  OrganizerSchema,
  EventDateTimeSchema,
  ExtractionMetadataSchema,
  MediaContentSchema,
  SocialContentSchema,
  UserPreferencesSchema
} from './types/models';

// ===========================================
// VALIDADORES
// ===========================================
export {
  // Schemas de validación
  InstagramUrlSchema,
  CreateEventFromExtractionSchema,
  EventFiltersSchema,
  PaginationSchema,
  
  // Tipos de validación
  type InstagramUrlInput,
  type CreateEventFromExtractionInput,
  type EventFiltersInput,
  type PaginationInput,
  
  // Funciones de validación
  validateInstagramUrl,
  validateExtractedData,
  validateEvent,
  validateEventFilters,
  validateExtractionConfidence,
  validateFutureDate,
  validateDateRange,
  validateCoordinates,
  validateTimezone,
  validateEmail,
  isValidEvent,
  isValidExtractedData,
  isValidUser
} from './types/validators';

// ===========================================
// UTILIDADES DE CALENDARIO
// ===========================================
export {
  formatDateForGoogleCalendar,
  calculateEndDate,
  encodeForUrl,
  sanitizeTitle,
  formatDescription,
  generateGoogleCalendarUrl,
  eventToGoogleCalendarData,
  extractedDataToGoogleCalendarData,
  generateGoogleCalendarUrlFromEvent,
  generateGoogleCalendarUrlFromExtractedData,
  validateEventForExport,
  type GoogleCalendarEventData,
  type CalendarExportOptions
} from './utils/calendar';

// ===========================================
// UTILIDADES DE NORMALIZACIÓN
// ===========================================
export {
  normalizeDateText,
  normalizeTimeText,
  createEventDateTime,
  normalizeLocationText,
  normalizePriceText,
  normalizeEventType,
  normalizeEventCategory,
  normalizeHashtags,
  normalizeMentions,
  normalizeText,
  generateSlug
} from './utils/normalizers';

// ===========================================
// VALIDADORES DE EXTRACCIÓN
// ===========================================
export {
  validateEventTitle,
  validateEventDateTime,
  validateEventLocation,
  validateEventPrice,
  validateEventClassification,
  validateExtractedData as validateExtractedDataUtils,
  evaluateExtractionQuality,
  isExtractedDataSufficient,
  getExtractionRecommendations,
  type ValidationResult,
  type ExtractionQualityReport
} from './utils/extraction-validators';

// ===========================================
// UTILIDADES DE INSTAGRAM
// ===========================================
export {
  INSTAGRAM_URL_PATTERNS,
  TRACKING_PARAMETERS,
  INSTAGRAM_DOMAINS,
  analyzeInstagramUrl,
  cleanInstagramUrl,
  detectInstagramContentType,
  extractInstagramContentId,
  extractUsernameFromStory,
  isInstagramUrl,
  isInstagramContentUrl,
  validateInstagramUrl as validateInstagramUrlUtils,
  analyzeInstagramUrlContext,
  generateBackupUrls,
  getExpectedMetadata,
  calculateAvailabilityProbability,
  type InstagramUrlAnalysis,
  type InstagramUrlValidation,
  type InstagramUrlContext,
  type ExpectedMetadata
} from './utils/instagram';

// ===========================================
// CONFIGURACIÓN DE EVENTOS
// ===========================================
export {
  // Event configuration
  EVENT_TYPE_CONFIG,
  CONFIDENCE_THRESHOLDS,
  TYPE_KEYWORDS,
  CATEGORY_KEYWORDS,
  getEventTypeConfig,
  getCategoryConfig,
  scoreToConfidenceLevel,
  findEventTypeByKeyword,
  findCategoryByKeyword
} from './constants/events'; 