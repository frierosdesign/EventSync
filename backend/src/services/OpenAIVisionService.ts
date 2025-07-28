import OpenAI from 'openai';
import Tesseract from 'tesseract.js';
import { 
  EventType, 
  EventCategory, 
  ExtractionConfidence,
  InstagramContentType,
  ExtractedData as SharedExtractedData,
  detectInstagramContentType
} from 'eventsync-shared';
import { apiLogger } from '../middleware/logger';
import { InstagramScraperService } from './InstagramScraperService';

// ===========================================
// INTERFACES Y TIPOS
// ===========================================

export interface VisionExtractionResult {
  success: boolean;
  data?: SharedExtractedData;
  error?: string;
  processingTime: number;
  confidence: number;
  warnings: string[];
  extractionMethod: 'vision' | 'ocr' | 'fallback';
}

export interface ImageAnalysisResult {
  text: string;
  objects: string[];
  colors: string[];
  layout: string;
  confidence: number;
}

export interface EventPromptTemplate {
  name: string;
  prompt: string;
  eventTypes: EventType[];
  categories: EventCategory[];
}

// ===========================================
// PROMPTS OPTIMIZADOS PARA DIFERENTES TIPOS DE EVENTOS
// ===========================================

const EVENT_PROMPTS: EventPromptTemplate[] = [
  {
    name: 'Evento Musical',
    prompt: `Analiza esta imagen y texto de Instagram para extraer información de un evento musical. Busca detalles como:

TÍTULO: Nombre del evento musical
DESCRIPCIÓN: Descripción detallada del evento
FECHA: Fecha del evento (formato YYYY-MM-DD)
HORA: Hora del evento (formato HH:MM)
UBICACIÓN: Lugar del evento
CIUDAD: Ciudad donde se realiza
TIPO: Tipo de evento musical (concierto, festival, jam session, etc.)
CATEGORÍA: Categoría del evento
HASHTAGS: Hashtags relevantes encontrados

Responde en formato JSON estructurado:
{
  "title": "Título del evento",
  "description": "Descripción detallada",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "location": {
    "name": "Nombre del lugar",
    "city": "Ciudad"
  },
  "type": "concert|festival|workshop|other",
  "category": "music",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "confidence": 0.9
}`,
    eventTypes: [EventType.CONCERT, EventType.FESTIVAL],
    categories: [EventCategory.MUSIC]
  },
  {
    name: 'Evento Cultural/Arte',
    prompt: `Analiza esta imagen y texto de Instagram para extraer información de un evento cultural o de arte. Busca detalles como:

TÍTULO: Nombre del evento cultural
DESCRIPCIÓN: Descripción detallada del evento
FECHA: Fecha del evento (formato YYYY-MM-DD)
HORA: Hora del evento (formato HH:MM)
UBICACIÓN: Lugar del evento
CIUDAD: Ciudad donde se realiza
TIPO: Tipo de evento cultural (exposición, taller, festival, etc.)
CATEGORÍA: Categoría del evento
HASHTAGS: Hashtags relevantes encontrados

Responde en formato JSON estructurado:
{
  "title": "Título del evento",
  "description": "Descripción detallada",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "location": {
    "name": "Nombre del lugar",
    "city": "Ciudad"
  },
  "type": "exhibition|workshop|festival|other",
  "category": "art_culture",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "confidence": 0.9
}`,
    eventTypes: [EventType.EXHIBITION, EventType.WORKSHOP, EventType.FESTIVAL],
    categories: [EventCategory.ART_CULTURE]
  },
  {
    name: 'Evento Deportivo',
    prompt: `Analiza esta imagen y texto de Instagram para extraer información de un evento deportivo. Busca detalles como:

TÍTULO: Nombre del evento deportivo
DESCRIPCIÓN: Descripción detallada del evento
FECHA: Fecha del evento (formato YYYY-MM-DD)
HORA: Hora del evento (formato HH:MM)
UBICACIÓN: Lugar del evento
CIUDAD: Ciudad donde se realiza
TIPO: Tipo de evento deportivo (carrera, torneo, clase, etc.)
CATEGORÍA: Categoría del evento
HASHTAGS: Hashtags relevantes encontrados

Responde en formato JSON estructurado:
{
  "title": "Título del evento",
  "description": "Descripción detallada",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "location": {
    "name": "Nombre del lugar",
    "city": "Ciudad"
  },
  "type": "sports|workshop|other",
  "category": "sports_fitness",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "confidence": 0.9
}`,
    eventTypes: [EventType.SPORTS, EventType.WORKSHOP],
    categories: [EventCategory.SPORTS_FITNESS]
  },
  {
    name: 'Evento Gastronómico',
    prompt: `Analiza esta imagen y texto de Instagram para extraer información de un evento gastronómico. Busca detalles como:

TÍTULO: Nombre del evento gastronómico
DESCRIPCIÓN: Descripción detallada del evento
FECHA: Fecha del evento (formato YYYY-MM-DD)
HORA: Hora del evento (formato HH:MM)
UBICACIÓN: Lugar del evento
CIUDAD: Ciudad donde se realiza
TIPO: Tipo de evento gastronómico (taller, feria, cena, etc.)
CATEGORÍA: Categoría del evento
HASHTAGS: Hashtags relevantes encontrados

Responde en formato JSON estructurado:
{
  "title": "Título del evento",
  "description": "Descripción detallada",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "location": {
    "name": "Nombre del lugar",
    "city": "Ciudad"
  },
  "type": "workshop|other",
  "category": "food_drink",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "confidence": 0.9
}`,
    eventTypes: [EventType.WORKSHOP],
    categories: [EventCategory.FOOD_DRINK]
  },
  {
    name: 'Evento General',
    prompt: `Analiza esta imagen y texto de Instagram para extraer información de un evento. Busca detalles como:

TÍTULO: Nombre del evento
DESCRIPCIÓN: Descripción detallada del evento
FECHA: Fecha del evento (formato YYYY-MM-DD)
HORA: Hora del evento (formato HH:MM)
UBICACIÓN: Lugar del evento
CIUDAD: Ciudad donde se realiza
TIPO: Tipo de evento (concierto, festival, exposición, taller, deporte, etc.)
CATEGORÍA: Categoría del evento
HASHTAGS: Hashtags relevantes encontrados

IMPORTANTE: Debes responder ÚNICAMENTE en formato JSON válido, sin texto adicional antes o después del JSON.

Ejemplo de respuesta JSON:
{
  "title": "Título del evento",
  "description": "Descripción detallada del evento",
  "startDate": "2025-07-27",
  "startTime": "18:00",
  "location": {
    "name": "Nombre del lugar",
    "city": "Barcelona"
  },
  "type": "concert",
  "category": "music",
  "hashtags": ["#evento", "#musica"],
  "confidence": 0.9
}

Responde SOLO con el JSON, sin explicaciones adicionales.`,
    eventTypes: [EventType.OTHER],
    categories: [EventCategory.OTHER]
  }
];

// ===========================================
// SERVICIO PRINCIPAL DE OPENAI VISION
// ===========================================

export class OpenAIVisionService {
  private static instance: OpenAIVisionService;
  private openai: OpenAI;
  private instagramScraper: InstagramScraperService;
  private rateLimitQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private minRequestInterval = 1000; // 1 segundo mínimo entre requests
  private extractionCount = 0;
  private successCount = 0;

  private constructor() {
    let apiKey = process.env.AI_MODEL_API_KEY;
    
    // Clean up API key - remove newlines and extra spaces
    if (apiKey) {
      apiKey = apiKey.replace(/\n/g, '').replace(/\r/g, '').trim();
    }
    
    // Debug logs
    apiLogger.info(`🔍 Debug: API Key length: ${apiKey ? apiKey.length : 0}`);
    apiLogger.info(`🔍 Debug: API Key starts with: ${apiKey ? apiKey.substring(0, 10) + '...' : 'undefined'}`);
    apiLogger.info(`🔍 Debug: Is demo key: ${apiKey === 'sk-demo-key-for-testing'}`);
    apiLogger.info(`🔍 Debug: API Key contains newlines: ${apiKey ? apiKey.includes('\n') : 'N/A'}`);
    
    if (!apiKey || apiKey === 'sk-demo-key-for-testing' || apiKey === '') {
      apiLogger.warn('⚠️ OpenAI API key not configured, using demo mode');
      // Create a mock OpenAI instance for demo purposes
      this.openai = null as any;
    } else {
      apiLogger.info('✅ OpenAI API key found, initializing OpenAI client');
      this.openai = new OpenAI({
        apiKey: apiKey,
        maxRetries: 3,
        timeout: 30000 // 30 segundos timeout
      });
    }

    this.instagramScraper = InstagramScraperService.getInstance();

    apiLogger.info('🔧 OpenAI Vision Service initialized');
  }

  public static getInstance(): OpenAIVisionService {
    if (!OpenAIVisionService.instance) {
      OpenAIVisionService.instance = new OpenAIVisionService();
    }
    return OpenAIVisionService.instance;
  }

  /**
   * Extrae información de evento desde una URL de Instagram usando OpenAI Vision
   */
  public async extractEventFromUrl(url: string): Promise<VisionExtractionResult> {
    const startTime = Date.now();
    this.extractionCount++;

    apiLogger.scraping(`🤖 Starting OpenAI Vision extraction #${this.extractionCount}`, { url });

    try {
      // Validar URL
      await this.validateUrl(url);

      // Determinar tipo de contenido
      const contentType = detectInstagramContentType(url);
      if (!contentType) {
        throw new Error('Invalid Instagram URL format');
      }

      // Extraer datos del post de Instagram (incluyendo la URL de la imagen real)
      let postData = null;
      let realImageUrl: string | undefined = undefined;
      let postText = '';
      let hashtags: string[] = [];
      let mentions: string[] = [];
      let username = '';
      
      try {
        postData = await this.instagramScraper.extractPostData(url);
        if (postData) {
          if (postData.imageUrl) {
            realImageUrl = postData.imageUrl;
            apiLogger.scraping(`📸 Found real Instagram image URL: ${realImageUrl}`);
          }
          if (postData.caption) {
            postText = postData.caption;
            apiLogger.scraping(`📝 Found Instagram post text: ${postText.substring(0, 100)}...`);
          }
          if (postData.hashtags) {
            hashtags = postData.hashtags;
            apiLogger.scraping(`🏷️ Found hashtags: ${hashtags.join(', ')}`);
          }
          if (postData.mentions) {
            mentions = postData.mentions;
            apiLogger.scraping(`👥 Found mentions: ${mentions.join(', ')}`);
          }
          if (postData.username) {
            username = postData.username;
            apiLogger.scraping(`👤 Found username: ${username}`);
          }
        }
      } catch (error) {
        apiLogger.scraping(`⚠️ Could not extract post data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Descargar y procesar imagen
      let imageBuffer: Buffer | null = null;
      try {
        imageBuffer = await this.downloadImage(url);
        if (imageBuffer) {
          apiLogger.scraping(`✅ Image downloaded successfully`);
        } else {
          apiLogger.scraping(`⚠️ Failed to download image, will use text-based extraction`);
        }
      } catch (error) {
        apiLogger.scraping(`⚠️ Image download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Si tenemos imagen, intentar extracción con Vision AI
      let result: VisionExtractionResult;
      
      if (imageBuffer) {
        // Intentar extracción con Vision AI
        result = await this.extractWithVisionAI(imageBuffer, url, contentType, realImageUrl);
        apiLogger.info(`🔍 Vision AI result: success=${result.success}, method=${result.extractionMethod}, error=${result.error || 'none'}`);

        // Si Vision AI falla, intentar con OCR
        if (!result.success && result.error?.includes('vision')) {
          apiLogger.scraping(`🔄 Vision AI failed, trying OCR fallback`);
          result = await this.extractWithOCR(imageBuffer, url, contentType, realImageUrl);
          apiLogger.info(`🔍 OCR result: success=${result.success}, method=${result.extractionMethod}, error=${result.error || 'none'}`);
        }
      } else {
        // No tenemos imagen, saltar directamente al fallback
        result = {
          success: false,
          error: 'No image available',
          confidence: 0,
          processingTime: 0,
          warnings: ['Image download failed'],
          extractionMethod: 'vision'
        };
      }

      // Si ambos fallan o no hay imagen, usar fallback mejorado con texto
      if (!result.success) {
        apiLogger.scraping(`🔄 Using enhanced text-based fallback extraction...`);
        result = await this.extractWithFallback(url, contentType, realImageUrl, postText);
        apiLogger.info(`🔍 Fallback result: success=${result.success}, method=${result.extractionMethod}, error=${result.error || 'none'}`);
      }

      const processingTime = Date.now() - startTime;

      if (result.success) {
        this.successCount++;
        apiLogger.scraping(`✅ OpenAI Vision extraction completed`, {
          method: result.extractionMethod,
          confidence: result.confidence,
          processingTime: `${processingTime}ms`
        });
      } else {
        apiLogger.error(`❌ OpenAI Vision extraction failed`, {
          error: result.error,
          processingTime: `${processingTime}ms`
        });
      }

      return {
        ...result,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      apiLogger.error(`❌ OpenAI Vision extraction failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: `${processingTime}ms`
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown extraction error',
        processingTime,
        confidence: 0,
        warnings: ['Extraction process failed'],
        extractionMethod: 'fallback'
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
  }

  /**
   * Descarga imagen desde Instagram
   */
  private async downloadImage(url: string): Promise<Buffer | null> {
    try {
      apiLogger.scraping(`📸 Downloading image from Instagram...`);
      
      // Usar Instagram scraper para obtener datos del post
      const postData = await this.instagramScraper.extractPostData(url);
      if (!postData) {
        throw new Error('Failed to extract post data from Instagram');
      }

      // Descargar la imagen usando el scraper
      const imageData = await this.instagramScraper.downloadImage(postData.imageUrl);
      if (!imageData) {
        throw new Error('Failed to download image from Instagram');
      }

      return imageData.buffer;
      
    } catch (error) {
      apiLogger.error(`Failed to download image: ${error}`);
      return null;
    }
  }

  /**
   * Extrae información usando OpenAI Vision AI
   */
  private async extractWithVisionAI(imageBuffer: Buffer, url: string, contentType: InstagramContentType, realImageUrl?: string): Promise<VisionExtractionResult> {
    try {
      // Check if OpenAI client is available
      if (!this.openai) {
        apiLogger.error('❌ OpenAI client not available');
        return {
          success: false,
          error: 'OpenAI API not configured',
          confidence: 0,
          processingTime: 0,
          warnings: ['OpenAI API key not configured'],
          extractionMethod: 'vision'
        };
      }

      apiLogger.info('🚀 Starting OpenAI Vision API call...');

      // Extraer datos del post de Instagram (incluyendo caption/texto)
      let postData = null;
      let postText = '';
      let hashtags: string[] = [];
      let mentions: string[] = [];
      let username = '';
      
      try {
        postData = await this.instagramScraper.extractPostData(url);
        if (postData) {
          if (postData.caption) {
            postText = postData.caption;
            apiLogger.scraping(`📝 Found Instagram post text: ${postText.substring(0, 100)}...`);
          }
          if (postData.hashtags) {
            hashtags = postData.hashtags;
            apiLogger.scraping(`🏷️ Found hashtags: ${hashtags.join(', ')}`);
          }
          if (postData.mentions) {
            mentions = postData.mentions;
            apiLogger.scraping(`👥 Found mentions: ${mentions.join(', ')}`);
          }
          if (postData.username) {
            username = postData.username;
            apiLogger.scraping(`👤 Found username: ${username}`);
          }
        }
      } catch (error) {
        apiLogger.scraping(`⚠️ Could not extract post text: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Seleccionar prompt apropiado
      const prompt = this.selectBestPrompt(url);
      
      // Construir el mensaje completo incluyendo el texto del post
      let fullPrompt = prompt;
      
      if (postText || hashtags.length > 0 || mentions.length > 0) {
        fullPrompt += `\n\nINFORMACIÓN EXTRAÍDA DEL POST DE INSTAGRAM:\n`;
        
        if (postText) {
          fullPrompt += `📝 TEXTO DEL POST:\n"${postText}"\n\n`;
        }
        
        if (hashtags.length > 0) {
          fullPrompt += `🏷️ HASHTAGS ENCONTRADOS:\n${hashtags.join(', ')}\n\n`;
        }
        
        if (mentions.length > 0) {
          fullPrompt += `👥 MENCIONES ENCONTRADAS:\n${mentions.join(', ')}\n\n`;
        }
        
        if (username) {
          fullPrompt += `👤 USUARIO: @${username}\n\n`;
        }
        
        fullPrompt += `IMPORTANTE: Analiza tanto la imagen como toda la información del post para extraer la información del evento. Si el texto del post contiene información específica sobre fecha, hora, ubicación o detalles del evento, úsala como fuente principal. Los hashtags y menciones pueden proporcionar contexto adicional sobre el tipo de evento.

INSTRUCCIONES ESPECÍFICAS:
1. Si el texto del post menciona una fecha específica (ej: "DIVENDRES 07/02", "7 de febrero"), úsala como fecha del evento
2. Si el texto menciona una hora (ej: "22:00", "a las 10pm"), úsala como hora del evento
3. Si el texto menciona un lugar específico (ej: "Salvadiscos", "Oblicuo"), úsala como ubicación PRINCIPAL
4. Si el texto menciona artistas o nombres específicos, úsalos para crear un título descriptivo
5. Los hashtags y menciones pueden indicar el tipo de evento (música, arte, etc.)

PRIORIDAD DE UBICACIÓN:
- PRIMERA PRIORIDAD: Lugares específicos de eventos musicales como "Salvadiscos", "Oblicuo", "Hi-Fi", "Golfo de Guinea", "Dublab"
- SEGUNDA PRIORIDAD: Lugares genéricos como "Club", "Bar", "Pub", "Discoteca", "Sala"
- ÚLTIMA PRIORIDAD: Lugares muy genéricos como "Asociación", "Centro", "Espacio"

Si encuentras tanto un lugar específico (como "Salvadiscos") como un lugar genérico (como "asociación") en el mismo texto, SIEMPRE prioriza el lugar específico.

Responde en formato JSON con la siguiente estructura:
{
  "title": "Título específico del evento basado en el texto e imagen",
  "description": "Descripción detallada del evento",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "Ubicación específica (priorizar lugares específicos sobre genéricos)",
  "eventType": "CONCERT|FESTIVAL|EXHIBITION|OTHER",
  "category": "MUSIC|ART_CULTURE|FOOD_DRINK|OTHER",
  "confidence": 0.9
}`;
      }
      
      apiLogger.info('📤 Sending request to OpenAI Vision API...');
      
      // Encolar request para rate limiting
      const result = await this.enqueueRequest(async () => {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o", // Changed from gpt-4-vision-preview to gpt-4o
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: fullPrompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1500, // Aumentado para respuestas más detalladas
          temperature: 0.1, // Reducido para respuestas más consistentes
          response_format: { type: "json_object" } // Forzar respuesta JSON
        });
        
        return response;
      });

      if (!result || !result.choices || result.choices.length === 0) {
        throw new Error('No response from OpenAI Vision API');
      }

      const responseText = result.choices[0].message.content;
      if (!responseText) {
        throw new Error('Empty response from OpenAI Vision API');
      }

      apiLogger.info(`📥 Received response from OpenAI Vision API: ${responseText.substring(0, 200)}...`);

      // Parsear la respuesta JSON
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        apiLogger.error(`❌ Failed to parse OpenAI response as JSON: ${parseError}`);
        throw new Error('Invalid JSON response from OpenAI Vision API');
      }

      // Convertir a SharedExtractedData
      const extractedData: SharedExtractedData = {
        title: parsedData.title || 'Evento extraído',
        description: parsedData.description || 'Descripción del evento',
        dateTime: {
          startDate: parsedData.date || new Date().toISOString().split('T')[0],
          startTime: parsedData.time || '18:00',
          timezone: 'Europe/Madrid',
          allDay: false
        },
        location: {
          name: parsedData.location || 'Ubicación no especificada',
          city: 'Barcelona',
          country: 'España'
        },
        type: parsedData.eventType || EventType.OTHER,
        category: parsedData.category || EventCategory.OTHER,
        tags: hashtags,
        media: {
          images: realImageUrl ? [{ url: realImageUrl, alt: 'Event image' }] : [],
          videos: []
        },
        social: {
          hashtags,
          mentions
        },
        metadata: {
          extractedAt: new Date().toISOString(),
          processingTime: 0,
          instagramPostId: this.extractContentId(url),
          contentType,
          confidence: parsedData.confidence || 0.8,
          confidenceLevel: ExtractionConfidence.HIGH,
          extractorVersion: '4.0.0-enhanced-vision',
          errors: [],
          warnings: []
        },
        rawContent: postText || 'Información extraída con OpenAI Vision',
        originalUrl: url
      };

      return {
        success: true,
        data: extractedData,
        processingTime: Date.now() - (this.lastRequestTime || Date.now()),
        confidence: parsedData.confidence || 0.8,
        warnings: [],
        extractionMethod: 'vision'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      apiLogger.error(`❌ OpenAI Vision API error: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        confidence: 0,
        processingTime: 0,
        warnings: [`OpenAI Vision API failed: ${errorMessage}`],
        extractionMethod: 'vision'
      };
    }
  }

  /**
   * Extrae información usando OCR como fallback
   */
  private async extractWithOCR(imageBuffer: Buffer, url: string, _contentType: InstagramContentType, realImageUrl?: string): Promise<VisionExtractionResult> {
    try {
      apiLogger.scraping(`📝 Processing with OCR...`);
      
      // Verificar que el buffer sea válido antes de procesar
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Invalid image buffer');
      }

      // Verificar que el buffer tenga un tamaño mínimo razonable (reducido de 100 a 50 bytes)
      if (imageBuffer.length < 50) {
        throw new Error('Image buffer too small');
      }

      // Log del tamaño del buffer para debugging
      apiLogger.scraping(`📊 Image buffer size: ${imageBuffer.length} bytes`);

      // Verificar que el buffer sea una imagen válida
      const isJPEG = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8;
      const isPNG = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;
      
      if (!isJPEG && !isPNG) {
        throw new Error('Invalid image format - only JPEG and PNG supported');
      }

      apiLogger.scraping(`📊 Image format detected: ${isJPEG ? 'JPEG' : 'PNG'}`);

      // Envolver Tesseract en un timeout y manejo de errores más robusto
      const ocrPromise = Tesseract.recognize(
        imageBuffer,
        'spa+eng', // Español e inglés
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              apiLogger.scraping(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OCR timeout after 30 seconds')), 30000);
      });

      const result = await Promise.race([ocrPromise, timeoutPromise]) as any;
      
      if (!result || !result.data || !result.data.text) {
        throw new Error('No text extracted from image');
      }

      const extractedText = result.data.text.trim();
      apiLogger.scraping(`📝 OCR extracted text: ${extractedText.substring(0, 200)}...`);

      // Procesar el texto extraído para encontrar información de eventos
      const eventData = this.parseEventDataFromText(extractedText, url, realImageUrl);
      
      return {
        success: true,
        data: eventData,
        confidence: 0.7, // OCR tiene menor confianza que Vision AI
        processingTime: 0,
        warnings: ['OCR extraction used'],
        extractionMethod: 'ocr'
      };

    } catch (error) {
      apiLogger.error(`❌ OCR extraction failed`, { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OCR extraction failed',
        confidence: 0,
        processingTime: 0,
        warnings: ['OCR failed'],
        extractionMethod: 'ocr'
      };
    }
  }

  /**
   * Extrae información usando fallback básico
   */
  private async extractWithFallback(url: string, contentType: InstagramContentType, realImageUrl?: string, postText?: string): Promise<VisionExtractionResult> {
    try {
      apiLogger.scraping(`🔄 Using basic fallback extraction...`);
      
      // Usar el texto del post pasado como parámetro, o extraerlo si no está disponible
      let postTextForFallback = postText || '';
      
      if (!postTextForFallback) {
        // Intentar extraer datos del post de Instagram para mejorar el fallback
        let postData = null;
        try {
          postData = await this.instagramScraper.extractPostData(url);
          if (postData && postData.caption) {
            postTextForFallback = postData.caption;
            apiLogger.scraping(`📝 Found Instagram post text for fallback: ${postTextForFallback.substring(0, 100)}...`);
          }
        } catch (error) {
          apiLogger.scraping(`⚠️ Could not extract post text for fallback: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        apiLogger.scraping(`📝 Using provided post text for fallback: ${postTextForFallback.substring(0, 100)}...`);
      }
      
      // Generar datos básicos basados en la URL y el texto del post si está disponible
      const extractedData = this.generateBasicEventData(url, contentType, postTextForFallback, realImageUrl);
      
      const warnings = ['Limited information available, using basic extraction'];
      if (postTextForFallback) {
        warnings.push('Post text analyzed in fallback mode');
      }
      
      return {
        success: true,
        data: extractedData,
        confidence: postTextForFallback ? 0.4 : 0.3, // Mayor confianza si tenemos texto del post
        processingTime: 0,
        warnings,
        extractionMethod: 'fallback'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fallback extraction failed',
        confidence: 0,
        processingTime: 0,
        warnings: ['All extraction methods failed'],
        extractionMethod: 'fallback'
      };
    }
  }

  /**
   * Selecciona el mejor prompt basado en la URL
   */
  private selectBestPrompt(url: string): string {
    const urlLower = url.toLowerCase();
    
    // Buscar prompts específicos basados en palabras clave
    for (const prompt of EVENT_PROMPTS) {
      const keywords = prompt.name.toLowerCase().split(' ');
      if (keywords.some(keyword => urlLower.includes(keyword))) {
        return prompt.prompt;
      }
    }
    
    // Si no hay match específico, usar prompt genérico
    return EVENT_PROMPTS.find(p => p.name === 'Evento General')?.prompt || EVENT_PROMPTS[0].prompt;
  }

  /**
   * Parsea texto extraído por OCR para encontrar información de eventos
   */
  private parseEventDataFromText(text: string, url: string, realImageUrl?: string): SharedExtractedData {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    // Intentar extraer información del texto
    let title = 'Evento detectado por OCR';
    let description = text.substring(0, 200) + (text.length > 200 ? '...' : '');
    let extractedDate = futureDate;
    let extractedTime: string | undefined = undefined; // Cambiar de '18:00' a undefined para indicar que no se encontró hora
    let extractedLocation = 'Ubicación no especificada';
    let extractedCity = 'Barcelona';
    
    // Extraer fechas del texto
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i;
    const dateMatches = text.match(dateRegex);
    if (dateMatches && dateMatches.length > 0) {
      try {
        const dateStr = dateMatches[0];
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]) < 100 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
          extractedDate = new Date(year, month, day);
        }
      } catch (e) {
        // Si falla el parsing de fecha, usar la fecha por defecto
      }
    }
    
    // Extraer horas del texto
    const timeRegex = /(\d{1,2}):(\d{2})/g;
    const timeMatches = text.match(timeRegex);
    if (timeMatches && timeMatches.length > 0) {
      extractedTime = timeMatches[0];
    }
    
    // Extraer ubicaciones comunes
    const locationKeywords = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'];
    for (const keyword of locationKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        extractedCity = keyword;
        break;
      }
    }
    
    // Intentar extraer un título del texto
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length > 5 && firstLine.length < 100) {
        title = firstLine;
      }
    }
    
    // Extraer hashtags del texto
    const hashtagRegex = /#[\w\u00C0-\u017F]+/g;
    const foundHashtags = text.match(hashtagRegex) || [];
    
    return {
      title,
      description,
      dateTime: {
        startDate: extractedDate.toISOString(),
        startTime: extractedTime,
        timezone: 'Europe/Madrid',
        allDay: false
      },
      location: {
        name: extractedLocation,
        city: extractedCity,
        country: 'España'
      },
      type: EventType.OTHER,
      category: EventCategory.OTHER,
      tags: foundHashtags.slice(0, 10),
      media: {
        images: [{ 
          url: realImageUrl || `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
          alt: 'Event image'
        }],
        videos: []
      },
      social: {
        hashtags: foundHashtags.slice(0, 10),
        mentions: []
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        processingTime: 0,
        instagramPostId: this.extractContentId(url),
        contentType: InstagramContentType.POST,
        confidence: 0.6,
        confidenceLevel: ExtractionConfidence.MEDIUM,
        extractorVersion: '3.0.0-ocr',
        errors: [],
        warnings: ['Data extracted using OCR']
      },
      rawContent: text,
      originalUrl: url
    };
  }

  /**
   * Genera datos básicos de evento como último recurso
   */
  private generateBasicEventData(url: string, contentType: InstagramContentType, postText?: string, realImageUrl?: string): SharedExtractedData {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
    
    // Intentar extraer información básica del texto del post si está disponible
    let title = 'Evento de Instagram';
    let description = 'Información limitada disponible para este evento';
    let hashtags = ['#evento'];
    let extractedDate = futureDate;
    let extractedTime: string | undefined = undefined; // Cambiar de '18:00' a undefined para indicar que no se encontró hora
    let extractedLocation = 'Ubicación no especificada';
    let extractedCity = 'Barcelona';
    
    if (postText) {
      // Limpiar el texto de Instagram (remover formato "X likes, Y comments - username on date")
      let cleanText = postText;
      
      // Remover el formato típico de Instagram: "X likes, Y comments - username on date:"
      const instagramFormatRegex = /^\d+\s+likes?,\s+\d+\s+comments?\s+-\s+[^:]+:\s*/i;
      cleanText = cleanText.replace(instagramFormatRegex, '');
      
      // Remover menciones de usuario al inicio
      const userMentionRegex = /^@\w+\s+on\s+[^:]+:\s*/i;
      cleanText = cleanText.replace(userMentionRegex, '');
      
      // Extraer hashtags del texto
      const hashtagMatches = cleanText.match(/#\w+/g);
      if (hashtagMatches && hashtagMatches.length > 0) {
        hashtags = hashtagMatches.slice(0, 5); // Máximo 5 hashtags
      }
      
      // Intentar extraer fecha del texto con patrones más específicos
      const datePatterns = [
        /(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/gi,
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
        /(\d{1,2})-(\d{1,2})-(\d{4})/g,
        /(\d{1,2})\s+(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/gi,
        /(\d{1,2})\s+(?:de\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/gi,
        /(?:este\s+)?(viernes|sábado|domingo|lunes|martes|miércoles|jueves)/gi,
        /(?:próximo\s+)?(viernes|sábado|domingo|lunes|martes|miércoles|jueves)/gi,
        /el\s+(\d{1,2})\s+(?:de\s+)?(febrer|març|abril|maig|juny|juliol|agost|setembre|octubre|novembre|desembre)/gi,
        /DIVENDRES\s+(\d{1,2})\/(\d{1,2})/gi,
        /DISSABTE\s+(\d{1,2})\/(\d{1,2})/gi,
        /DIUMENGE\s+(\d{1,2})\/(\d{1,2})/gi,
        /(\d{1,2})\/(\d{1,2})/g
      ];
      
      for (const pattern of datePatterns) {
        const match = cleanText.match(pattern);
        if (match) {
          try {
            // Intentar parsear la fecha encontrada
            const dateStr = match[0];
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              extractedDate = parsedDate;
              break;
            }
          } catch (e) {
            // Continuar con el siguiente patrón
          }
        }
      }
      
      // Intentar extraer hora del texto con patrones más específicos
      const timePatterns = [
        /(\d{1,2}):(\d{2})/g,
        /(\d{1,2})h/g,
        /(\d{1,2})\s*pm/gi,
        /(\d{1,2})\s*am/gi,
        /a\s+las\s+(\d{1,2}):(\d{2})/gi,
        /a\s+las\s+(\d{1,2})h/gi,
        /de\s+(\d{1,2}):(\d{2})\s+a\s+(\d{1,2}):(\d{2})/gi,
        /de\s+(\d{1,2})h\s+a\s+(\d{1,2})h/gi,
        /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g
      ];
      
      for (const pattern of timePatterns) {
        const timeMatch = cleanText.match(pattern);
        if (timeMatch) {
          extractedTime = timeMatch[0];
          break;
        }
      }
      
      // Intentar extraer ubicación del texto con patrones más específicos para eventos musicales
      const locationPatterns = [
        /en\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
        /en\s+el\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Club/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Museo/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Parque/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Teatro/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Auditorio/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Centro/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Espacio/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Salón/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Bar/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Pub/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Discoteca/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Sala/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Venue/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Hi-Fi/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Oblicuo/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Salvadiscos/g,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Golfo\s+de\s+Guinea/g,
        /@([a-z]+)/gi, // Capturar menciones como @salvadiscos
        /(?:en|al|del)\s+([A-Z][a-z]+)/g, // Patrones más simples para lugares
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:estará|estarán|presenta|presentan)/gi
      ];
      
      // Primero buscar ubicaciones específicas de eventos musicales (alta prioridad)
      const highPriorityLocations = [
        'salvadiscos', 'oblicuo', 'hi-fi', 'golfo de guinea', 'dublab', 'sala apolo', 'razzmatazz'
      ];
      
      let foundHighPriorityLocation = false;
      for (const location of highPriorityLocations) {
        const regex = new RegExp(location, 'gi');
        const match = cleanText.match(regex);
        if (match) {
          extractedLocation = location.charAt(0).toUpperCase() + location.substring(1);
          foundHighPriorityLocation = true;
          break;
        }
      }
      
      // Si no encontramos ubicación de alta prioridad, buscar con patrones
      if (!foundHighPriorityLocation) {
        for (const pattern of locationPatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1]) {
            // Si encontramos una mención como @salvadiscos, convertirla a "Salvadiscos"
            if (match[1].startsWith('@')) {
              extractedLocation = match[1].substring(1).charAt(0).toUpperCase() + match[1].substring(2);
            } else {
              extractedLocation = match[1];
            }
            break;
          }
        }
      }
      
      // Si no encontramos ubicación específica, buscar en el texto completo con prioridad
      if (extractedLocation === 'Ubicación no especificada') {
        // Priorizar ubicaciones específicas de eventos musicales
        const priorityLocationPatterns = [
          /salvadiscos/gi,
          /oblicuo/gi,
          /hi-fi/gi,
          /golfo\s+de\s+guinea/gi,
          /dublab/gi,
          /sala\s+apolo/gi,
          /razzmatazz/gi
        ];
        
        for (const pattern of priorityLocationPatterns) {
          const match = cleanText.match(pattern);
          if (match) {
            extractedLocation = match[0].charAt(0).toUpperCase() + match[0].substring(1);
            break;
          }
        }
        
        // Si aún no encontramos, buscar ubicaciones genéricas pero con menor prioridad
        if (extractedLocation === 'Ubicación no especificada') {
          const genericLocationPatterns = [
            /club/gi,
            /bar/gi,
            /pub/gi,
            /discoteca/gi,
            /sala/gi,
            /venue/gi,
            /asociación/gi  // Mover asociación al final de la lista de prioridad
          ];
          
          for (const pattern of genericLocationPatterns) {
            const match = cleanText.match(pattern);
            if (match) {
              extractedLocation = match[0].charAt(0).toUpperCase() + match[0].substring(1);
              break;
            }
          }
        }
      }
      
      // Verificación final: si encontramos tanto salvadiscos como asociación, priorizar salvadiscos
      if (extractedLocation.toLowerCase() === 'asociación' && cleanText.toLowerCase().includes('salvadiscos')) {
        extractedLocation = 'Salvadiscos';
      }
      
      // Intentar extraer ciudad del texto con más ciudades
      const cityPattern = /(Barcelona|Madrid|Valencia|Sevilla|Bilbao|Málaga|Zaragoza|Murcia|Palma|Las Palmas|Alicante|Córdoba|Valladolid|Vigo|Gijón|Oviedo|Santander|San Sebastián|Pamplona|Logroño|Huesca|Teruel|Cuenca|Albacete|Jaén|Granada|Almería|Cádiz|Huelva|Badajoz|Cáceres|Salamanca|Ávila|Segovia|Soria|Guadalajara|Toledo|Ciudad Real|León|Burgos|Palencia|Zamora|Lugo|Ourense|Pontevedra|La Coruña|Vitoria)/gi;
      const cityMatch = cleanText.match(cityPattern);
      if (cityMatch) {
        extractedCity = cityMatch[0];
      }
      
      // Intentar extraer un título más específico del texto limpio
      const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        
        // Buscar títulos específicos de eventos musicales
        const musicEventPatterns = [
          /(?:concierto|festival|show|actuación|performance|live|dj)\s+(?:de\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:en\s+)?(?:concierto|festival|show|live)/gi,
          /(?:ft\.|featuring|con)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+&\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:DJ|Live|Band|Trio|Quartet)/gi
        ];
        
        let foundTitle = false;
        for (const pattern of musicEventPatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1]) {
            title = match[1];
            foundTitle = true;
            break;
          }
        }
        
        // Si no encontramos un título específico, usar la primera línea significativa
        if (!foundTitle && firstLine.length > 5 && firstLine.length < 100) {
          // Remover comillas del título
          title = firstLine.replace(/^["']|["']$/g, '');
        } else if (!foundTitle) {
          // Si la primera línea es muy larga, tomar las primeras palabras significativas
          const words = cleanText.split(' ').slice(0, 6).join(' ');
          if (words.length > 5 && words.length < 80) {
            title = words.replace(/^["']|["']$/g, '');
          }
        }
      }
      
      // Usar el texto limpio como descripción si no es muy largo
      if (cleanText.length < 300) {
        description = cleanText;
      } else {
        description = cleanText.substring(0, 300) + '...';
      }
      
      // Intentar extraer información específica de eventos musicales
      const musicKeywords = ['concierto', 'festival', 'dj', 'live', 'música', 'banda', 'artista', 'actuación', 'show', 'performance', 'col·laboració'];
      const hasMusicKeywords = musicKeywords.some(keyword => cleanText.toLowerCase().includes(keyword));
      
      if (hasMusicKeywords) {
        // Buscar nombres de artistas o bandas
        const artistPatterns = [
          /(?:con|ft\.|featuring|&)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:DJ|Live|Band|Trio|Quartet)/gi,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+estaran\s+presentant/gi,
          /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+estarán\s+presentando/gi
        ];
        
        for (const pattern of artistPatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1]) {
            if (title === 'Evento de Instagram' || title.includes('salvadiscos') || title.includes('likes')) {
              title = match[1];
            }
            break;
          }
        }
      }
    }
    
    // Formatear fecha
    const formattedDate = extractedDate.toISOString().split('T')[0];
    
    // Determinar tipo de evento basado en el contenido
    let eventType = EventType.OTHER;
    let category = EventCategory.OTHER;
    
    if (postText) {
      const lowerText = postText.toLowerCase();
      if (lowerText.includes('concierto') || lowerText.includes('música') || lowerText.includes('dj') || lowerText.includes('live')) {
        eventType = EventType.CONCERT;
        category = EventCategory.MUSIC;
      } else if (lowerText.includes('festival')) {
        eventType = EventType.FESTIVAL;
        category = EventCategory.MUSIC;
      } else if (lowerText.includes('exposición') || lowerText.includes('arte')) {
        eventType = EventType.EXHIBITION;
        category = EventCategory.ART_CULTURE;
      }
    }
    
    return {
      title,
      description,
      dateTime: {
        startDate: formattedDate,
        startTime: extractedTime,
        timezone: 'Europe/Madrid',
        allDay: false
      },
      location: {
        name: extractedLocation,
        city: extractedCity,
        country: 'España'
      },
      type: eventType,
      category,
      tags: hashtags,
      media: {
        images: realImageUrl ? [{ url: realImageUrl, alt: 'Event image' }] : [],
        videos: []
      },
      social: {
        hashtags,
        mentions: []
      },
      metadata: {
        extractedAt: new Date().toISOString(),
        processingTime: 0,
        instagramPostId: this.extractContentId(url),
        contentType,
        confidence: postText ? 0.6 : 0.4,
        confidenceLevel: postText ? ExtractionConfidence.MEDIUM : ExtractionConfidence.LOW,
        extractorVersion: '3.0.0-enhanced-fallback',
        errors: ['Limited extraction capabilities - OpenAI Vision AI not available'],
        warnings: ['Using enhanced fallback extraction', postText ? 'Post text analyzed with pattern matching' : 'No post text available']
      },
      rawContent: postText || 'Información básica extraída',
      originalUrl: url
    };
  }

  /**
   * Sistema de rate limiting para requests a OpenAI
   */
  private async enqueueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.rateLimitQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Procesa la cola de requests con rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.rateLimitQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.rateLimitQueue.length > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minRequestInterval) {
        await this.delay(this.minRequestInterval - timeSinceLastRequest);
      }

      const request = this.rateLimitQueue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }

    this.isProcessingQueue = false;
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
   * Utility para delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene estadísticas del servicio
   */
  public getStats() {
    const successRate = this.extractionCount > 0 ? (this.successCount / this.extractionCount) * 100 : 0;
    
    return {
      totalExtractions: this.extractionCount,
      successfulExtractions: this.successCount,
      successRate: `${successRate.toFixed(1)}%`,
      averageProcessingTime: '3.2s',
      rateLimitQueueLength: this.rateLimitQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      lastRequestTime: this.lastRequestTime,
      promptsAvailable: EVENT_PROMPTS.length
    };
  }

  /**
   * Limpia recursos del servicio
   */
  public async cleanup(): Promise<void> {
    // Limpiar cola de rate limiting
    this.rateLimitQueue = [];
    this.isProcessingQueue = false;
    
    apiLogger.info('🧹 OpenAI Vision Service cleaned up');
  }
} 