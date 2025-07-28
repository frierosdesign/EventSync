import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { EventService } from '../services/EventService';
import { apiLogger } from '../middleware/logger';
import { createApiError } from '../middleware/errorHandler';
import { getDatabase } from '../config/database';

const router = Router();

// Lazy initialization of EventService to avoid database initialization issues
const getEventService = () => new EventService(getDatabase());

// ===========================================
// MIDDLEWARE DE VALIDACIÓN
// ===========================================

const validateInstagramUrl = [
  body('url')
    .isURL()
    .withMessage('Valid Instagram URL is required')
    .matches(/^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|igtv|stories)\/.+/)
    .withMessage('URL must be an Instagram post, reel, IGTV, or story'),
];

const validateEventId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Event ID must be a positive integer')
];

// ===========================================
// RUTAS DE EVENTOS
// ===========================================

/**
 * GET /api/events
 * Obtener todos los eventos
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    apiLogger.info('🔍 Fetching all events');
    
    const result = await getEventService().getAllEvents();
    
    // Parse query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    res.json({
      success: true,
      data: {
        events: result.events,
        total: result.count,
        page: page,
        limit: limit
      }
    });
    
  } catch (error) {
    apiLogger.error('❌ Error fetching events', { error });
    
    const apiError = createApiError(
      'Failed to fetch events',
      500,
      'FETCH_EVENTS_ERROR'
    );
    
    res.status(apiError.statusCode).json({
      success: false,
      error: apiError.message,
      code: apiError.code
    });
  }
});

/**
 * GET /api/events/stats
 * Obtener estadísticas del servicio
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    apiLogger.info('📊 Fetching service statistics');
    
    const stats = getEventService().getServiceStats();
    
    return res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    apiLogger.error('❌ Error fetching stats', { error });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch service statistics'
    });
  }
});

/**
 * GET /api/events/:id
 * Obtener evento por ID
 */
router.get('/:id', validateEventId, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      apiLogger.warn('❌ Validation errors in get event by ID', { errors: errors.array() });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID',
        details: errors.array()
      });
    }

    const eventId = parseInt(req.params.id);
    apiLogger.info('🔍 Fetching event by ID', { eventId });
    
    const event = getEventService().getEventById(eventId);
    
    if (!event) {
      apiLogger.warn('❌ Event not found', { eventId });
      
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }
    
    return res.json({
      success: true,
      data: event,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    apiLogger.error('❌ Error fetching event by ID', { error, eventId: req.params.id });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
});

/**
 * POST /api/events/extract
 * Extraer evento de URL de Instagram usando IA simulada
 */
router.post('/extract', validateInstagramUrl, async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      apiLogger.warn('❌ Validation errors in extract event', { errors: errors.array() });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid Instagram URL',
        details: errors.array()
      });
    }

    const { url } = req.body;
    
    apiLogger.scraping('🤖 Starting AI-powered event extraction', { 
      url: url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Usar el EventService que maneja la base de datos
    const eventService = getEventService();
    const extractionResult = await eventService.extractEventFromInstagram(url);
    
    const totalTime = Date.now() - startTime;

    if (!extractionResult.success || !extractionResult.event) {
      apiLogger.error('❌ Event extraction failed', {
        error: extractionResult.error,
        url: url,
        processingTime: totalTime
      });

      return res.status(400).json({
        success: false,
        error: extractionResult.error || 'Failed to extract event information',
        processingTime: totalTime,
        warnings: extractionResult.warnings
      });
    }

    // El evento ya está guardado en la base de datos por el EventService
    const savedEvent = extractionResult.event;

    apiLogger.success('🎉 Event extraction completed successfully', {
      title: savedEvent.title,
      confidence: extractionResult.confidence,
      processingTime: totalTime,
      warnings: extractionResult.warnings?.length || 0
    });

    return res.status(201).json({
      success: true,
      data: {
        event: savedEvent,
        extracted: extractionResult.extractedData
      },
      confidence: extractionResult.confidence,
      processingTime: totalTime,
      warnings: extractionResult.warnings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    apiLogger.error('💥 Critical error in extraction endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      url: req.body?.url,
      processingTime: totalTime
    });

    return res.status(500).json({
      success: false,
      error: 'Internal server error during event extraction',
      processingTime: totalTime
    });
  }
});

/**
 * DELETE /api/events/:id
 * Eliminar evento
 */
router.delete('/:id', validateEventId, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      apiLogger.warn('❌ Validation errors in delete event', { errors: errors.array() });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID',
        details: errors.array()
      });
    }

    const eventId = parseInt(req.params.id);
    apiLogger.info('🗑️ Attempting to delete event', { eventId });
    
    const deleted = getEventService().deleteEvent(eventId);
    
    if (!deleted) {
      apiLogger.warn('❌ Event not found for deletion', { eventId });
      
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }
    
    return res.json({
      success: true,
      message: 'Event deleted successfully',
      eventId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    apiLogger.error('❌ Error deleting event', { error, eventId: req.params.id });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    });
  }
});

/**
 * POST /api/events/test-extraction
 * Endpoint de prueba para testear diferentes escenarios de extracción
 */
router.post('/test-extraction', async (req: Request, res: Response) => {
  try {
    const { scenario = 'random' } = req.body;
    
    // URLs de prueba para diferentes escenarios
    const testUrls = {
      music: 'https://www.instagram.com/p/music-concert-test/',
      food: 'https://www.instagram.com/p/food-restaurant-test/',
      culture: 'https://www.instagram.com/p/art-museum-gallery-test/',
      tech: 'https://www.instagram.com/p/tech-conference-summit-test/',
      sports: 'https://www.instagram.com/p/sport-football-running-test/',
      party: 'https://www.instagram.com/p/party-festa-celebration-test/',
      error: 'https://www.instagram.com/p/error-test-fail/',
      partial: 'https://www.instagram.com/p/partial-info-test/',
      random: `https://www.instagram.com/p/test-${Date.now()}/`
    };

    const testUrl = testUrls[scenario as keyof typeof testUrls] || testUrls.random;
    
    apiLogger.info('🧪 Running extraction test', { scenario, testUrl });
    
    // Usar directamente el servicio de extracción sin base de datos
    const { EventExtractionService } = await import('../services/EventExtractionService');
    const extractionService = EventExtractionService.getInstance();
    const result = await extractionService.extractEventFromUrl(testUrl);
    
    res.json({
      success: true,
      scenario,
      testUrl,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    apiLogger.error('❌ Error in test extraction', { error });
    
    res.status(500).json({
      success: false,
      error: 'Test extraction failed'
    });
  }
});

export default router; 