import Database from 'better-sqlite3';
import { apiLogger } from '../middleware/logger';
import { EventExtractionService } from './EventExtractionService';
import { MockDataService } from './MockDataService';

// ===========================================
// INTERFACES
// ===========================================

export interface Event {
  id?: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  instagramUrl: string;
  rawContent: string;
  extractedData: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventExtractionResult {
  success: boolean;
  event?: Event;
  extractedData?: any;
  confidence?: number;
  processingTime?: number;
  warnings?: string[];
  error?: string;
}

// ===========================================
// SERVICIO DE EVENTOS
// ===========================================

export class EventService {
  private db: Database.Database;
  private extractionService: EventExtractionService;
  private mockService: MockDataService;

  constructor(database: Database.Database) {
    this.db = database;
    
    // Initialize services with error handling
    try {
      this.extractionService = EventExtractionService.getInstance();
    } catch (error) {
      apiLogger.warn('⚠️ EventExtractionService initialization failed, will use fallback', { error });
      this.extractionService = null as any;
    }
    
    try {
      this.mockService = new MockDataService();
    } catch (error) {
      apiLogger.warn('⚠️ MockDataService initialization failed', { error });
      this.mockService = null as any;
    }
  }

  /**
   * Obtener todos los eventos
   */
  public async getAllEvents(): Promise<{ events: Event[]; count: number }> {
    try {
      apiLogger.info('🔍 Starting database query...');
      
      const rows = this.db.prepare(`
        SELECT 
          id,
          title,
          description,
          date,
          time,
          location,
          image_url as imageUrl,
          instagram_url as instagramUrl,
          created_at as createdAt,
          updated_at as updatedAt,
          extracted_data as extractedData,
          raw_content as rawContent
        FROM events 
        ORDER BY created_at DESC
      `).all();
      
      apiLogger.info(`📊 Raw database rows: ${rows.length}`);
      
      // Map database rows to Event objects
      const events: Event[] = rows.map((row: any, index: number) => {
        try {
                  const event: Event = {
          id: row.id,
          title: row.title,
          description: row.description || '',
          date: row.date,
          time: row.time,
          location: row.location,
          imageUrl: row.imageUrl,
          instagramUrl: row.instagramUrl,
          rawContent: row.rawContent || '',
          extractedData: row.extractedData || '',
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        };
          return event;
        } catch (mapError) {
          apiLogger.error(`❌ Error mapping row ${index}`, { row, mapError });
          throw mapError;
        }
      });
      
      apiLogger.info(`📊 Successfully mapped ${events.length} events from database`);
      
      return {
        events,
        count: events.length
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      apiLogger.error('❌ Error fetching events', { 
        errorMessage, 
        errorStack,
        errorType: error?.constructor?.name,
        fullError: error 
      });
      throw new Error(`Failed to fetch events: ${errorMessage}`);
    }
  }

  /**
   * Obtener evento por ID
   */
  public getEventById(id: number): Event | null {
    try {
      const stmt = this.db.prepare(`
        SELECT 
          id,
          title,
          description,
          date,
          time,
          location,
          image_url as imageUrl,
          instagram_url as instagramUrl,
          raw_content as rawContent,
          extracted_data as extractedData,
          created_at as createdAt,
          updated_at as updatedAt
        FROM events WHERE id = ?
      `);
      const event = stmt.get(id) as Event | undefined;
      
      if (event) {
        apiLogger.info(`📄 Retrieved event ${id}`, { title: event.title });
      } else {
        apiLogger.warn(`❌ Event ${id} not found`);
      }
      
      return event || null;
    } catch (error) {
      apiLogger.error(`❌ Error fetching event ${id}`, { error });
      throw new Error(`Failed to fetch event ${id}`);
    }
  }

  /**
   * Crear nuevo evento
   */
  public createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO events (
          title, description, date, time, location, 
          image_url, instagram_url, raw_content, extracted_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        eventData.title,
        eventData.description || null,
        eventData.date,
        eventData.time || undefined,
        eventData.location || undefined,
        eventData.imageUrl || null,
        eventData.instagramUrl,
        eventData.rawContent,
        eventData.extractedData
      );
      
      const newEvent = this.getEventById(result.lastInsertRowid as number);
      
      if (!newEvent) {
        throw new Error('Failed to retrieve created event');
      }
      
      apiLogger.success(`✅ Event created`, {
        id: newEvent.id,
        title: newEvent.title,
        instagramUrl: newEvent.instagramUrl
      });
      
      return newEvent;
    } catch (error) {
      apiLogger.error('❌ Error creating event', { error, eventData });
      throw new Error('Failed to create event');
    }
  }

  /**
   * Eliminar evento
   */
  public deleteEvent(id: number): boolean {
    try {
      const existingEvent = this.getEventById(id);
      if (!existingEvent) {
        return false;
      }
      
      const stmt = this.db.prepare('DELETE FROM events WHERE id = ?');
      const result = stmt.run(id);
      
      const deleted = result.changes > 0;
      
      if (deleted) {
        apiLogger.success(`🗑️ Event ${id} deleted`, { title: existingEvent.title });
      }
      
      return deleted;
    } catch (error) {
      apiLogger.error(`❌ Error deleting event ${id}`, { error });
      throw new Error(`Failed to delete event ${id}`);
    }
  }

  /**
   * Extraer evento de URL de Instagram usando IA simulada
   */
  public async extractEventFromInstagram(instagramUrl: string): Promise<EventExtractionResult> {
    const startTime = Date.now();
    
    apiLogger.scraping(`🚀 Starting event extraction`, { 
      url: instagramUrl,
      service: 'AI-Simulation'
    });

    try {
      // Verificar si ya existe un evento con esta URL
      const existingEvent = this.findEventByUrl(instagramUrl);
      if (existingEvent) {
        apiLogger.warn(`⚠️ Event already exists for URL`, { 
          eventId: existingEvent.id,
          title: existingEvent.title 
        });
        
        // En lugar de devolver error, devolver el evento existente como éxito
        let parsedExtractedData = null;
        try {
          if (existingEvent.extractedData) {
            parsedExtractedData = JSON.parse(existingEvent.extractedData);
          }
        } catch (parseError) {
          apiLogger.warn(`⚠️ Failed to parse extractedData for existing event`, { 
            eventId: existingEvent.id,
            error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
          });
        }

        return {
          success: true,
          event: existingEvent,
          extractedData: parsedExtractedData,
          confidence: 1.0, // Máxima confianza para evento existente
          processingTime: Date.now() - startTime,
          warnings: ['Event already existed in database']
        };
      }

      // Usar el servicio de extracción con IA simulada
      const extractionResult = await this.extractionService.extractEventFromUrl(instagramUrl);
      
      if (!extractionResult.success || !extractionResult.data) {
        apiLogger.error(`❌ AI extraction failed`, {
          error: extractionResult.error,
          processingTime: extractionResult.processingTime
        });
        
        return {
          success: false,
          error: extractionResult.error || 'Failed to extract event information',
          processingTime: extractionResult.processingTime,
          warnings: extractionResult.warnings
        };
      }

      // Convertir datos extraídos a formato de evento
      const eventData = this.convertExtractedDataToEvent(extractionResult.data, instagramUrl);
      
      // Guardar evento en base de datos
      const savedEvent = this.createEvent(eventData);
      
      const totalProcessingTime = Date.now() - startTime;
      
      apiLogger.success(`🎉 Event extraction completed successfully`, {
        eventId: savedEvent.id,
        title: savedEvent.title,
        confidence: extractionResult.confidence,
        aiProcessingTime: extractionResult.processingTime,
        totalProcessingTime,
        warnings: extractionResult.warnings?.length || 0
      });

      return {
        success: true,
        event: savedEvent,
        extractedData: extractionResult.data,
        confidence: extractionResult.confidence,
        processingTime: totalProcessingTime,
        warnings: extractionResult.warnings
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      apiLogger.error(`💥 Critical error during extraction`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });

      // Fallback a mock data si la IA falla completamente
      try {
        apiLogger.info(`🔄 Falling back to mock data generation`);
        
        const mockResult = await this.mockService.simulateErrorScenario(instagramUrl, 0.1);
        const eventData = this.convertMockDataToEvent(mockResult, instagramUrl);
        const savedEvent = this.createEvent(eventData);
        
        return {
          success: true,
          event: savedEvent,
          extractedData: mockResult,
          confidence: 0.3, // Low confidence for mock data
          processingTime: Date.now() - startTime,
          warnings: ['Used mock data due to extraction failure']
        };
        
      } catch (fallbackError) {
        apiLogger.error(`💀 Even fallback failed`, { fallbackError });
        
        return {
          success: false,
          error: 'Complete extraction failure - both AI and fallback failed',
          processingTime: Date.now() - startTime
        };
      }
    }
  }

  /**
   * Buscar evento existente por URL
   */
  private findEventByUrl(url: string): Event | null {
    try {
      const stmt = this.db.prepare('SELECT * FROM events WHERE instagram_url = ?');
      const event = stmt.get(url) as Event | undefined;
      return event || null;
    } catch (error) {
      apiLogger.error('Error checking existing URL', { error, url });
      return null;
    }
  }

  /**
   * Convertir datos extraídos por IA a formato de evento
   */
  private convertExtractedDataToEvent(extractedData: any, instagramUrl: string): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {
    // Extraer fecha en formato simple - manejar diferentes estructuras
    let eventDate = new Date().toISOString().split('T')[0];
    if (extractedData.dateTime?.startDate) {
      eventDate = new Date(extractedData.dateTime.startDate).toISOString().split('T')[0];
    } else if (extractedData.startDate) {
      eventDate = new Date(extractedData.startDate).toISOString().split('T')[0];
    } else if (extractedData.date) {
      eventDate = new Date(extractedData.date).toISOString().split('T')[0];
    }

    // Extraer hora - manejar diferentes estructuras
    let eventTime = undefined;
    if (extractedData.dateTime?.startTime) {
      eventTime = extractedData.dateTime.startTime;
    } else if (extractedData.startTime) {
      eventTime = extractedData.startTime;
    } else if (extractedData.time) {
      eventTime = extractedData.time;
    }

    // Debug: Log el valor de eventTime
    console.log('🔍 DEBUG: eventTime value:', eventTime);
    console.log('🔍 DEBUG: eventTime type:', typeof eventTime);
    console.log('🔍 DEBUG: eventTime === undefined:', eventTime === undefined);
    console.log('🔍 DEBUG: eventTime === null:', eventTime === null);

    // Construir ubicación como string - manejar diferentes estructuras
    let location = '';
    if (extractedData.location?.name) {
      location = extractedData.location.name;
      if (extractedData.location.city) {
        location += `, ${extractedData.location.city}`;
      }
      if (extractedData.location.country) {
        location += `, ${extractedData.location.country}`;
      }
    } else if (extractedData.location && typeof extractedData.location === 'string') {
      location = extractedData.location;
    }

    // Extraer URL de imagen
    let imageUrl = undefined;
    if (extractedData.imageUrl) {
      imageUrl = extractedData.imageUrl;
    } else if (extractedData.media?.images?.[0]?.url) {
      imageUrl = extractedData.media.images[0].url;
    }

    return {
      title: extractedData.title || 'Evento extraído de Instagram',
      description: extractedData.description || extractedData.title,
      date: eventDate,
      time: eventTime,
      location: location || undefined,
      imageUrl,
      instagramUrl,
      rawContent: extractedData.rawContent || '',
      extractedData: JSON.stringify({
        ...extractedData,
        extractionMethod: 'ai-simulation',
        confidence: extractedData.metadata?.confidence || extractedData.confidence || 0.7
      })
    };
  }

  /**
   * Convertir datos mock a formato de evento (fallback)
   */
  private convertMockDataToEvent(mockData: any, instagramUrl: string): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {
    const eventDate = new Date().toISOString().split('T')[0];

    return {
      title: 'Evento extraído de Instagram (Mock)',
      description: 'Evento extraído de Instagram usando datos de ejemplo',
      date: eventDate,
      time: undefined,
      location: undefined,
      imageUrl: mockData.imageUrl || `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
      instagramUrl,
      rawContent: '',
      extractedData: JSON.stringify({
        ...mockData,
        extractionMethod: 'mock-fallback',
        confidence: 0.3
      })
    };
  }

  /**
   * Obtener estadísticas del servicio
   */
  public getServiceStats() {
    try {
      const totalEvents = this.db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
      const recentEvents = this.db.prepare(`
        SELECT COUNT(*) as count FROM events 
        WHERE date(created_at) >= date('now', '-7 days')
      `).get() as { count: number };

      const aiStats = this.extractionService.getStats();

      return {
        database: {
          totalEvents: totalEvents.count,
          recentEvents: recentEvents.count
        },
        extraction: aiStats,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      apiLogger.error('Error getting service stats', { error });
      return {
        database: { totalEvents: 0, recentEvents: 0 },
        extraction: { error: 'Stats unavailable' },
        lastUpdated: new Date().toISOString()
      };
    }
  }
} 