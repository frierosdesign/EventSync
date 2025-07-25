import { EventType, EventCategory, ExtractionConfidence } from '../types/models';

// ===========================================
// CONFIGURACIÓN DE TIPOS DE EVENTOS
// ===========================================

// Configuración de confianza por umbral
export const CONFIDENCE_THRESHOLDS = {
  [EventType.CONCERT]: { threshold: 0.8, category: EventCategory.MUSIC },
  [EventType.CONFERENCE]: { threshold: 0.85, category: EventCategory.BUSINESS },
  [EventType.WORKSHOP]: { threshold: 0.8, category: EventCategory.EDUCATION },
  [EventType.PARTY]: { threshold: 0.7, category: EventCategory.MUSIC },
  [EventType.EXHIBITION]: { threshold: 0.8, category: EventCategory.ART_CULTURE },
  [EventType.SPORTS]: { threshold: 0.85, category: EventCategory.SPORTS_FITNESS },
  [EventType.NETWORKING]: { threshold: 0.8, category: EventCategory.BUSINESS },
  [EventType.WEBINAR]: { threshold: 0.9, category: EventCategory.EDUCATION },
  [EventType.FESTIVAL]: { threshold: 0.8, category: EventCategory.MUSIC },
  [EventType.MEETUP]: { threshold: 0.75, category: EventCategory.BUSINESS },
  [EventType.OTHER]: { threshold: 0.6, category: EventCategory.OTHER },
  HIGH: { threshold: 0.8 },
  MEDIUM: { threshold: 0.6 },
  LOW: { threshold: 0.4 }
};

// Palabras clave para detección de tipos de eventos
export const TYPE_KEYWORDS = {
  [EventType.CONCERT]: ['concierto', 'concert', 'música', 'music', 'live', 'show', 'presentación'],
  [EventType.CONFERENCE]: ['conferencia', 'conference', 'charla', 'talk', 'summit', 'congreso'],
  [EventType.WORKSHOP]: ['workshop', 'taller', 'seminario', 'curso', 'training', 'capacitación'],
  [EventType.PARTY]: ['fiesta', 'party', 'celebración', 'celebration', 'after', 'night'],
  [EventType.EXHIBITION]: ['exposición', 'exhibition', 'muestra', 'galería', 'gallery', 'expo'],
  [EventType.SPORTS]: ['deporte', 'sports', 'torneo', 'tournament', 'competencia', 'championship'],
  [EventType.NETWORKING]: ['networking', 'red', 'contactos', 'business', 'empresarial'],
  [EventType.WEBINAR]: ['webinar', 'online', 'virtual', 'zoom', 'stream', 'streaming'],
  [EventType.FESTIVAL]: ['festival', 'fest', 'feria', 'fair', 'carnaval', 'carnival'],
  [EventType.MEETUP]: ['meetup', 'encuentro', 'reunion', 'meeting', 'juntada'],
  [EventType.OTHER]: ['evento', 'event', 'actividad', 'activity']
};

// Palabras clave para detección de categorías
export const CATEGORY_KEYWORDS = {
  [EventCategory.MUSIC]: ['música', 'music', 'band', 'dj', 'cantante', 'singer', 'rock', 'pop', 'jazz'],
  [EventCategory.TECHNOLOGY]: ['tech', 'tecnología', 'software', 'programming', 'coding', 'startup', 'digital'],
  [EventCategory.BUSINESS]: ['business', 'negocio', 'empresa', 'emprendimiento', 'startup', 'marketing'],
  [EventCategory.ART_CULTURE]: ['arte', 'art', 'cultura', 'culture', 'museo', 'museum', 'teatro', 'theater'],
  [EventCategory.SPORTS_FITNESS]: ['deporte', 'sport', 'fitness', 'gym', 'running', 'yoga', 'exercise'],
  [EventCategory.FOOD_DRINK]: ['comida', 'food', 'restaurant', 'chef', 'cocina', 'wine', 'beer', 'drink'],
  [EventCategory.EDUCATION]: ['educación', 'education', 'universidad', 'university', 'school', 'learning'],
  [EventCategory.HEALTH_WELLNESS]: ['salud', 'health', 'wellness', 'bienestar', 'meditation', 'therapy'],
  [EventCategory.FASHION]: ['moda', 'fashion', 'style', 'clothing', 'design', 'runway', 'trends'],
  [EventCategory.TRAVEL]: ['viaje', 'travel', 'turismo', 'tourism', 'destination', 'vacation'],
  [EventCategory.OTHER]: ['otro', 'other', 'varios', 'misc', 'general']
};

// ===========================================
// CONFIGURACIÓN DE EXTRACCIÓN
// ===========================================

export const EVENT_TYPE_CONFIG = {
  [EventType.CONCERT]: {
    category: EventCategory.MUSIC,
    confidence: 0.8,
    keywords: TYPE_KEYWORDS[EventType.CONCERT],
    requiredFields: ['title', 'date', 'location']
  },
  [EventType.CONFERENCE]: {
    category: EventCategory.BUSINESS,
    confidence: 0.85,
    keywords: TYPE_KEYWORDS[EventType.CONFERENCE],
    requiredFields: ['title', 'date', 'description']
  },
  [EventType.WORKSHOP]: {
    category: EventCategory.EDUCATION,
    confidence: 0.8,
    keywords: TYPE_KEYWORDS[EventType.WORKSHOP],
    requiredFields: ['title', 'date', 'description']
  },
  [EventType.PARTY]: {
    category: EventCategory.MUSIC,
    confidence: 0.7,
    keywords: TYPE_KEYWORDS[EventType.PARTY],
    requiredFields: ['title', 'date']
  },
  [EventType.EXHIBITION]: {
    category: EventCategory.ART_CULTURE,
    confidence: 0.8,
    keywords: TYPE_KEYWORDS[EventType.EXHIBITION],
    requiredFields: ['title', 'date', 'location']
  },
  [EventType.SPORTS]: {
    category: EventCategory.SPORTS_FITNESS,
    confidence: 0.85,
    keywords: TYPE_KEYWORDS[EventType.SPORTS],
    requiredFields: ['title', 'date', 'location']
  },
  [EventType.NETWORKING]: {
    category: EventCategory.BUSINESS,
    confidence: 0.8,
    keywords: TYPE_KEYWORDS[EventType.NETWORKING],
    requiredFields: ['title', 'date']
  },
  [EventType.WEBINAR]: {
    category: EventCategory.EDUCATION,
    confidence: 0.9,
    keywords: TYPE_KEYWORDS[EventType.WEBINAR],
    requiredFields: ['title', 'date', 'description']
  },
  [EventType.FESTIVAL]: {
    category: EventCategory.MUSIC,
    confidence: 0.8,
    keywords: TYPE_KEYWORDS[EventType.FESTIVAL],
    requiredFields: ['title', 'date', 'location']
  },
  [EventType.MEETUP]: {
    category: EventCategory.BUSINESS,
    confidence: 0.75,
    keywords: TYPE_KEYWORDS[EventType.MEETUP],
    requiredFields: ['title', 'date']
  },
  [EventType.OTHER]: {
    category: EventCategory.OTHER,
    confidence: 0.6,
    keywords: TYPE_KEYWORDS[EventType.OTHER],
    requiredFields: ['title', 'date']
  }
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

export const getEventTypeConfig = (type: EventType) => {
  return EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG[EventType.OTHER];
};

export const getCategoryConfig = (category: EventCategory) => {
  return CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS[EventCategory.OTHER];
};

export const scoreToConfidenceLevel = (score: number): ExtractionConfidence => {
  if (score >= 0.9) return ExtractionConfidence.VERY_HIGH;
  if (score >= 0.7) return ExtractionConfidence.HIGH;
  if (score >= 0.4) return ExtractionConfidence.MEDIUM;
  return ExtractionConfidence.LOW;
};

export const findEventTypeByKeyword = (text: string): EventType | null => {
  const normalizedText = text.toLowerCase();
  
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some(keyword => normalizedText.includes(keyword.toLowerCase()))) {
      return type as EventType;
    }
  }
  
  return null;
};

export const findCategoryByKeyword = (text: string): EventCategory | null => {
  const normalizedText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => normalizedText.includes(keyword.toLowerCase()))) {
      return category as EventCategory;
    }
  }
  
  return null;
}; 