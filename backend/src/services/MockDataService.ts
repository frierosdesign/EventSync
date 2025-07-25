import { ExtractedData, Event } from '../types';
import { detectInstagramContentType } from 'eventsync-shared';

/**
 * Servicio que genera datos mock para simular la extracción de eventos de Instagram
 */
export class MockDataService {
  private mockEvents: Partial<ExtractedData>[] = [
    {
      title: 'Festival de Música Electrónica 2024',
      description: 'Una noche increíble con los mejores DJs de música electrónica. Ven y disfruta de una experiencia única con sonido de alta calidad, luces espectaculares y la mejor energía. No te pierdas este evento que promete ser inolvidable.',
      date: '2024-03-15',
      time: '22:00',
      location: 'Club Central, Madrid',
      confidence: 0.85
    },
    {
      title: 'Exposición de Arte Contemporáneo',
      description: 'Descubre las obras más innovadoras de artistas emergentes en esta exposición única. Una experiencia visual que desafía los límites del arte contemporáneo.',
      date: '2024-04-20',
      time: '18:00',
      location: 'Museo de Arte Moderno, Barcelona',
      confidence: 0.92
    },
    {
      title: 'Conferencia de Tecnología e Innovación',
      description: 'Únete a los líderes de la industria tecnológica para discutir las últimas tendencias en inteligencia artificial, blockchain y desarrollo sostenible.',
      date: '2024-05-10',
      time: '09:00',
      location: 'Centro de Convenciones TechHub, Valencia',
      confidence: 0.78
    },
    {
      title: 'Festival Gastronómico Internacional',
      description: 'Saborea los mejores platos de chefs reconocidos mundialmente. Un viaje culinario que despertará todos tus sentidos.',
      date: '2024-06-05',
      time: '12:00',
      location: 'Plaza Mayor, Sevilla',
      confidence: 0.89
    },
    {
      title: 'Maratón Benéfica por la Educación',
      description: 'Participa en esta carrera solidaria para recaudar fondos destinados a mejorar la educación en comunidades desfavorecidas.',
      date: '2024-07-12',
      time: '07:00',
      location: 'Parque del Retiro, Madrid',
      confidence: 0.94
    }
  ];

  /**
   * Simula la extracción de datos de un post de Instagram
   */
  public async extractFromInstagram(url: string): Promise<ExtractedData> {
    // Simular tiempo de procesamiento realista
    const processingStart = Date.now();
    await this.simulateProcessingTime(url);
    const processingTime = Date.now() - processingStart;

    // Detectar tipo de contenido
    const contentType = detectInstagramContentType(url);
    const contentTypeString = contentType || 'post';

    // Seleccionar datos mock aleatorios
    const randomEventData = this.getRandomEventData();

    // Generar imagen mock basada en el tipo de contenido
    const imageUrl = this.generateMockImageUrl(contentTypeString);

    // Crear datos extraídos
    const extractedData: ExtractedData = {
      title: randomEventData.title || 'Evento extraído de Instagram',
      description: randomEventData.description || 'Descripción del evento',
      date: randomEventData.date,
      time: randomEventData.time,
      location: randomEventData.location,
      confidence: randomEventData.confidence || 0.7,
      imageUrl,
      metadata: {
        postType: contentType as 'post' | 'reel' | 'igtv' | 'story',
        extractedAt: new Date().toISOString(),
        processingTime
      }
    };

    return extractedData;
  }

  /**
   * Convierte datos extraídos en un evento completo
   */
  public createEventFromExtracted(extractedData: ExtractedData, instagramUrl: string): Event {
    const now = new Date().toISOString();
    const eventId = this.generateEventId();

    return {
      id: eventId,
      title: extractedData.title,
      description: extractedData.description,
      date: extractedData.date || this.generateRandomFutureDate(),
      time: extractedData.time,
      location: extractedData.location,
      imageUrl: extractedData.imageUrl,
      instagramUrl,
      confidence: extractedData.confidence,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Simula tiempo de procesamiento variable según tipo de contenido
   */
  private async simulateProcessingTime(url: string): Promise<void> {
    const contentType = detectInstagramContentType(url);
    
    let baseTime = 1000; // 1 segundo base
    let variability = 500; // +/- 500ms

    switch (contentType) {
      case 'post':
        baseTime = 1500;
        variability = 300;
        break;
      case 'reel':
        baseTime = 2500;
        variability = 700;
        break;
      case 'igtv':
        baseTime = 3500;
        variability = 1000;
        break;
    }

    // Añadir variabilidad aleatoria
    const randomDelay = baseTime + (Math.random() * variability * 2 - variability);
    
    return new Promise(resolve => {
      setTimeout(resolve, Math.max(500, randomDelay)); // Mínimo 500ms
    });
  }

  /**
   * Selecciona datos de evento aleatorios
   */
  private getRandomEventData(): Partial<ExtractedData> {
    const randomIndex = Math.floor(Math.random() * this.mockEvents.length);
    const baseEvent = this.mockEvents[randomIndex];
    
    // Añadir algo de variabilidad a la confianza
    const confidenceVariability = (Math.random() - 0.5) * 0.1; // +/- 5%
    const adjustedConfidence = Math.max(0.5, Math.min(0.95, 
      (baseEvent.confidence || 0.8) + confidenceVariability
    ));

    return {
      ...baseEvent,
      confidence: Math.round(adjustedConfidence * 100) / 100 // Redondear a 2 decimales
    };
  }

  /**
   * Genera URL de imagen mock basada en el tipo de contenido
   */
  private generateMockImageUrl(contentType: string): string {
    const imageId = Math.floor(Math.random() * 1000);
    
    // Diferentes tamaños según tipo de contenido
    const dimensions = contentType === 'story' ? '400x600' : '400x400';
    
    return `https://picsum.photos/${dimensions}?random=${imageId}&blur=0&grayscale=0`;
  }

  /**
   * Genera fecha futura aleatoria para eventos
   */
  private generateRandomFutureDate(): string {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000); // Hasta 90 días en el futuro
    return futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Genera ID único para eventos
   */
  private generateEventId(): string {
    return 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  /**
   * Simula errores ocasionales para testing
   */
  public async simulateErrorScenario(url: string, errorRate: number = 0.1): Promise<ExtractedData> {
    if (Math.random() < errorRate) {
      const errors = [
        'Rate limit exceeded for Instagram API',
        'Content not accessible or private',
        'Network timeout during extraction',
        'Unable to parse event information from content'
      ];
      
      const randomError = errors[Math.floor(Math.random() * errors.length)];
      throw new Error(randomError);
    }
    
    // Si no hay error, devolver datos mock
    return this.extractFromInstagram(url);
  }

  /**
   * Obtiene estadísticas mock del servicio
   */
  public getServiceStats() {
    return {
      totalExtractions: Math.floor(Math.random() * 10000) + 5000,
      successRate: 0.87 + Math.random() * 0.1, // 87-97%
      averageProcessingTime: 2.3 + Math.random() * 1.5, // 2.3-3.8 seconds
      contentTypeDistribution: {
        post: 0.65,
        reel: 0.25,
        igtv: 0.10
      },
      lastUpdated: new Date().toISOString()
    };
  }
} 