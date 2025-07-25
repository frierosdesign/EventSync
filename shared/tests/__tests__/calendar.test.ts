import { describe, expect, test } from '@jest/globals';
import {
  formatDateForGoogleCalendar,
  calculateEndDate,
  encodeForUrl,
  sanitizeTitle,
  formatDescription,
  generateGoogleCalendarUrl,
  generateGoogleCalendarUrlFromEvent,
  generateGoogleCalendarUrlFromExtractedData,
  validateEventForExport,
  GoogleCalendarEventData,
  CalendarExportOptions
} from '../calendar';
import {
  Event,
  ExtractedData,
  EventType,
  EventCategory,
  EventStatus,
  InstagramContentType,
  ExtractionConfidence
} from '../types/models';

// ===========================================
// DATOS DE PRUEBA
// ===========================================

const mockExtractedData: ExtractedData = {
  title: 'Concierto de Rock en el Parque',
  description: 'Un increíble concierto con las mejores bandas locales. ¡No te lo pierdas! 🎸🎵',
  dateTime: {
    startDate: '2024-03-15',
    startTime: '20:00',
    endDate: '2024-03-15',
    endTime: '23:00',
    timezone: 'Europe/Madrid',
    allDay: false
  },
  location: {
    name: 'Parque Central',
    address: 'Calle Principal 123',
    city: 'Madrid',
    country: 'España'
  },
  organizer: {
    name: 'Music Events Co.',
    instagramHandle: 'musicevents',
    email: 'info@musicevents.com'
  },
  price: {
    amount: 25,
    currency: 'EUR',
    tier: 'paid',
    description: 'Incluye bebida gratuita'
  },
  social: {
    hashtags: ['rock', 'concierto', 'madrid'],
    mentions: ['bandaejemplo']
  },
  metadata: {
    extractedAt: '2024-01-20T10:00:00Z',
    processingTime: 1500,
    instagramPostId: 'ABC123',
    contentType: InstagramContentType.POST,
    confidence: 0.92,
    confidenceLevel: ExtractionConfidence.HIGH,
    extractorVersion: '1.0.0',
    errors: [],
    warnings: []
  },
  rawContent: 'Texto original del post...',
  originalUrl: 'https://www.instagram.com/p/ABC123/',
  tags: ['música', 'evento']
};

const mockEvent: Event = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  slug: 'concierto-rock-parque-2024',
  title: 'Concierto de Rock en el Parque',
  description: 'Un increíble concierto con las mejores bandas locales.',
  dateTime: {
    startDate: '2024-03-15',
    startTime: '20:00',
    endDate: '2024-03-15',
    endTime: '23:00',
    timezone: 'Europe/Madrid',
    allDay: false
  },
  location: {
    name: 'Parque Central',
    address: 'Calle Principal 123',
    city: 'Madrid',
    country: 'España'
  },
  type: EventType.MUSIC,
  category: EventCategory.ENTERTAINMENT,
  status: EventStatus.PUBLISHED,
  extractedData: mockExtractedData,
  urls: {
    instagram: 'https://www.instagram.com/p/ABC123/'
  },
  isPublic: true,
  isFeatured: false,
  createdAt: '2024-01-20T10:00:00Z',
  updatedAt: '2024-01-20T10:00:00Z',
  tags: []
};

// ===========================================
// TESTS DE FORMATEO DE FECHAS
// ===========================================

describe('formatDateForGoogleCalendar', () => {
  test('debe formatear fecha para evento de todo el día', () => {
    const result = formatDateForGoogleCalendar('2024-03-15', undefined, 'Europe/Madrid', true);
    expect(result).toBe('20240315');
  });

  test('debe formatear fecha con hora específica', () => {
    const result = formatDateForGoogleCalendar('2024-03-15', '20:00', 'Europe/Madrid', false);
    // El resultado debe ser en formato YYYYMMDDTHHMMSSZ
    expect(result).toMatch(/^20240315T\d{6}Z$/);
  });

  test('debe manejar fechas inválidas con fallback', () => {
    const result = formatDateForGoogleCalendar('fecha-inválida', undefined, 'Europe/Madrid', false);
    // Debe devolver algún formato válido (fecha actual como fallback)
    expect(result).toMatch(/^\d{8}T\d{6}Z$/);
  });

  test('debe formatear correctamente fecha ISO completa', () => {
    const result = formatDateForGoogleCalendar('2024-03-15T20:00:00Z', undefined, 'Europe/Madrid', false);
    expect(result).toBe('20240315T200000Z');
  });
});

describe('calculateEndDate', () => {
  test('debe usar endDate si está especificada', () => {
    const result = calculateEndDate('2024-03-15', '20:00', '2024-03-16', '02:00', false);
    expect(result).toBe('2024-03-16');
  });

  test('debe calcular endDate para evento de todo el día', () => {
    const result = calculateEndDate('2024-03-15', undefined, undefined, undefined, true);
    expect(result).toBe('2024-03-15');
  });

  test('debe agregar 2 horas por defecto para eventos con hora', () => {
    const result = calculateEndDate('2024-03-15', '20:00', undefined, undefined, false);
    expect(result).toBe('2024-03-15'); // Misma fecha, pero 2 horas después
  });

  test('debe agregar 1 día para eventos sin hora específica', () => {
    const result = calculateEndDate('2024-03-15', undefined, undefined, undefined, false);
    expect(result).toBe('2024-03-16');
  });
});

// ===========================================
// TESTS DE CODIFICACIÓN
// ===========================================

describe('encodeForUrl', () => {
  test('debe codificar caracteres especiales', () => {
    const result = encodeForUrl('Concierto & Fiesta!');
    expect(result).toBe('Concierto+%26+Fiesta%21');
  });

  test('debe manejar emojis correctamente', () => {
    const result = encodeForUrl('Concierto 🎸🎵');
    expect(result).toContain('%F0%9F%8E%B8'); // Emoji de guitarra codificado
  });

  test('debe convertir espacios en plus', () => {
    const result = encodeForUrl('Evento de música');
    expect(result).toBe('Evento+de+m%C3%BAsica');
  });
});

describe('sanitizeTitle', () => {
  test('debe limpiar títulos con saltos de línea', () => {
    const result = sanitizeTitle('Título\ncon\nsaltos\nde\nlínea');
    expect(result).toBe('Título con saltos de línea');
  });

  test('debe truncar títulos muy largos', () => {
    const longTitle = 'A'.repeat(150);
    const result = sanitizeTitle(longTitle);
    expect(result.length).toBe(100);
  });

  test('debe limpiar espacios múltiples', () => {
    const result = sanitizeTitle('Título   con    espacios   múltiples');
    expect(result).toBe('Título con espacios múltiples');
  });
});

// ===========================================
// TESTS DE DESCRIPCIÓN
// ===========================================

describe('formatDescription', () => {
  test('debe incluir información básica del evento', () => {
    const options: CalendarExportOptions = {
      includeInstagramUrl: true,
      includeHashtags: true
    };
    
    const result = formatDescription(mockExtractedData, options);
    
    expect(result).toContain(mockExtractedData.description);
    expect(result).toContain('Organizador: Music Events Co.');
    expect(result).toContain('Precio: 25 EUR');
    expect(result).toContain('#rock #concierto #madrid');
    expect(result).toContain('Ver en Instagram');
  });

  test('debe manejar eventos gratuitos', () => {
    const freeEvent = {
      ...mockExtractedData,
      price: {
        amount: 0,
        currency: 'EUR',
        tier: 'free' as const
      }
    };

    const result = formatDescription(freeEvent);
    expect(result).toContain('Entrada gratuita');
  });

  test('debe excluir información opcional cuando no se solicita', () => {
    const options: CalendarExportOptions = {
      includeInstagramUrl: false,
      includeHashtags: false,
      includeExtractedMetadata: false
    };

    const result = formatDescription(mockExtractedData, options);
    
    expect(result).not.toContain('#rock');
    expect(result).not.toContain('Ver en Instagram');
    expect(result).not.toContain('Extraído con EventSync');
  });
});

// ===========================================
// TESTS DE GENERACIÓN DE URL
// ===========================================

describe('generateGoogleCalendarUrl', () => {
  test('debe generar URL válida con datos mínimos', () => {
    const eventData: GoogleCalendarEventData = {
      title: 'Evento de Prueba',
      startDate: '2024-03-15',
      isAllDay: true
    };

    const url = generateGoogleCalendarUrl(eventData);
    
    expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
    expect(url).toContain('text=Evento+de+Prueba');
    expect(url).toContain('dates=20240315/20240315');
  });

  test('debe incluir todos los parámetros cuando están disponibles', () => {
    const eventData: GoogleCalendarEventData = {
      title: 'Concierto Completo',
      description: 'Descripción del evento',
      startDate: '2024-03-15T20:00:00Z',
      endDate: '2024-03-15T23:00:00Z',
      location: 'Parque Central, Madrid',
      timezone: 'Europe/Madrid',
      isAllDay: false
    };

    const url = generateGoogleCalendarUrl(eventData);
    
    expect(url).toContain('text=');
    expect(url).toContain('dates=');
    expect(url).toContain('details=');
    expect(url).toContain('location=');
    expect(url).toContain('ctz=Europe/Madrid');
  });

  test('debe manejar eventos de todo el día correctamente', () => {
    const eventData: GoogleCalendarEventData = {
      title: 'Evento Todo el Día',
      startDate: '2024-03-15',
      isAllDay: true
    };

    const url = generateGoogleCalendarUrl(eventData);
    
    // No debe incluir zona horaria para eventos de todo el día
    expect(url).not.toContain('ctz=');
    // Las fechas deben estar en formato YYYYMMDD
    expect(url).toContain('dates=20240315/20240315');
  });
});

describe('generateGoogleCalendarUrlFromEvent', () => {
  test('debe generar URL desde Event completo', () => {
    const options: CalendarExportOptions = {
      includeInstagramUrl: true,
      includeHashtags: false
    };

    const url = generateGoogleCalendarUrlFromEvent(mockEvent, options);
    
    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('text=Concierto+de+Rock+en+el+Parque');
    expect(url).toContain('location=Parque+Central%2C+Calle+Principal+123%2C+Madrid%2C+Espa%C3%B1a');
  });

  test('debe manejar Event sin ubicación', () => {
    const eventWithoutLocation = {
      ...mockEvent,
      location: undefined
    };

    const url = generateGoogleCalendarUrlFromEvent(eventWithoutLocation);
    
    expect(url).not.toContain('location=');
    expect(url).toContain('text=');
  });
});

describe('generateGoogleCalendarUrlFromExtractedData', () => {
  test('debe generar URL desde ExtractedData', () => {
    const url = generateGoogleCalendarUrlFromExtractedData(mockExtractedData);
    
    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('text=Concierto+de+Rock+en+el+Parque');
  });

  test('debe incluir metadatos cuando se solicite', () => {
    const options: CalendarExportOptions = {
      includeExtractedMetadata: true
    };

    const url = generateGoogleCalendarUrlFromExtractedData(mockExtractedData, options);
    
    expect(url).toContain('details=');
    // La descripción codificada debe contener información de extracción
    const decodedUrl = decodeURIComponent(url);
    expect(decodedUrl).toContain('Extraído con EventSync');
    expect(decodedUrl).toContain('Confianza: 92%');
  });
});

// ===========================================
// TESTS DE VALIDACIÓN
// ===========================================

describe('validateEventForExport', () => {
  test('debe validar evento completo como válido', () => {
    const validation = validateEventForExport(mockEvent);
    
    expect(validation.isValid).toBe(true);
    expect(validation.missingFields).toHaveLength(0);
  });

  test('debe detectar campos requeridos faltantes', () => {
    const incompleteEvent = {
      ...mockEvent,
      title: '',
      dateTime: {
        ...mockEvent.dateTime,
        startDate: ''
      }
    };

    const validation = validateEventForExport(incompleteEvent);
    
    expect(validation.isValid).toBe(false);
    expect(validation.missingFields).toContain('title');
    expect(validation.missingFields).toContain('startDate');
  });

  test('debe generar advertencias para campos recomendados', () => {
    const eventWithWarnings = {
      ...mockEvent,
      description: undefined,
      location: undefined,
      dateTime: {
        ...mockEvent.dateTime,
        startTime: undefined,
        allDay: false
      }
    };

    const validation = validateEventForExport(eventWithWarnings);
    
    expect(validation.isValid).toBe(true); // Sigue siendo válido
    expect(validation.warnings).toContain('description');
    expect(validation.warnings).toContain('location');
    expect(validation.warnings).toContain('startTime (se asumirá evento de todo el día)');
  });

  test('debe detectar fecha inválida', () => {
    const eventWithInvalidDate = {
      ...mockEvent,
      dateTime: {
        ...mockEvent.dateTime,
        startDate: 'fecha-inválida'
      }
    };

    const validation = validateEventForExport(eventWithInvalidDate);
    
    expect(validation.isValid).toBe(false);
    expect(validation.missingFields).toContain('startDate (formato inválido)');
  });
});

// ===========================================
// TESTS DE INTEGRACIÓN
// ===========================================

describe('Integración completa', () => {
  test('debe generar URL válida de extremo a extremo', () => {
    const url = generateGoogleCalendarUrlFromEvent(mockEvent, {
      timezone: 'Europe/Madrid',
      includeInstagramUrl: true,
      includeHashtags: true,
      includeExtractedMetadata: false
    });

    // Verificar que es una URL válida
    expect(() => new URL(url)).not.toThrow();
    
    // Verificar componentes principales
    const parsedUrl = new URL(url);
    expect(parsedUrl.hostname).toBe('calendar.google.com');
    expect(parsedUrl.pathname).toBe('/calendar/render');
    expect(parsedUrl.searchParams.get('action')).toBe('TEMPLATE');
    expect(parsedUrl.searchParams.get('text')).toBeTruthy();
    expect(parsedUrl.searchParams.get('dates')).toBeTruthy();
  });

  test('debe manejar casos edge de fechas y horarios', () => {
    const eventWithEdgeCases = {
      ...mockEvent,
      dateTime: {
        startDate: '2024-12-31T23:59:59Z',
        startTime: '23:59',
        endDate: '2025-01-01T02:00:00Z',
        endTime: '02:00',
        timezone: 'Europe/Madrid',
        allDay: false
      }
    };

    const url = generateGoogleCalendarUrlFromEvent(eventWithEdgeCases);
    
    expect(() => new URL(url)).not.toThrow();
    expect(url).toContain('dates=');
  });

  test('debe manejar caracteres especiales en todos los campos', () => {
    const eventWithSpecialChars = {
      ...mockEvent,
      title: 'Evento "Especial" & Único! 🎉',
      description: 'Descripción con acentos: niño, piñata, corazón ❤️',
      location: {
        name: 'Café "El Rincón" & Bar',
        address: 'C/ José María #123',
        city: 'Niño-Ciudad',
        country: 'España'
      }
    };

    const url = generateGoogleCalendarUrlFromEvent(eventWithSpecialChars);
    
    expect(() => new URL(url)).not.toThrow();
    
    // Verificar que los caracteres especiales están correctamente codificados
    expect(url).toContain('text=');
    expect(url).toContain('details=');
    expect(url).toContain('location=');
  });
}); 