import { EventType, EventCategory, type Location, type EventDateTime, type Price } from '../types/models';

// ===========================================
// NORMALIZACIÓN DE FECHAS Y HORAS
// ===========================================

/**
 * Mapeo de meses en español a números
 */
const SPANISH_MONTHS: Record<string, number> = {
  'enero': 0, 'ene': 0,
  'febrero': 1, 'feb': 1,
  'marzo': 2, 'mar': 2,
  'abril': 3, 'abr': 3,
  'mayo': 4, 'may': 4,
  'junio': 5, 'jun': 5,
  'julio': 6, 'jul': 6,
  'agosto': 7, 'ago': 7,
  'septiembre': 8, 'sep': 8, 'sept': 8,
  'octubre': 9, 'oct': 9,
  'noviembre': 10, 'nov': 10,
  'diciembre': 11, 'dic': 11
};

/**
 * Mapeo de días de la semana en español
 */
const SPANISH_DAYS: Record<string, number> = {
  'domingo': 0, 'dom': 0,
  'lunes': 1, 'lun': 1,
  'martes': 2, 'mar': 2,
  'miércoles': 3, 'mié': 3, 'mier': 3,
  'jueves': 4, 'jue': 4,
  'viernes': 5, 'vie': 5,
  'sábado': 6, 'sáb': 6, 'sab': 6
};

/**
 * Patrones de fecha comunes en español
 */
const DATE_PATTERNS = [
  // 15 de diciembre, 15 de diciembre de 2024
  /(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?/gi,
  // 15/12/2024, 15-12-2024
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
  // 2024-12-15 (ISO format)
  /(\d{4})-(\d{1,2})-(\d{1,2})/g,
  // Diciembre 15, 2024
  /(\w+)\s+(\d{1,2}),?\s+(\d{4})/gi,
  // Viernes 15
  /(\w+)\s+(\d{1,2})/gi
];

/**
 * Patrones de hora comunes
 */
const TIME_PATTERNS = [
  // 8:30 PM, 20:30, 8.30 pm
  /(\d{1,2})[:\.](\d{2})\s*(am|pm|AM|PM)?/g,
  // 8 PM, 20h
  /(\d{1,2})\s*(am|pm|AM|PM|h)/g,
  // "a las 8", "desde las 19"
  /(?:a las|desde las|hasta las)\s+(\d{1,2})[:\.]?(\d{2})?\s*(am|pm|AM|PM)?/gi
];

/**
 * Normaliza texto de fecha en español a ISO 8601
 */
export function normalizeDateText(text: string, _timezone: string = 'UTC'): {
  date?: string;
  confidence: number;
  originalText: string;
} {
  const originalText = text.trim();
  let confidence = 0;
  let bestDate: Date | null = null;
  
  // Limpiar el texto
  const cleanText = text
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .trim();
  
  // Intentar diferentes patrones
  for (const pattern of DATE_PATTERNS) {
    const matches = [...cleanText.matchAll(pattern)];
    
    for (const match of matches) {
      let date: Date | null = null;
      let currentConfidence = 0;
      
      if (pattern === DATE_PATTERNS[0]) {
        // Patrón: "15 de diciembre de 2024"
        const day = parseInt(match[1]);
        const monthName = match[2];
        const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        
        const month = SPANISH_MONTHS[monthName];
        if (month !== undefined && day >= 1 && day <= 31) {
          date = new Date(year, month, day);
          currentConfidence = match[3] ? 0.9 : 0.7; // Mayor confianza si incluye año
        }
      } else if (pattern === DATE_PATTERNS[1]) {
        // Patrón: "15/12/2024"
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // Mes base 0
        const year = parseInt(match[3]);
        
        if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
          date = new Date(year, month, day);
          currentConfidence = 0.8;
        }
      } else if (pattern === DATE_PATTERNS[2]) {
        // Patrón ISO: "2024-12-15"
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        
        if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
          date = new Date(year, month, day);
          currentConfidence = 0.95; // Muy alta confianza para formato ISO
        }
      } else if (pattern === DATE_PATTERNS[3]) {
        // Patrón: "Diciembre 15, 2024"
        const monthName = match[1];
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        
        const month = SPANISH_MONTHS[monthName];
        if (month !== undefined && day >= 1 && day <= 31) {
          date = new Date(year, month, day);
          currentConfidence = 0.8;
        }
      } else if (pattern === DATE_PATTERNS[4]) {
        // Patrón: "Viernes 15" (día de la semana)
        const dayName = match[1];
        const day = parseInt(match[2]);
        
        if (SPANISH_DAYS[dayName] !== undefined && day >= 1 && day <= 31) {
          // Buscar el próximo viernes 15, por ejemplo
          const today = new Date();
          const targetDay = SPANISH_DAYS[dayName];
          
          // Buscar en los próximos 2 meses
          for (let i = 0; i < 60; i++) {
            const testDate = new Date(today);
            testDate.setDate(today.getDate() + i);
            
            if (testDate.getDay() === targetDay && testDate.getDate() === day) {
              date = testDate;
              currentConfidence = 0.6; // Menor confianza por ambigüedad
              break;
            }
          }
        }
      }
      
      // Actualizar la mejor fecha si esta tiene mayor confianza
      if (date && currentConfidence > confidence) {
        bestDate = date;
        confidence = currentConfidence;
      }
    }
  }
  
  return {
    date: bestDate ? bestDate.toISOString().split('T')[0] : undefined,
    confidence,
    originalText
  };
}

/**
 * Normaliza texto de hora a formato HH:MM
 */
export function normalizeTimeText(text: string): {
  time?: string;
  confidence: number;
  originalText: string;
} {
  const originalText = text.trim();
  let confidence = 0;
  let bestTime: string | null = null;
  
  const cleanText = text.toLowerCase().replace(/[.,!?]/g, '').trim();
  
  for (const pattern of TIME_PATTERNS) {
    const matches = [...cleanText.matchAll(pattern)];
    
    for (const match of matches) {
      let hours: number | null = null;
      let minutes = 0;
      let currentConfidence = 0;
      
      if (pattern === TIME_PATTERNS[0]) {
        // Patrón: "8:30 PM"
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        const period = match[3]?.toLowerCase();
        
        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        currentConfidence = 0.9;
      } else if (pattern === TIME_PATTERNS[1]) {
        // Patrón: "8 PM"
        hours = parseInt(match[1]);
        const period = match[2]?.toLowerCase();
        
        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        if (period === 'h') currentConfidence = 0.7; // Formato europeo
        else currentConfidence = 0.8;
      } else if (pattern === TIME_PATTERNS[2]) {
        // Patrón: "a las 8:30"
        hours = parseInt(match[1]);
        minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3]?.toLowerCase();
        
        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        currentConfidence = 0.8;
      }
      
      // Validar hora
      if (hours !== null && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        if (currentConfidence > confidence) {
          bestTime = timeString;
          confidence = currentConfidence;
        }
      }
    }
  }
  
  return {
    time: bestTime || undefined,
    confidence,
    originalText
  };
}

/**
 * Combina fecha y hora en un objeto EventDateTime
 */
export function createEventDateTime(
  dateText?: string,
  timeText?: string,
  timezone: string = 'UTC',
  allDay: boolean = false
): EventDateTime | null {
  const dateResult = dateText ? normalizeDateText(dateText, timezone) : null;
  const timeResult = timeText ? normalizeTimeText(timeText) : null;
  
  if (!dateResult?.date) return null;
  
  const startDate = new Date(dateResult.date);
  
  if (timeResult?.time && !allDay) {
    const [hours, minutes] = timeResult.time.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }
  
  return {
    startDate: startDate.toISOString(),
    startTime: timeResult?.time,
    timezone,
    allDay,
    endDate: undefined,
    endTime: undefined
  };
}

// ===========================================
// NORMALIZACIÓN DE UBICACIONES
// ===========================================

/**
 * Patrones comunes para ubicaciones
 */
const LOCATION_PATTERNS = [
  // "en el Teatro Nacional"
  /(?:en el|en la|en)\s+(.+?)(?:\.|,|!|$)/gi,
  // "ubicado en Centro de Lima"  
  /(?:ubicado en|localizado en)\s+(.+?)(?:\.|,|!|$)/gi,
  // "@ Lugar"
  /@\s*(.+?)(?:\.|,|!|$)/gi,
  // "📍 Dirección"
  /📍\s*(.+?)(?:\.|,|!|$)/gi
];

/**
 * Normaliza texto de ubicación
 */
export function normalizeLocationText(text: string): {
  location?: Partial<Location>;
  confidence: number;
  originalText: string;
} {
  const originalText = text.trim();
  let confidence = 0;
  let bestLocation: Partial<Location> | null = null;
  
  const cleanText = text.replace(/[🎵🎸🎤🎭🏟️🏛️]/g, '').trim();
  
  for (const pattern of LOCATION_PATTERNS) {
    const matches = [...cleanText.matchAll(pattern)];
    
    for (const match of matches) {
      const locationName = match[1].trim();
      
      if (locationName.length >= 3) {
        const location: Partial<Location> = {
          name: locationName
        };
        
        // Intentar extraer ciudad si hay comas
        const parts = locationName.split(',');
        if (parts.length >= 2) {
          location.name = parts[0].trim();
          location.city = parts[1].trim();
          
          if (parts.length >= 3) {
            location.country = parts[2].trim();
          }
        }
        
        const currentConfidence = pattern === LOCATION_PATTERNS[3] ? 0.9 : 0.7;
        
        if (currentConfidence > confidence) {
          bestLocation = location;
          confidence = currentConfidence;
        }
      }
    }
  }
  
  return {
    location: bestLocation || undefined,
    confidence,
    originalText
  };
}

// ===========================================
// NORMALIZACIÓN DE PRECIOS
// ===========================================

/**
 * Patrones de precios comunes
 */
const PRICE_PATTERNS = [
  // $50, $50.00, USD 50
  /(?:[$]|USD|EUR|€)\s*(\d+(?:\.\d{2})?)/gi,
  // 50 soles, 50 pesos
  /(\d+(?:\.\d{2})?)\s*(soles?|pesos?|euros?|dólares?)/gi,
  // Gratis, Free
  /(?:gratis|free|gratuito|sin costo)/gi
];

/**
 * Normaliza texto de precio
 */
export function normalizePriceText(text: string): {
  price?: Partial<Price>;
  confidence: number;
  originalText: string;
} {
  const originalText = text.trim();
  let confidence = 0;
  let bestPrice: Partial<Price> | null = null;
  
  const cleanText = text.toLowerCase().replace(/[.,!?]/g, '').trim();
  
  // Verificar si es gratis
  if (PRICE_PATTERNS[2].test(cleanText)) {
    return {
      price: {
        amount: 0,
        currency: 'USD',
        tier: 'free'
      },
      confidence: 0.9,
      originalText
    };
  }
  
  // Buscar precios numéricos
  for (let i = 0; i < 2; i++) {
    const pattern = PRICE_PATTERNS[i];
    const matches = [...cleanText.matchAll(pattern)];
    
    for (const match of matches) {
      let amount: number;
      let currency = 'USD';
      
      if (i === 0) {
        // Patrón: $50, USD 50
        amount = parseFloat(match[1]);
        if (text.includes('€') || text.toLowerCase().includes('eur')) {
          currency = 'EUR';
        }
      } else {
        // Patrón: 50 soles
        amount = parseFloat(match[1]);
        const currencyText = match[2].toLowerCase();
        
        if (currencyText.includes('sol')) currency = 'PEN';
        else if (currencyText.includes('peso')) currency = 'MXN';
        else if (currencyText.includes('euro')) currency = 'EUR';
      }
      
      if (amount > 0) {
        const price: Partial<Price> = {
          amount,
          currency,
          tier: 'paid'
        };
        
        const currentConfidence = i === 0 ? 0.8 : 0.7;
        
        if (currentConfidence > confidence) {
          bestPrice = price;
          confidence = currentConfidence;
        }
      }
    }
  }
  
  return {
    price: bestPrice || undefined,
    confidence,
    originalText
  };
}

// ===========================================
// NORMALIZACIÓN DE CATEGORÍAS Y TIPOS
// ===========================================

/**
 * Mapeo de palabras clave a tipos de eventos
 */
const EVENT_TYPE_KEYWORDS: Record<string, EventType> = {
  // Música
  'concierto': EventType.CONCERT,
  'festival': EventType.FESTIVAL,
  'música': EventType.CONCERT,
  'band': EventType.CONCERT,
  'dj': EventType.CONCERT,
  'karaoke': EventType.CONCERT,
  
  // Conferencias y educación
  'conferencia': EventType.CONFERENCE,
  'seminario': EventType.CONFERENCE,
  'webinar': EventType.WEBINAR,
  'workshop': EventType.WORKSHOP,
  'taller': EventType.WORKSHOP,
  'curso': EventType.WORKSHOP,
  
  // Social
  'fiesta': EventType.PARTY,
  'party': EventType.PARTY,
  'celebración': EventType.PARTY,
  'networking': EventType.NETWORKING,
  'meetup': EventType.MEETUP,
  
  // Arte y cultura
  'exposición': EventType.EXHIBITION,
  'galería': EventType.EXHIBITION,
  'museo': EventType.EXHIBITION,
  'arte': EventType.EXHIBITION,
  
  // Deportes
  'deporte': EventType.SPORTS,
  'partido': EventType.SPORTS,
  'competencia': EventType.SPORTS,
  'torneo': EventType.SPORTS
};

/**
 * Mapeo de palabras clave a categorías
 */
const EVENT_CATEGORY_KEYWORDS: Record<string, EventCategory> = {
  // Música
  'música': EventCategory.MUSIC,
  'concierto': EventCategory.MUSIC,
  'festival': EventCategory.MUSIC,
  'dj': EventCategory.MUSIC,
  
  // Tecnología
  'tech': EventCategory.TECHNOLOGY,
  'tecnología': EventCategory.TECHNOLOGY,
  'startup': EventCategory.TECHNOLOGY,
  'software': EventCategory.TECHNOLOGY,
  
  // Negocios
  'business': EventCategory.BUSINESS,
  'negocios': EventCategory.BUSINESS,
  'emprendimiento': EventCategory.BUSINESS,
  'networking': EventCategory.BUSINESS,
  
  // Arte y cultura
  'arte': EventCategory.ART_CULTURE,
  'cultura': EventCategory.ART_CULTURE,
  'exposición': EventCategory.ART_CULTURE,
  'teatro': EventCategory.ART_CULTURE,
  
  // Deportes
  'deporte': EventCategory.SPORTS_FITNESS,
  'fitness': EventCategory.SPORTS_FITNESS,
  'gym': EventCategory.SPORTS_FITNESS,
  'ejercicio': EventCategory.SPORTS_FITNESS,
  
  // Comida y bebida
  'comida': EventCategory.FOOD_DRINK,
  'restaurante': EventCategory.FOOD_DRINK,
  'gastronomy': EventCategory.FOOD_DRINK,
  'wine': EventCategory.FOOD_DRINK,
  
  // Educación
  'educación': EventCategory.EDUCATION,
  'curso': EventCategory.EDUCATION,
  'taller': EventCategory.EDUCATION,
  'seminario': EventCategory.EDUCATION
};

/**
 * Normaliza texto para inferir tipo de evento
 */
export function normalizeEventType(text: string): {
  type?: EventType;
  confidence: number;
  originalText: string;
} {
  const originalText = text.trim();
  const cleanText = text.toLowerCase().replace(/[.,!?]/g, '');
  
  let bestType: EventType | null = null;
  let confidence = 0;
  
  for (const [keyword, type] of Object.entries(EVENT_TYPE_KEYWORDS)) {
    if (cleanText.includes(keyword)) {
      const keywordConfidence = keyword.length / cleanText.length * 0.8;
      
      if (keywordConfidence > confidence) {
        bestType = type;
        confidence = Math.min(keywordConfidence, 0.8);
      }
    }
  }
  
  return {
    type: bestType || undefined,
    confidence,
    originalText
  };
}

/**
 * Normaliza texto para inferir categoría de evento
 */
export function normalizeEventCategory(text: string): {
  category?: EventCategory;
  confidence: number;
  originalText: string;
} {
  const originalText = text.trim();
  const cleanText = text.toLowerCase().replace(/[.,!?]/g, '');
  
  let bestCategory: EventCategory | null = null;
  let confidence = 0;
  
  for (const [keyword, category] of Object.entries(EVENT_CATEGORY_KEYWORDS)) {
    if (cleanText.includes(keyword)) {
      const keywordConfidence = keyword.length / cleanText.length * 0.7;
      
      if (keywordConfidence > confidence) {
        bestCategory = category;
        confidence = Math.min(keywordConfidence, 0.7);
      }
    }
  }
  
  return {
    category: bestCategory || undefined,
    confidence,
    originalText
  };
}

// ===========================================
// UTILIDADES GENERALES
// ===========================================

/**
 * Normaliza hashtags removiendo caracteres especiales
 */
export function normalizeHashtags(hashtags: string[]): string[] {
  return hashtags
    .map(tag => tag.replace(/^#/, '').toLowerCase().trim())
    .filter(tag => tag.length > 0)
    .filter((tag, index, array) => array.indexOf(tag) === index); // Remover duplicados
}

/**
 * Normaliza menciones removiendo el símbolo @
 */
export function normalizeMentions(mentions: string[]): string[] {
  return mentions
    .map(mention => mention.replace(/^@/, '').toLowerCase().trim())
    .filter(mention => mention.length > 0)
    .filter((mention, index, array) => array.indexOf(mention) === index);
}

/**
 * Limpia y normaliza texto general
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Caracteres de espacio cero
    .normalize('NFD') // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, ''); // Remover diacríticos si es necesario
}

/**
 * Genera un slug URL-friendly desde un título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
} 