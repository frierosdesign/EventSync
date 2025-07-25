import { Event, ExtractedData } from '../types/models';

// ===========================================
// TIPOS Y INTERFACES
// ===========================================

export interface GoogleCalendarEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  timezone?: string;
  isAllDay?: boolean;
}

export interface CalendarExportOptions {
  timezone?: string;
  includeInstagramUrl?: boolean;
  includeHashtags?: boolean;
  includeExtractedMetadata?: boolean;
}

// ===========================================
// CONSTANTES
// ===========================================

const DEFAULT_TIMEZONE = 'Europe/Madrid';
const GOOGLE_CALENDAR_BASE_URL = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

// ===========================================
// FUNCIONES DE FORMATEO DE FECHAS
// ===========================================

/**
 * Convierte una fecha ISO 8601 al formato requerido por Google Calendar
 * Para eventos de todo el día: YYYYMMDD
 * Para eventos con hora específica: YYYYMMDDTHHMMSSZ (UTC) o YYYYMMDDTHHMMSS (local)
 */
export function formatDateForGoogleCalendar(
  dateString: string, 
  timeString?: string, 
  timezone: string = DEFAULT_TIMEZONE,
  isAllDay: boolean = false
): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}`);
    }

    // Para eventos de todo el día, usar formato YYYYMMDD
    if (isAllDay) {
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    }

    // Si hay hora específica, combinar fecha y hora
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }

    // Convertir a UTC y formatear para Google Calendar
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  } catch (error) {
    console.error('Error formatting date for Google Calendar:', error);
    // Fallback: usar fecha actual
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
}

/**
 * Calcula la fecha de fin si no está especificada
 * Por defecto, asume 2 horas de duración para eventos con hora
 * Para eventos de todo el día, usa la misma fecha
 */
export function calculateEndDate(
  startDate: string,
  startTime?: string,
  endDate?: string,
  endTime?: string,
  isAllDay: boolean = false
): string {
  if (endDate) {
    return endDate;
  }

  const start = new Date(startDate);
  
  if (isAllDay) {
    // Para eventos de todo el día, la fecha de fin es la misma
    return startDate;
  }

  // Si hay hora específica, agregar 2 horas por defecto
  if (startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    start.setHours(hours, minutes, 0, 0);
    start.setHours(start.getHours() + 2); // Duración por defecto: 2 horas
  } else {
    // Sin hora específica, agregar 1 día
    start.setDate(start.getDate() + 1);
  }

  return start.toISOString().split('T')[0];
}

// ===========================================
// FUNCIONES DE CODIFICACIÓN
// ===========================================

/**
 * Codifica texto para URLs, manejando caracteres especiales y emojis
 */
export function encodeForUrl(text: string): string {
  return encodeURIComponent(text)
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
}

/**
 * Limpia y formatea texto para el título del evento
 */
export function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 100); // Google Calendar tiene límite de caracteres
}

/**
 * Formatea la descripción del evento, incluyendo información adicional
 */
export function formatDescription(
  event: Event | ExtractedData,
  options: CalendarExportOptions = {}
): string {
  const parts: string[] = [];

  // Descripción principal
  if (event.description) {
    parts.push(event.description);
  }

  // Información del organizador
  if (event.organizer?.name) {
    parts.push(`\nOrganizador: ${event.organizer.name}`);
    if (event.organizer.instagramHandle) {
      parts.push(`Instagram: @${event.organizer.instagramHandle}`);
    }
  }

  // Información de precio
  if (event.price) {
    const priceText = event.price.tier === 'free' 
      ? 'Entrada gratuita'
      : `Precio: ${event.price.amount} ${event.price.currency}`;
    parts.push(`\n${priceText}`);
    
    if (event.price.description) {
      parts.push(event.price.description);
    }
  }

  // Hashtags (si se solicita)
  if (options.includeHashtags && event.social?.hashtags?.length) {
    parts.push(`\nHashtags: ${event.social.hashtags.map(tag => `#${tag}`).join(' ')}`);
  }

  // URL de Instagram (si se solicita)
  if (options.includeInstagramUrl) {
    const instagramUrl = 'originalUrl' in event 
      ? event.originalUrl 
      : ('urls' in event && event.urls?.instagram);
    
    if (instagramUrl) {
      parts.push(`\nVer en Instagram: ${instagramUrl}`);
    }
  }

  // Metadatos de extracción (si se solicita y es debug)
  if (options.includeExtractedMetadata && 'metadata' in event) {
    const metadata = event.metadata;
    parts.push(`\n---\nExtraído con EventSync`);
    parts.push(`Confianza: ${Math.round(metadata.confidence * 100)}%`);
    parts.push(`Fecha de extracción: ${new Date(metadata.extractedAt).toLocaleString('es-ES')}`);
  }

  return parts.join('\n').trim();
}

// ===========================================
// FUNCIÓN PRINCIPAL DE GENERACIÓN DE URL
// ===========================================

/**
 * Genera una URL completa para agregar un evento a Google Calendar
 */
export function generateGoogleCalendarUrl(
  eventData: GoogleCalendarEventData,
  options: CalendarExportOptions = {}
): string {
  const params = new URLSearchParams();

  // Título del evento (requerido)
  params.append('text', encodeForUrl(sanitizeTitle(eventData.title)));

  // Fechas (requerido)
  const startDate = formatDateForGoogleCalendar(
    eventData.startDate,
    undefined, // La hora ya debería estar en el startDate si es necesario
    eventData.timezone || options.timezone || DEFAULT_TIMEZONE,
    eventData.isAllDay
  );

  const endDateString = eventData.endDate || calculateEndDate(
    eventData.startDate,
    undefined,
    eventData.endDate,
    undefined,
    eventData.isAllDay
  );

  const endDate = formatDateForGoogleCalendar(
    endDateString,
    undefined,
    eventData.timezone || options.timezone || DEFAULT_TIMEZONE,
    eventData.isAllDay
  );

  params.append('dates', `${startDate}/${endDate}`);

  // Descripción (opcional)
  if (eventData.description) {
    params.append('details', encodeForUrl(eventData.description));
  }

  // Ubicación (opcional)
  if (eventData.location) {
    params.append('location', encodeForUrl(eventData.location));
  }

  // Zona horaria (opcional, para eventos no de todo el día)
  if (!eventData.isAllDay && eventData.timezone) {
    params.append('ctz', eventData.timezone);
  }

  return `${GOOGLE_CALENDAR_BASE_URL}&${params.toString()}`;
}

// ===========================================
// FUNCIONES DE CONVENIENCIA PARA EVENTOS
// ===========================================

/**
 * Convierte un Event a datos para Google Calendar
 */
export function eventToGoogleCalendarData(
  event: Event,
  options: CalendarExportOptions = {}
): GoogleCalendarEventData {
  const dateTime = event.dateTime;
  
  // Construir fecha de inicio con hora si está disponible
  let startDate = dateTime.startDate;
  if (dateTime.startTime && !dateTime.allDay) {
    const date = new Date(dateTime.startDate);
    const [hours, minutes] = dateTime.startTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    startDate = date.toISOString();
  }

  // Construir fecha de fin
  let endDate = dateTime.endDate;
  if (dateTime.endTime && !dateTime.allDay && endDate) {
    const date = new Date(endDate);
    const [hours, minutes] = dateTime.endTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    endDate = date.toISOString();
  }

  // Construir ubicación
  let location: string | undefined;
  if (event.location) {
    const locationParts = [
      event.location.name,
      event.location.address,
      event.location.city,
      event.location.country
    ].filter(Boolean);
    location = locationParts.join(', ');
  }

  return {
    title: event.title,
    description: formatDescription(event, options),
    startDate,
    endDate,
    location,
    timezone: dateTime.timezone || DEFAULT_TIMEZONE,
    isAllDay: dateTime.allDay
  };
}

/**
 * Convierte ExtractedData a datos para Google Calendar
 */
export function extractedDataToGoogleCalendarData(
  extractedData: ExtractedData,
  options: CalendarExportOptions = {}
): GoogleCalendarEventData {
  const dateTime = extractedData.dateTime;
  
  // Construir fecha de inicio con hora si está disponible
  let startDate = dateTime.startDate;
  if (dateTime.startTime && !dateTime.allDay) {
    const date = new Date(dateTime.startDate);
    const [hours, minutes] = dateTime.startTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    startDate = date.toISOString();
  }

  // Construir fecha de fin
  let endDate = dateTime.endDate;
  if (dateTime.endTime && !dateTime.allDay && endDate) {
    const date = new Date(endDate);
    const [hours, minutes] = dateTime.endTime.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    endDate = date.toISOString();
  }

  // Construir ubicación
  let location: string | undefined;
  if (extractedData.location) {
    const locationParts = [
      extractedData.location.name,
      extractedData.location.address,
      extractedData.location.city,
      extractedData.location.country
    ].filter(Boolean);
    location = locationParts.join(', ');
  }

  return {
    title: extractedData.title,
    description: formatDescription(extractedData, options),
    startDate,
    endDate,
    location,
    timezone: dateTime.timezone || DEFAULT_TIMEZONE,
    isAllDay: dateTime.allDay
  };
}

/**
 * Genera URL de Google Calendar directamente desde un Event
 */
export function generateGoogleCalendarUrlFromEvent(
  event: Event,
  options: CalendarExportOptions = {}
): string {
  const calendarData = eventToGoogleCalendarData(event, options);
  return generateGoogleCalendarUrl(calendarData, options);
}

/**
 * Genera URL de Google Calendar directamente desde ExtractedData
 */
export function generateGoogleCalendarUrlFromExtractedData(
  extractedData: ExtractedData,
  options: CalendarExportOptions = {}
): string {
  const calendarData = extractedDataToGoogleCalendarData(extractedData, options);
  return generateGoogleCalendarUrl(calendarData, options);
}

// ===========================================
// VALIDACIONES
// ===========================================

/**
 * Valida que un evento tenga los datos mínimos requeridos para exportar
 */
export function validateEventForExport(event: Event | ExtractedData): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Campos requeridos
  if (!event.title || event.title.trim().length === 0) {
    missingFields.push('title');
  }

  if (!event.dateTime?.startDate) {
    missingFields.push('startDate');
  } else {
    // Validar formato de fecha
    const date = new Date(event.dateTime.startDate);
    if (isNaN(date.getTime())) {
      missingFields.push('startDate (formato inválido)');
    }
  }

  // Advertencias para campos opcionales pero recomendados
  if (!event.description) {
    warnings.push('description');
  }

  if (!event.location) {
    warnings.push('location');
  }

  if (!event.dateTime?.startTime && !event.dateTime?.allDay) {
    warnings.push('startTime (se asumirá evento de todo el día)');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
} 