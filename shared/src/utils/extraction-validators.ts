import {
  EventType,
  EventCategory,
  ExtractedData,
  ExtractionConfidence
} from '../types/models';
import { 
  CONFIDENCE_THRESHOLDS,
  TYPE_KEYWORDS,
  CATEGORY_KEYWORDS
} from '../constants/events';

// ===========================================
// INTERFACES DE VALIDACIÓN
// ===========================================

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  confidence: number;
  suggestions: string[];
}

export interface ExtractionQualityReport {
  overallScore: number;
  confidenceLevel: ExtractionConfidence;
  completeness: {
    hasTitle: boolean;
    hasDate: boolean;
    hasTime: boolean;
    hasLocation: boolean;
    hasDescription: boolean;
    hasPrice: boolean;
    hasMedia: boolean;
    score: number;
  };
  accuracy: {
    titleConfidence: number;
    dateConfidence: number;
    timeConfidence: number;
    locationConfidence: number;
    priceConfidence: number;
    typeConfidence: number;
    categoryConfidence: number;
    score: number;
  };
  consistency: {
    dateTimeConsistent: boolean;
    priceReasonable: boolean;
    locationRealistic: boolean;
    typeMatchesCategory: boolean;
    score: number;
  };
  recommendations: string[];
}

// ===========================================
// VALIDADORES DE CAMPOS ESPECÍFICOS
// ===========================================

/**
 * Valida el título del evento
 */
export function validateEventTitle(title: string): ValidationResult<string> {
  const result: ValidationResult<string> = {
    isValid: false,
    errors: [],
    warnings: [],
    confidence: 0,
    suggestions: []
  };

  if (!title || typeof title !== 'string') {
    result.errors.push('Title is required');
    return result;
  }

  const normalizedTitle = title; // No normalization needed for title

  // Validaciones básicas
  if (normalizedTitle.length < 3) {
    result.errors.push('Title is too short (minimum 3 characters)');
    return result;
  }

  if (normalizedTitle.length > 255) {
    result.errors.push('Title is too long (maximum 255 characters)');
    return result;
  }

  // Verificar que no sea solo emojis o caracteres especiales
  const textContent = normalizedTitle.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  
  if (textContent.length < 3) {
    result.errors.push('Title must contain actual text, not just emojis or symbols');
    return result;
  }

  // Calcular confianza basada en características
  let confidence = 0.5; // Base

  // Título tiene longitud apropiada
  if (normalizedTitle.length >= 10 && normalizedTitle.length <= 100) {
    confidence += 0.2;
  }

  // Título contiene palabras clave de eventos
  const eventKeywords = ['evento', 'concierto', 'festival', 'conferencia', 'taller', 'workshop', 'fiesta', 'party'];
  if (eventKeywords.some(keyword => normalizedTitle.toLowerCase().includes(keyword))) {
    confidence += 0.2;
  }

  // Título está capitalizado apropiadamente
  if (normalizedTitle[0] === normalizedTitle[0].toUpperCase()) {
    confidence += 0.1;
  }

  result.isValid = true;
  result.data = normalizedTitle;
  result.confidence = Math.min(confidence, 1);

  // Sugerencias
  if (normalizedTitle.length < 10) {
    result.suggestions.push('Consider a more descriptive title');
  }

  if (!eventKeywords.some(keyword => normalizedTitle.toLowerCase().includes(keyword))) {
    result.suggestions.push('Consider including event type keywords');
  }

  return result;
}

/**
 * Valida información de fecha y hora
 */
export function validateEventDateTime(
  dateText?: string,
  timeText?: string,
  timezone: string = 'UTC'
): ValidationResult<any> { // Changed to any as EventDateTime type is removed
  const result: ValidationResult<any> = {
    isValid: false,
    errors: [],
    warnings: [],
    confidence: 0,
    suggestions: []
  };

  if (!dateText) {
    result.errors.push('Date information is required');
    return result;
  }

  // Placeholder for date/time parsing logic
  // In a real scenario, you would use a library like date-fns or moment.js
  // For this example, we'll just check if it looks like a date/time
  const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/); // YYYY-MM-DD
  const timeMatch = timeText ? timeText.match(/(\d{2}:\d{2})/) : null; // HH:MM

  if (!dateMatch) {
    result.errors.push('Could not parse date from provided text');
    return result;
  }

  const date = dateMatch[1];
  const year = parseInt(date.substring(0, 4), 10);
  const month = parseInt(date.substring(5, 7), 10);
  const day = parseInt(date.substring(8, 10), 10);

  let dateObject: Date;
  try {
    dateObject = new Date(year, month - 1, day); // Month is 0-indexed
  } catch (e) {
    result.errors.push('Invalid date format');
    return result;
  }

  // Verificar que la fecha no esté muy en el pasado
  const now = new Date();
  const eventDate = new Date(dateObject);
  const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff < -30) {
    result.warnings.push('Event date is more than 30 days in the past');
  }

  if (daysDiff > 365 * 2) {
    result.warnings.push('Event date is more than 2 years in the future');
  }

  // Placeholder for confidence calculation
  let confidence = 0.6; // Base confidence
  if (dateMatch[1] === now.getFullYear().toString() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0')) {
    confidence += 0.1;
  }
  if (timeMatch && timeMatch[1] === now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')) {
    confidence += 0.1;
  }

  result.isValid = true;
  result.data = { date, time: timeText };
  result.confidence = Math.min(confidence, 1);

  // Sugerencias
  if (!timeMatch && timeText) {
    result.suggestions.push('Time information could not be parsed reliably');
  }

  if (daysDiff < 0) {
    result.suggestions.push('Verify that this is not a past event');
  }

  return result;
}

/**
 * Valida información de ubicación
 */
export function validateEventLocation(locationText?: string): ValidationResult<any> { // Changed to any as Location type is removed
  const result: ValidationResult<any> = {
    isValid: false,
    errors: [],
    warnings: [],
    confidence: 0,
    suggestions: []
  };

  if (!locationText) {
    result.warnings.push('No location information provided');
    result.isValid = true; // Location is optional
    result.confidence = 0;
    return result;
  }

  // Placeholder for location parsing logic
  // In a real scenario, you would use a library like geopy or a dedicated location parser
  // For this example, we'll just check if it looks like a city or address
  const locationMatch = locationText.match(/[A-Za-z\s]+,?\s*[A-Za-z\s]*/); // Simple regex for city or city, country

  if (!locationMatch) {
    result.warnings.push('Could not parse location from provided text');
    result.isValid = true; // Still valid even if unparseable
    result.confidence = 0;
    return result;
  }

  const location = locationMatch[0];

  // Validaciones básicas
  if (location.length < 3) {
    result.warnings.push('Location name seems too short');
  }

  if (location.length > 255) {
    result.errors.push('Location name is too long');
    return result;
  }

  result.isValid = true;
  result.data = { name: location };
  result.confidence = 0.7; // Confidence for location parsing

  // Sugerencias para mejorar la ubicación
  if (!location.includes(',') && !location.includes(' ')) {
    result.suggestions.push('Consider providing more specific location details (e.g., City, Country)');
  }

  return result;
}

/**
 * Valida información de precio
 */
export function validateEventPrice(priceText?: string): ValidationResult<any> { // Changed to any as Price type is removed
  const result: ValidationResult<any> = {
    isValid: false,
    errors: [],
    warnings: [],
    confidence: 0,
    suggestions: []
  };

  if (!priceText) {
    result.isValid = true; // Price is optional
    result.confidence = 0;
    return result;
  }

  // Placeholder for price parsing logic
  // In a real scenario, you would use a library like currency.js or a dedicated price parser
  // For this example, we'll just check if it looks like a number
  const priceMatch = priceText.match(/^\d+(\.\d{1,2})?$/); // Simple regex for numbers with optional decimals

  if (!priceMatch) {
    result.warnings.push('Could not parse price from provided text');
    result.isValid = true; // Still valid even if unparseable
    result.confidence = 0;
    return result;
  }

  const price = parseFloat(priceMatch[0]);

  // Validaciones de precio
  if (price < 0) {
    result.errors.push('Price cannot be negative');
    return result;
  }

  if (price > 10000) {
    result.warnings.push('Price seems unusually high');
  }

  result.isValid = true;
  result.data = { amount: price };
  result.confidence = 0.6; // Confidence for price parsing

  return result;
}

/**
 * Valida tipo y categoría del evento
 */
export function validateEventClassification(
  text: string
): ValidationResult<{ type?: EventType; category?: EventCategory }> {
  const result: ValidationResult<{ type?: EventType; category?: EventCategory }> = {
    isValid: true,
    errors: [],
    warnings: [],
    confidence: 0,
    suggestions: []
  };

  // Placeholder for type and category determination
  let type: EventType | undefined;
  let category: EventCategory | undefined;
  let typeConfidence = 0;
  let categoryConfidence = 0;

  // Check for type keywords
  for (const [eventType, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
      type = eventType as EventType;
      typeConfidence = 0.8; // High confidence for type match
      break;
    }
  }

  // Check for category keywords
  for (const [eventCategory, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
      category = eventCategory as EventCategory;
      categoryConfidence = 0.8; // High confidence for category match
      break;
    }
  }

  // Verificar consistencia entre tipo y categoría
  if (type && category) {
    const typeConfig = CONFIDENCE_THRESHOLDS[type];
    
    if (typeConfig.category !== category) {
      result.warnings.push('Event type and category may not be consistent');
      result.suggestions.push(`Type "${type}" typically belongs to category "${typeConfig.category}"`);
    }
  }

  result.data = { type, category };
  result.confidence = Math.max(typeConfidence, categoryConfidence);

  if (!type && !category) {
    result.suggestions.push('Could not determine event type or category from content');
  }

  return result;
}

// ===========================================
// VALIDADOR PRINCIPAL DE DATOS EXTRAÍDOS
// ===========================================

/**
 * Valida datos extraídos de forma completa
 */
export function validateExtractedData(data: unknown): ValidationResult<ExtractedData> {
  const result: ValidationResult<ExtractedData> = {
    isValid: false,
    errors: [],
    warnings: [],
    confidence: 0,
    suggestions: []
  };

  // Verificar que sea un objeto
  if (!data || typeof data !== 'object') {
    result.errors.push('Extracted data must be an object');
    return result;
  }

  const extractedData = data as any;

  // Validar campos obligatorios
  const titleValidation = validateEventTitle(extractedData.title);
  if (!titleValidation.isValid) {
    result.errors.push(...titleValidation.errors);
    result.warnings.push(...titleValidation.warnings);
    return result;
  }

  // Validar fecha y hora
  const dateTimeValidation = validateEventDateTime(
    extractedData.rawContent,
    extractedData.rawContent
  );
  
  if (!dateTimeValidation.isValid) {
    result.errors.push(...dateTimeValidation.errors);
    result.warnings.push(...dateTimeValidation.warnings);
  }

  // Validar ubicación (opcional)
  const locationValidation = validateEventLocation(extractedData.rawContent);
  result.warnings.push(...locationValidation.warnings);

  // Validar precio (opcional)
  const priceValidation = validateEventPrice(extractedData.rawContent);
  result.warnings.push(...priceValidation.warnings);

  // Validar clasificación
  const classificationValidation = validateEventClassification(
    `${extractedData.title} ${extractedData.description || ''} ${extractedData.rawContent || ''}`
  );
  result.warnings.push(...classificationValidation.warnings);
  result.suggestions.push(...classificationValidation.suggestions);

  // Si llegamos aquí, los datos básicos son válidos
  result.isValid = dateTimeValidation.isValid;

  // Calcular confianza promedio
  const confidences = [
    titleValidation.confidence,
    dateTimeValidation.confidence,
    locationValidation.confidence,
    priceValidation.confidence,
    classificationValidation.confidence
  ].filter(c => c > 0);

  result.confidence = confidences.length > 0 
    ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    : 0;

  // Crear datos validados
  if (result.isValid) {
    result.data = {
      title: titleValidation.data!,
      description: extractedData.description || titleValidation.data!,
      dateTime: dateTimeValidation.data!,
      location: locationValidation.data,
      price: priceValidation.data,
      type: classificationValidation.data?.type,
      category: classificationValidation.data?.category,
      tags: [], // No hashtags in this simplified example
      media: {
        images: [], // No images in this simplified example
        videos: [] // No videos in this simplified example
      },
      social: {
        hashtags: [], // No hashtags in this simplified example
        mentions: [] // No mentions in this simplified example
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        processingTime: 0,
        instagramPostId: extractedData.postId || 'unknown',
        contentType: extractedData.contentType || 'post',
        confidence: result.confidence,
        confidenceLevel: result.confidence > CONFIDENCE_THRESHOLDS.HIGH.threshold ? ExtractionConfidence.HIGH :
                          result.confidence > CONFIDENCE_THRESHOLDS.MEDIUM.threshold ? ExtractionConfidence.MEDIUM :
                          ExtractionConfidence.LOW,
        extractorVersion: '1.0.0',
        errors: result.errors,
        warnings: result.warnings
      },
      rawContent: extractedData.rawContent || '',
      originalUrl: extractedData.originalUrl || ''
    };
  }

  return result;
}

// ===========================================
// EVALUADOR DE CALIDAD DE EXTRACCIÓN
// ===========================================

/**
 * Evalúa la calidad general de los datos extraídos
 */
export function evaluateExtractionQuality(extractedData: ExtractedData): ExtractionQualityReport {
  const report: ExtractionQualityReport = {
    overallScore: 0,
    confidenceLevel: ExtractionConfidence.LOW,
    completeness: {
      hasTitle: false,
      hasDate: false,
      hasTime: false,
      hasLocation: false,
      hasDescription: false,
      hasPrice: false,
      hasMedia: false,
      score: 0
    },
    accuracy: {
      titleConfidence: 0,
      dateConfidence: 0,
      timeConfidence: 0,
      locationConfidence: 0,
      priceConfidence: 0,
      typeConfidence: 0,
      categoryConfidence: 0,
      score: 0
    },
    consistency: {
      dateTimeConsistent: true,
      priceReasonable: true,
      locationRealistic: true,
      typeMatchesCategory: true,
      score: 1
    },
    recommendations: []
  };

  // Evaluar completeness
  report.completeness.hasTitle = Boolean(extractedData.title);
  report.completeness.hasDate = Boolean(extractedData.dateTime?.startDate);
  report.completeness.hasTime = Boolean(extractedData.dateTime?.startTime);
  report.completeness.hasLocation = Boolean(extractedData.location?.name);
  report.completeness.hasDescription = Boolean(extractedData.description);
  report.completeness.hasPrice = Boolean(extractedData.price?.amount !== undefined);
  report.completeness.hasMedia = Boolean(
    false // No media in this simplified example
  );

  const completenessFields = [
    report.completeness.hasTitle,
    report.completeness.hasDate,
    report.completeness.hasTime,
    report.completeness.hasLocation,
    report.completeness.hasDescription,
    report.completeness.hasPrice,
    report.completeness.hasMedia
  ];

  report.completeness.score = completenessFields.filter(Boolean).length / completenessFields.length;

  // Evaluar accuracy basado en confianza de metadatos
  if (extractedData.metadata) {
    report.accuracy.titleConfidence = extractedData.title ? 0.8 : 0;
    report.accuracy.dateConfidence = extractedData.dateTime?.startDate ? 0.7 : 0; // Changed to check for date
    report.accuracy.timeConfidence = extractedData.dateTime?.startTime ? 0.6 : 0; // Changed to check for time
    report.accuracy.locationConfidence = extractedData.location ? 0.7 : 0;
    report.accuracy.priceConfidence = extractedData.price ? 0.6 : 0;
    report.accuracy.typeConfidence = extractedData.type ? 0.5 : 0;
    report.accuracy.categoryConfidence = extractedData.category ? 0.5 : 0;

    const accuracyScores = [
      report.accuracy.titleConfidence,
      report.accuracy.dateConfidence,
      report.accuracy.timeConfidence,
      report.accuracy.locationConfidence,
      report.accuracy.priceConfidence,
      report.accuracy.typeConfidence,
      report.accuracy.categoryConfidence
    ].filter(score => score > 0);

    report.accuracy.score = accuracyScores.length > 0
      ? accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length
      : 0;
  }

  // Evaluar consistency
  if (extractedData.type && extractedData.category) {
    const typeConfig = CONFIDENCE_THRESHOLDS[extractedData.type];
    report.consistency.typeMatchesCategory = typeConfig.category === extractedData.category;
    
    if (!report.consistency.typeMatchesCategory) {
      report.consistency.score -= 0.2;
      report.recommendations.push('Event type and category are inconsistent');
    }
  }

  if (extractedData.price && extractedData.price.amount) {
    report.consistency.priceReasonable = extractedData.price.amount >= 0 && extractedData.price.amount <= 10000;
    
    if (!report.consistency.priceReasonable) {
      report.consistency.score -= 0.2;
      report.recommendations.push('Price seems unreasonable');
    }
  }

  if (extractedData.dateTime?.startDate) { // Changed to check for date
    const eventDate = new Date(extractedData.dateTime.startDate);
    const now = new Date();
    const isReasonable = eventDate >= now && eventDate <= new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000 * 2);
    
    report.consistency.dateTimeConsistent = isReasonable;
    
    if (!isReasonable) {
      report.consistency.score -= 0.3;
      report.recommendations.push('Event date seems unrealistic');
    }
  }

  // Calcular score general
  report.overallScore = (
    report.completeness.score * 0.4 +
    report.accuracy.score * 0.4 +
    report.consistency.score * 0.2
  );

  report.confidenceLevel = report.overallScore > CONFIDENCE_THRESHOLDS.HIGH.threshold ? ExtractionConfidence.HIGH :
                            report.overallScore > CONFIDENCE_THRESHOLDS.MEDIUM.threshold ? ExtractionConfidence.MEDIUM :
                            ExtractionConfidence.LOW;

  // Generar recomendaciones
  if (report.completeness.score < 0.7) {
    report.recommendations.push('Consider extracting more complete information');
  }

  if (report.accuracy.score < 0.6) {
    report.recommendations.push('Improve extraction accuracy');
  }

  if (!report.completeness.hasTime) {
    report.recommendations.push('Try to extract event time information');
  }

  if (!report.completeness.hasLocation) {
    report.recommendations.push('Try to extract event location information');
  }

  return report;
}

// ===========================================
// UTILIDADES DE VALIDACIÓN
// ===========================================

/**
 * Verifica si los datos extraídos son suficientes para crear un evento
 */
export function isExtractedDataSufficient(data: ExtractedData): boolean {
  return Boolean(
    data.title &&
    data.dateTime?.startDate // Changed to check for date
  );
}

/**
 * Obtiene recomendaciones para mejorar la calidad de extracción
 */
export function getExtractionRecommendations(data: ExtractedData): string[] {
  const recommendations: string[] = [];
  const qualityReport = evaluateExtractionQuality(data);

  recommendations.push(...qualityReport.recommendations);

  // Recomendaciones adicionales basadas en el contenido
  if (!data.description || data.description.length < 20) {
    recommendations.push('Add more descriptive content about the event');
  }

  if (!data.social?.hashtags?.length) {
    recommendations.push('Include relevant hashtags to improve discoverability');
  }

  if (!data.media?.images?.length && !data.media?.videos?.length) {
    recommendations.push('Add visual content to make the event more appealing');
  }

  return Array.from(new Set(recommendations)); // Remove duplicates
} 