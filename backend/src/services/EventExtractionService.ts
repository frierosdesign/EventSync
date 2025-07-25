import { 
  EventType, 
  EventCategory, 
  ExtractionConfidence,
  InstagramContentType,
  ExtractedData,
  detectInstagramContentType
} from 'eventsync-shared';
import { ExtractedData as BackendExtractedData } from '../types/index';
import { apiLogger } from '../middleware/logger';

// ===========================================
// INTERFACES Y TIPOS
// ===========================================

export interface ExtractionResult {
  success: boolean;
  data?: ExtractedData;
  error?: string;
  processingTime: number;
  confidence: number;
  warnings: string[];
}

export interface ExtractionContext {
  url: string;
  contentType: InstagramContentType;
  contentId: string;
  timestamp: string;
}

// ===========================================
// DATOS MOCK REALISTAS PARA BARCELONA
// ===========================================

const BARCELONA_VENUES = [
  'Palau de la Música Catalana',
  'Teatro Real',
  'CCIB - Centre de Convencions Internacional de Barcelona',
  'Poble Espanyol',
  'Parc del Fòrum',
  'Sala Apolo',
  'Razzmatazz',
  'Palau de Pedralbes',
  'CosmoCaixa',
  'Museu Picasso',
  'MNAC - Museu Nacional d\'Art de Catalunya',
  'Centre Cultural Teixidor',
  'Biblioteca Central Gabriel García Márquez',
  'Parc de la Ciutadella',
  'Jardins del Palau Robert',
  'Hotel Casa Camper',
  'Restaurant Disfrutar',
  'Cal Pep',
  'Bar Marsella',
  'Bunkers del Carmel',
  'Mirador de Colom',
  'Platja de la Barceloneta',
  'Camp Nou',
  'Palau de la Generalitat'
];

const MOCK_EVENT_TEMPLATES = [
  // CONCIERTOS
  {
    type: EventType.CONCERT,
    category: EventCategory.MUSIC,
    templates: [
      {
        title: 'Concierto de Jazz en vivo - Trio Barcelona',
        description: '🎷 Una noche mágica con el mejor jazz catalán. Ven a disfrutar de melodías únicas en un ambiente íntimo y acogedor. #JazzBarcelona #MúsicaEnVivo',
        venues: ['Palau de la Música Catalana', 'Sala Apolo', 'Bar Marsella'],
        hashtags: ['#jazz', '#barcelona', '#música', '#concierto', '#live'],
        mentions: ['@triobarcelona', '@jazzbcn'],
        timeSlots: ['20:30', '21:00', '22:00'],
        prices: [25, 35, 45, 50]
      },
      {
        title: 'Festival de Música Electrónica - SónarBCN',
        description: '🎧 Los mejores DJs internacionales se reunen en Barcelona. 3 días de música electrónica sin parar. Early bird tickets disponibles! #Sónar2024 #ElectronicMusic',
        venues: ['Parc del Fòrum', 'CCIB', 'Poble Espanyol'],
        hashtags: ['#sonar', '#electronic', '#festival', '#barcelona', '#techno'],
        mentions: ['@sonarbcn', '@electronicbcn'],
        timeSlots: ['16:00', '18:00', '20:00'],
        prices: [80, 120, 150, 200]
      }
    ]
  },

  // GASTRONOMÍA
  {
    type: EventType.OTHER,
    category: EventCategory.FOOD_DRINK,
    templates: [
      {
        title: 'Cena Degustación - Menú de Temporada',
        description: '🍽️ Descubre los sabores del Mediterráneo con nuestro chef estrella Michelin. 7 platos únicos con maridaje incluido. Reservas limitadas. #AltaCocina #Barcelona',
        venues: ['Restaurant Disfrutar', 'Cal Pep', 'Hotel Casa Camper'],
        hashtags: ['#gastronomía', '#michelin', '#barcelona', '#cena', '#maridaje'],
        mentions: ['@disfrutarbcn', '@chefcarles'],
        timeSlots: ['19:30', '20:00', '21:00'],
        prices: [95, 125, 165, 200]
      },
      {
        title: 'Taller de Cocina Catalana Tradicional',
        description: '👨‍🍳 Aprende a cocinar paella, escalivada y crema catalana de la mano de nuestros chefs expertos. Incluye degustación y recetas para casa! #CocinasCatalana',
        venues: ['Centre Cultural Teixidor', 'CosmoCaixa'],
        hashtags: ['#taller', '#cocina', '#catalana', '#paella', '#tradición'],
        mentions: ['@cookingtradition', '@chefpau'],
        timeSlots: ['10:00', '11:00', '16:00'],
        prices: [45, 60, 75]
      }
    ]
  },

  // CULTURA Y ARTE
  {
    type: EventType.EXHIBITION,
    category: EventCategory.ART_CULTURE,
    templates: [
      {
        title: 'Exposición: "Gaudí y la Barcelona Modernista"',
        description: '🏛️ Un recorrido único por la obra del genio catalán. Piezas inéditas, realidad virtual y experiencias inmersivas. Del 15 de marzo al 15 de junio. #Gaudí #Modernisme',
        venues: ['MNAC', 'Museu Picasso', 'Centre Cultural Teixidor'],
        hashtags: ['#gaudí', '#modernisme', '#barcelona', '#arte', '#cultura'],
        mentions: ['@mnacmuseum', '@gaudíexperience'],
        timeSlots: ['10:00', '12:00', '16:00', '18:00'],
        prices: [0, 12, 18, 25]
      },
      {
        title: 'Noche de los Museos - Entrada Gratuita',
        description: '🌙 Una noche especial para descubrir el patrimonio cultural de Barcelona. Más de 50 museos abren sus puertas gratuitamente hasta las 2h. #NocheMuseos',
        venues: ['Museu Picasso', 'MNAC', 'CosmoCaixa'],
        hashtags: ['#museosgratis', '#cultura', '#barcelona', '#arte', '#noche'],
        mentions: ['@museubcn', '@culturabcn'],
        timeSlots: ['19:00', '20:00', '21:00'],
        prices: [0]
      }
    ]
  },

  // CONFERENCIAS Y TALLERES
  {
    type: EventType.CONFERENCE,
    category: EventCategory.TECHNOLOGY,
    templates: [
      {
        title: 'Barcelona Tech Summit 2024',
        description: '💻 Los líderes tecnológicos se reunen en Barcelona. IA, Blockchain, Startups y el futuro de la innovación. Networking incluido. #TechSummit #Innovation',
        venues: ['CCIB', 'CosmoCaixa', 'Palau de Pedralbes'],
        hashtags: ['#tech', '#summit', '#ia', '#blockchain', '#startups'],
        mentions: ['@techsummitbcn', '@innovationhub'],
        timeSlots: ['09:00', '10:00', '14:00'],
        prices: [150, 250, 350, 500]
      },
      {
        title: 'Workshop: Desarrollo Web con React y TypeScript',
        description: '⚛️ Aprende las últimas tecnologías web de la mano de expertos. 8 horas intensivas, proyecto práctico incluido. Certificado oficial. #WebDev #React',
        venues: ['Biblioteca Central Gabriel García Márquez', 'Centre Cultural Teixidor'],
        hashtags: ['#react', '#typescript', '#webdev', '#workshop', '#programación'],
        mentions: ['@webdevbcn', '@reactbcn'],
        timeSlots: ['09:30', '10:00'],
        prices: [120, 180, 220]
      }
    ]
  },

  // DEPORTES
  {
    type: EventType.SPORTS,
    category: EventCategory.SPORTS_FITNESS,
    templates: [
      {
        title: 'FC Barcelona vs Real Madrid - El Clásico',
        description: '⚽ El partido más esperado del año! Vive la magia del Clásico en el Camp Nou. Entradas limitadas disponibles. #ElClásico #FCBarcelona #VisçaElBarça',
        venues: ['Camp Nou'],
        hashtags: ['#clasico', '#fcbarcelona', '#realmadrid', '#football', '#campnou'],
        mentions: ['@fcbarcelona', '@realmadrid'],
        timeSlots: ['16:00', '18:00', '20:00', '21:00'],
        prices: [80, 150, 300, 500, 800]
      },
      {
        title: 'Maratón de Barcelona 2024',
        description: '🏃‍♀️ 42km por las calles más emblemáticas de la ciudad condal. Inscripciones abiertas! 15.000 corredores de 80 países. #MaratónBarcelona',
        venues: ['Parc de la Ciutadella', 'Platja de la Barceloneta'],
        hashtags: ['#maratón', '#running', '#barcelona', '#sport', '#42k'],
        mentions: ['@maratonbcn', '@runbarcelona'],
        timeSlots: ['08:00', '08:30', '09:00'],
        prices: [35, 45, 60]
      }
    ]
  },

  // FIESTAS Y EVENTOS SOCIALES
  {
    type: EventType.PARTY,
    category: EventCategory.OTHER,
    templates: [
      {
        title: 'Festa Major de Gràcia 2024',
        description: '🎉 La fiesta popular más auténtica de Barcelona! Calles decoradas, conciertos, actividades para toda la familia. Del 15 al 21 de agosto. #FestaGràcia',
        venues: ['Parc de la Ciutadella', 'Jardins del Palau Robert'],
        hashtags: ['#festamajor', '#gràcia', '#barcelona', '#fiesta', '#tradición'],
        mentions: ['@festamajorgracia', '@barcelona'],
        timeSlots: ['18:00', '19:00', '20:00', '21:00'],
        prices: [0, 5, 10]
      },
      {
        title: 'Noche de San Juan en la Playa',
        description: '🔥 Celebra la noche más mágica del año en la Barceloneta. Hogueras, música y diversión hasta el amanecer. ¡Trae tu guitarra! #SanJuan #Barceloneta',
        venues: ['Platja de la Barceloneta', 'Bunkers del Carmel'],
        hashtags: ['#sanjuan', '#playa', '#barceloneta', '#hogueras', '#noche'],
        mentions: ['@barceloneta', '@nitsanjuan'],
        timeSlots: ['21:00', '22:00', '23:00'],
        prices: [0, 15, 25]
      }
    ]
  }
];

// ===========================================
// SERVICIO DE EXTRACCIÓN DE EVENTOS
// ===========================================

export class EventExtractionService {
  private static instance: EventExtractionService;
  private extractionCount = 0;
  private lastExtractionTime = 0;

  public static getInstance(): EventExtractionService {
    if (!EventExtractionService.instance) {
      EventExtractionService.instance = new EventExtractionService();
    }
    return EventExtractionService.instance;
  }

  /**
   * Extrae información de evento desde una URL de Instagram
   */
  public async extractEventFromUrl(url: string): Promise<ExtractionResult> {
    const startTime = Date.now();
    this.extractionCount++;
    
    apiLogger.scraping(`🤖 Starting AI extraction #${this.extractionCount}`, { url });

    try {
      // Validar URL
      await this.validateUrl(url);
      
      // Determinar contexto de extracción
      const context = this.createExtractionContext(url);
      
      // Simular delays realistas de procesamiento IA
      await this.simulateAIProcessing(context);
      
      // Determinar escenario basado en URL y contexto
      const scenario = this.determineExtractionScenario(url, context);
      
      // Ejecutar extracción según escenario
      const result = await this.executeExtraction(scenario, context);
      
      const processingTime = Date.now() - startTime;
      
      apiLogger.scraping(`✅ AI extraction completed`, {
        scenario: scenario.type,
        confidence: result.confidence,
        processingTime: `${processingTime}ms`,
        warnings: result.warnings.length
      });

      return {
        ...result,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      apiLogger.error(`❌ AI extraction failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: `${processingTime}ms`
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown extraction error',
        processingTime,
        confidence: 0,
        warnings: ['Extraction process failed']
      };
    }
  }

  /**
   * Valida que la URL sea válida y accesible
   */
  private async validateUrl(url: string): Promise<void> {
    if (!url || typeof url !== 'string') {
      throw new Error('URL is required and must be a string');
    }

    if (!url.includes('instagram.com')) {
      throw new Error('URL must be from Instagram');
    }

    const contentType = detectInstagramContentType(url);
    if (!contentType) {
      throw new Error('URL must point to specific Instagram content (post, reel, IGTV, or story)');
    }

    // Simular verificación de accesibilidad
    await this.delay(200, 500);
    
    // 5% de probabilidad de URL no accesible
    if (Math.random() < 0.05) {
      throw new Error('Instagram content not accessible or private');
    }
  }

  /**
   * Crea contexto de extracción basado en la URL
   */
  private createExtractionContext(url: string): ExtractionContext {
    const contentType = detectInstagramContentType(url) || InstagramContentType.POST;
    const contentId = this.extractContentId(url);
    
    return {
      url,
      contentType,
      contentId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Simula delays realistas de procesamiento IA
   */
  private async simulateAIProcessing(context: ExtractionContext): Promise<void> {
    apiLogger.scraping(`🧠 AI processing started`, { contentType: context.contentType });

    // Rate limiting: mínimo 1 segundo entre extracciones
    const timeSinceLastExtraction = Date.now() - this.lastExtractionTime;
    if (timeSinceLastExtraction < 1000) {
      await this.delay(1000 - timeSinceLastExtraction);
    }

    // Delays basados en tipo de contenido
    const delays = {
      post: { min: 1500, max: 3000 },
      reel: { min: 2000, max: 4000 },
      igtv: { min: 2500, max: 5000 },
      story: { min: 1000, max: 2000 }
    };

    const delayRange = delays[context.contentType] || delays.post;
    
    // Fases de procesamiento simuladas
    apiLogger.scraping(`📸 Analyzing visual content...`);
    await this.delay(delayRange.min * 0.3, delayRange.max * 0.3);
    
    apiLogger.scraping(`📝 Processing text and captions...`);
    await this.delay(delayRange.min * 0.4, delayRange.max * 0.4);
    
    apiLogger.scraping(`🎯 Extracting event information...`);
    await this.delay(delayRange.min * 0.3, delayRange.max * 0.3);

    this.lastExtractionTime = Date.now();
  }

  /**
   * Determina el escenario de extracción basado en URL y contexto
   */
  private determineExtractionScenario(url: string, context: ExtractionContext) {
    // Diferentes escenarios basados en patrones de URL
    const urlLower = url.toLowerCase();
    
    // Escenarios de error (10% probabilidad)
    if (Math.random() < 0.1) {
      return {
        type: 'error',
        reason: this.selectRandomErrorReason(),
        confidence: 0
      };
    }
    
    // Escenarios de información parcial (20% probabilidad)
    if (Math.random() < 0.2) {
      return {
        type: 'partial',
        reason: 'Some information could not be extracted',
        confidence: Math.random() * 0.4 + 0.3 // 0.3-0.7
      };
    }
    
    // Escenarios específicos por contenido
    if (urlLower.includes('music') || urlLower.includes('concert') || urlLower.includes('festival')) {
      return { type: 'success', eventType: 'music', confidence: Math.random() * 0.3 + 0.7 };
    }
    
    if (urlLower.includes('food') || urlLower.includes('restaurant') || urlLower.includes('cook')) {
      return { type: 'success', eventType: 'food', confidence: Math.random() * 0.3 + 0.7 };
    }
    
    if (urlLower.includes('art') || urlLower.includes('museum') || urlLower.includes('gallery')) {
      return { type: 'success', eventType: 'culture', confidence: Math.random() * 0.3 + 0.7 };
    }
    
    if (urlLower.includes('tech') || urlLower.includes('conference') || urlLower.includes('summit')) {
      return { type: 'success', eventType: 'tech', confidence: Math.random() * 0.3 + 0.7 };
    }
    
    if (urlLower.includes('sport') || urlLower.includes('football') || urlLower.includes('running')) {
      return { type: 'success', eventType: 'sports', confidence: Math.random() * 0.3 + 0.7 };
    }
    
    if (urlLower.includes('party') || urlLower.includes('festa') || urlLower.includes('celebration')) {
      return { type: 'success', eventType: 'party', confidence: Math.random() * 0.3 + 0.7 };
    }

    // Escenario por defecto - evento genérico
    return { 
      type: 'success', 
      eventType: 'random', 
      confidence: Math.random() * 0.4 + 0.5 
    };
  }

  /**
   * Ejecuta la extracción según el escenario determinado
   */
  private async executeExtraction(scenario: any, context: ExtractionContext): Promise<ExtractionResult> {
    switch (scenario.type) {
      case 'error':
        return this.handleErrorScenario(scenario, context);
      
      case 'partial':
        return this.handlePartialScenario(scenario, context);
      
      case 'success':
        return this.handleSuccessScenario(scenario, context);
      
      default:
        throw new Error(`Unknown extraction scenario: ${scenario.type}`);
    }
  }

  /**
   * Maneja escenarios de error
   */
  private handleErrorScenario(scenario: any, context: ExtractionContext): ExtractionResult {
    const errors = [
      'Content is private or not accessible',
      'Instagram blocked our extraction attempt',
      'Content has been deleted or moved',
      'Rate limit exceeded, please try again later',
      'Unable to parse visual content',
      'Text content is not in a supported language',
      'Story has expired (stories are only available for 24 hours)'
    ];

    const error = scenario.reason || errors[Math.floor(Math.random() * errors.length)];
    
    return {
      success: false,
      error,
      confidence: 0,
      processingTime: 0,
      warnings: ['Extraction failed completely']
    };
  }

  /**
   * Maneja escenarios de información parcial
   */
  private handlePartialScenario(scenario: any, context: ExtractionContext): ExtractionResult {
    const template = this.selectRandomTemplate();
    const extractedData = this.generateEventData(template, context, true); // Partial = true
    
    const warnings = [
      'Date information could not be extracted reliably',
      'Location information is incomplete',
      'Price information not found',
      'Some hashtags may be missing',
      'Time information is estimated',
      'Event description is partially complete'
    ];

    return {
      success: true,
      data: extractedData,
      confidence: scenario.confidence,
      processingTime: 0,
      warnings: [warnings[Math.floor(Math.random() * warnings.length)]]
    };
  }

  /**
   * Maneja escenarios de éxito completo
   */
  private handleSuccessScenario(scenario: any, context: ExtractionContext): ExtractionResult {
    let template;
    
    if (scenario.eventType === 'random') {
      template = this.selectRandomTemplate();
    } else {
      template = this.selectTemplateByType(scenario.eventType);
    }
    
    const extractedData = this.generateEventData(template, context, false); // Partial = false
    
    const warnings = [];
    
    // Agregar warnings ocasionales incluso en éxito
    if (Math.random() < 0.3) {
      warnings.push('Time information was estimated based on typical event patterns');
    }
    
    if (Math.random() < 0.2) {
      warnings.push('Some event details were inferred from context');
    }

    return {
      success: true,
      data: extractedData,
      confidence: scenario.confidence,
      processingTime: 0,
      warnings
    };
  }

  /**
   * Selecciona un template aleatorio
   */
  private selectRandomTemplate() {
    const allTemplates = MOCK_EVENT_TEMPLATES.flatMap(category => 
      category.templates.map(template => ({
        ...template,
        type: category.type,
        category: category.category
      }))
    );
    
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
  }

  /**
   * Selecciona template por tipo específico
   */
  private selectTemplateByType(eventType: string) {
    const typeMapping: { [key: string]: EventType } = {
      'music': EventType.CONCERT,
      'food': EventType.OTHER,
      'culture': EventType.EXHIBITION,
      'tech': EventType.CONFERENCE,
      'sports': EventType.SPORTS,
      'party': EventType.PARTY
    };

    const targetType = typeMapping[eventType];
    if (!targetType) {
      return this.selectRandomTemplate();
    }

    const matchingCategory = MOCK_EVENT_TEMPLATES.find(cat => cat.type === targetType);
    if (!matchingCategory || matchingCategory.templates.length === 0) {
      return this.selectRandomTemplate();
    }

    const template = matchingCategory.templates[Math.floor(Math.random() * matchingCategory.templates.length)];
    return {
      ...template,
      type: matchingCategory.type,
      category: matchingCategory.category
    };
  }

  /**
   * Genera datos del evento basado en template
   */
  private generateEventData(template: any, context: ExtractionContext, isPartial: boolean): ExtractedData {
    const now = new Date();
    
    // Generar fecha más realista basada en el tipo de evento
    let futureDate: Date;
    const daysFromNow = Math.floor(Math.random() * 90) + 7; // Entre 7 y 97 días
    
    // Ajustar fechas según el tipo de evento
    if (template.type === EventType.CONCERT || template.type === EventType.PARTY) {
      // Conciertos y fiestas suelen ser en fines de semana
      futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 0) { // Domingo
        futureDate.setDate(futureDate.getDate() + 5); // Mover a viernes
      } else if (dayOfWeek === 6) { // Sábado
        futureDate.setDate(futureDate.getDate() - 1); // Mover a viernes
      }
    } else if (template.type === EventType.SPORTS) {
      // Eventos deportivos suelen ser en fines de semana
      futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 0) { // Domingo
        futureDate.setDate(futureDate.getDate() + 5); // Mover a viernes
      } else if (dayOfWeek === 6) { // Sábado
        futureDate.setDate(futureDate.getDate() - 1); // Mover a viernes
      }
    } else {
      // Otros eventos pueden ser cualquier día
      futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
    }
    
    // Generar fecha en formato español
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = futureDate.getDate();
    const month = months[futureDate.getMonth()];
    const year = futureDate.getFullYear();
    
    const dateString = `${day} de ${month} de ${year}`;
    const time = template.timeSlots[Math.floor(Math.random() * template.timeSlots.length)];
    const venue = template.venues[Math.floor(Math.random() * template.venues.length)];
    const price = template.prices[Math.floor(Math.random() * template.prices.length)];

    // Si es parcial, omitir algunos campos aleatoriamente, pero SIEMPRE incluir ubicación
    const includeTime = !isPartial || Math.random() > 0.5;
    const includeLocation = true; // Siempre incluir ubicación
    const includePrice = !isPartial || Math.random() > 0.4;
    const includeHashtags = !isPartial || Math.random() > 0.2;

    return {
      title: template.title,
      description: template.description,
      dateTime: {
        startDate: futureDate.toISOString(),
        startTime: includeTime ? time : undefined,
        timezone: 'Europe/Madrid',
        allDay: !includeTime
      },
      location: includeLocation ? {
        name: venue,
        city: 'Barcelona',
        country: 'España'
      } : undefined,
      type: template.type,
      category: template.category,
      price: includePrice && price > 0 ? {
        amount: price,
        currency: 'EUR',
        tier: price === 0 ? 'free' : 'paid'
      } : undefined,
      tags: includeHashtags ? template.hashtags : [],
      media: {
        images: [{ 
          url: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
          alt: 'Event image'
        }],
        videos: []
      },
      social: {
        hashtags: includeHashtags ? template.hashtags : [],
        mentions: template.mentions
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        processingTime: 0,
        instagramPostId: context.contentId,
        contentType: context.contentType,
        confidence: Math.random() * 0.3 + 0.7,
        confidenceLevel: ExtractionConfidence.HIGH,
        extractorVersion: '2.0.0-ai-simulation',
        errors: [],
        warnings: []
      },
      rawContent: this.generateRawContent(template, dateString, time, venue),
      originalUrl: context.url
    };
  }

  /**
   * Genera contenido raw simulado
   */
  private generateRawContent(template: any, dateString: string, time: string, venue: string): string {
    return `${template.title}

${template.description}

📅 Fecha: ${dateString}
🕒 Hora: ${time}
📍 Lugar: ${venue}

${template.hashtags.join(' ')}
${template.mentions.join(' ')}

¡No te lo pierdas! 🎉`;
  }

  /**
   * Extrae ID de contenido de la URL
   */
  private extractContentId(url: string): string {
    const patterns = [
      /\/p\/([A-Za-z0-9_-]+)\//,
      /\/reel(?:s)?\/([A-Za-z0-9_-]+)\//,
      /\/(?:tv|igtv)\/([A-Za-z0-9_-]+)\//,
      /\/stories\/[^\/]+\/([0-9]+)\//
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return `extracted_${Date.now()}`;
  }

  /**
   * Selecciona razón de error aleatoria
   */
  private selectRandomErrorReason(): string {
    const reasons = [
      'Content detection failed',
      'Text extraction error',
      'Image processing timeout',
      'Content format not supported',
      'Language detection failed',
      'AI model inference error'
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * Utility para delays realistas
   */
  private delay(minMs: number, maxMs?: number): Promise<void> {
    const ms = maxMs ? Math.random() * (maxMs - minMs) + minMs : minMs;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene estadísticas del servicio
   */
  public getStats() {
    return {
      totalExtractions: this.extractionCount,
      lastExtractionTime: this.lastExtractionTime,
      averageProcessingTime: '2.5s',
      successRate: '85%',
      templatesAvailable: MOCK_EVENT_TEMPLATES.reduce((sum, cat) => sum + cat.templates.length, 0)
    };
  }
} 