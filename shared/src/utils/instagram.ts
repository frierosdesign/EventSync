import { InstagramContentType } from '../types/models';

// ===========================================
// CONSTANTES PARA INSTAGRAM
// ===========================================

/**
 * Patrones regex para diferentes tipos de contenido de Instagram
 */
export const INSTAGRAM_URL_PATTERNS = {
  post: /^https?:\/\/(www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)\/?(\?.*)?$/,
  reel: /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/([A-Za-z0-9_-]+)\/?(\?.*)?$/,
  igtv: /^https?:\/\/(www\.)?instagram\.com\/(tv|igtv)\/([A-Za-z0-9_-]+)\/?(\?.*)?$/,
  story: /^https?:\/\/(www\.)?instagram\.com\/stories\/([A-Za-z0-9_.-]+)\/([0-9]+)\/?(\?.*)?$/,
  profile: /^https?:\/\/(www\.)?instagram\.com\/([A-Za-z0-9_.-]+)\/?(\?.*)?$/
} as const;

/**
 * Parámetros de URL que deben ser removidos para limpiar URLs
 */
export const TRACKING_PARAMETERS = [
  'utm_source',
  'utm_medium', 
  'utm_campaign',
  'utm_content',
  'utm_term',
  'igshid',
  'igsh',
  'hl',
  'gclid',
  'fbclid'
] as const;

/**
 * Dominios válidos de Instagram
 */
export const INSTAGRAM_DOMAINS = [
  'instagram.com',
  'www.instagram.com'
] as const;

// ===========================================
// FUNCIONES DE ANÁLISIS DE URLs
// ===========================================

/**
 * Analiza una URL de Instagram y extrae información detallada
 */
export interface InstagramUrlAnalysis {
  isValid: boolean;
  contentType?: InstagramContentType;
  contentId?: string;
  username?: string;
  storyId?: string;
  originalUrl: string;
  cleanUrl?: string;
  domain: string;
  errors: string[];
}

/**
 * Analiza una URL de Instagram de forma exhaustiva
 */
export function analyzeInstagramUrl(url: string): InstagramUrlAnalysis {
  const result: InstagramUrlAnalysis = {
    isValid: false,
    originalUrl: url,
    domain: '',
    errors: []
  };

  try {
    const urlObj = new URL(url);
    result.domain = urlObj.hostname;

    // Verificar dominio
    if (!INSTAGRAM_DOMAINS.includes(urlObj.hostname as any)) {
      result.errors.push('Domain is not from Instagram');
      return result;
    }

    // Limpiar URL
    result.cleanUrl = cleanInstagramUrl(url);

    // Analizar tipo de contenido
    for (const [type, pattern] of Object.entries(INSTAGRAM_URL_PATTERNS)) {
      const match = url.match(pattern);
      
      if (match) {
        result.isValid = true;
        result.contentType = type as InstagramContentType;

        switch (type) {
          case 'post':
            result.contentId = match[2];
            break;
          case 'reel':
            result.contentId = match[3];
            break;
          case 'igtv':
            result.contentId = match[3];
            break;
          case 'story':
            result.username = match[2];
            result.storyId = match[3];
            result.contentId = `${result.username}/${result.storyId}`;
            break;
        }
        break;
      }
    }

    if (!result.isValid) {
      result.errors.push('URL does not match any supported Instagram content type');
    }

  } catch (error) {
    result.errors.push('Invalid URL format');
  }

  return result;
}

/**
 * Limpia una URL de Instagram removiendo parámetros innecesarios
 */
export function cleanInstagramUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remover parámetros de tracking
    TRACKING_PARAMETERS.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    // Asegurar protocolo HTTPS
    urlObj.protocol = 'https:';

    // Normalizar dominio
    if (urlObj.hostname === 'instagram.com') {
      urlObj.hostname = 'www.instagram.com';
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Detecta el tipo de contenido de Instagram
 */
export function detectInstagramContentType(url: string): InstagramContentType | null {
  for (const [type, pattern] of Object.entries(INSTAGRAM_URL_PATTERNS)) {
    if (pattern.test(url) && type !== 'profile') {
      return type as InstagramContentType;
    }
  }
  return null;
}

/**
 * Extrae el ID del contenido de una URL de Instagram
 */
export function extractInstagramContentId(url: string): string | null {
  const analysis = analyzeInstagramUrl(url);
  return analysis.contentId || null;
}

/**
 * Extrae el nombre de usuario de una URL de story
 */
export function extractUsernameFromStory(url: string): string | null {
  const match = url.match(INSTAGRAM_URL_PATTERNS.story);
  return match ? match[2] : null;
}

/**
 * Verifica si una URL es de Instagram
 */
export function isInstagramUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return INSTAGRAM_DOMAINS.includes(urlObj.hostname as any);
  } catch {
    return false;
  }
}

/**
 * Verifica si una URL es de contenido específico (no perfil)
 */
export function isInstagramContentUrl(url: string): boolean {
  const contentType = detectInstagramContentType(url);
  return contentType !== null;
}

/**
 * Valida una URL de Instagram contra criterios específicos
 */
export interface InstagramUrlValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  normalizedUrl?: string;
}

/**
 * Valida una URL de Instagram de forma completa
 */
export function validateInstagramUrl(url: string): InstagramUrlValidation {
  const result: InstagramUrlValidation = {
    isValid: false,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!url || typeof url !== 'string') {
    result.errors.push('URL is required');
    return result;
  }

  if (url.length > 2048) {
    result.errors.push('URL is too long (max 2048 characters)');
    return result;
  }

  try {
    const urlObj = new URL(url);
    
    // Verificar protocolo
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      result.errors.push('Invalid protocol (must be HTTP or HTTPS)');
      return result;
    }

    // Sugerir HTTPS
    if (urlObj.protocol === 'http:') {
      result.warnings.push('Consider using HTTPS for better security');
      result.suggestions.push('Use https:// instead of http://');
    }

    // Verificar dominio
    if (!INSTAGRAM_DOMAINS.includes(urlObj.hostname as any)) {
      result.errors.push('URL must be from Instagram');
      return result;
    }

    // Sugerir www
    if (urlObj.hostname === 'instagram.com') {
      result.suggestions.push('Consider using www.instagram.com for consistency');
    }

    // Verificar que sea contenido específico
    const contentType = detectInstagramContentType(url);
    if (!contentType) {
      result.errors.push('URL must point to specific Instagram content (post, reel, IGTV, or story)');
      return result;
    }

    // URL válida
    result.isValid = true;
    result.normalizedUrl = cleanInstagramUrl(url);

    // Sugerir limpiar parámetros si es necesario
    if (result.normalizedUrl !== url) {
      result.suggestions.push('Remove tracking parameters for cleaner URL');
    }

  } catch {
    result.errors.push('Invalid URL format');
  }

  return result;
}

// ===========================================
// UTILIDADES DE PARSING
// ===========================================

/**
 * Información extraída del contexto de la URL
 */
export interface InstagramUrlContext {
  contentType: InstagramContentType;
  contentId: string;
  username?: string;
  isPublic: boolean;
  estimatedReachability: 'high' | 'medium' | 'low';
  scrapingDifficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Analiza el contexto de accesibilidad de una URL de Instagram
 */
export function analyzeInstagramUrlContext(url: string): InstagramUrlContext | null {
  const analysis = analyzeInstagramUrl(url);
  
  if (!analysis.isValid || !analysis.contentType || !analysis.contentId) {
    return null;
  }

  const context: InstagramUrlContext = {
    contentType: analysis.contentType,
    contentId: analysis.contentId,
    username: analysis.username,
    isPublic: true, // Asumimos público por defecto
    estimatedReachability: 'medium',
    scrapingDifficulty: 'medium'
  };

  // Ajustar dificultad según tipo de contenido
  switch (analysis.contentType) {
    case InstagramContentType.POST:
      context.estimatedReachability = 'high';
      context.scrapingDifficulty = 'easy';
      break;
    case InstagramContentType.REEL:
      context.estimatedReachability = 'high';
      context.scrapingDifficulty = 'medium';
      break;
    case InstagramContentType.IGTV:
      context.estimatedReachability = 'medium';
      context.scrapingDifficulty = 'medium';
      break;
    case InstagramContentType.STORY:
      context.estimatedReachability = 'low'; // Stories son temporales
      context.scrapingDifficulty = 'hard';
      break;
  }

  return context;
}

/**
 * Genera una URL de backup o alternativa
 */
export function generateBackupUrls(url: string): string[] {
  const analysis = analyzeInstagramUrl(url);
  const backups: string[] = [];

  if (!analysis.isValid || !analysis.contentId) {
    return backups;
  }

  try {
    const urlObj = new URL(url);

    // Versión limpia
    backups.push(cleanInstagramUrl(url));

    // Versión sin www
    if (urlObj.hostname.startsWith('www.')) {
      const noWwwUrl = url.replace('www.instagram.com', 'instagram.com');
      backups.push(cleanInstagramUrl(noWwwUrl));
    }

    // Versión con www
    if (!urlObj.hostname.startsWith('www.')) {
      const wwwUrl = url.replace('instagram.com', 'www.instagram.com');
      backups.push(cleanInstagramUrl(wwwUrl));
    }

  } catch {
    // Si hay error, solo devolver array vacío
  }

  // Remover duplicados y URL original
  return Array.from(new Set(backups)).filter(backup => backup !== url);
}

// ===========================================
// UTILIDADES DE METADATA
// ===========================================

/**
 * Información de metadata esperada según tipo de contenido
 */
export interface ExpectedMetadata {
  hasCaption: boolean;
  hasLocation: boolean;
  hasHashtags: boolean;
  hasMentions: boolean;
  hasImages: boolean;
  hasVideos: boolean;
  isTemporary: boolean;
  maxAge: number; // días
}

/**
 * Obtiene metadata esperada según el tipo de contenido
 */
export function getExpectedMetadata(contentType: InstagramContentType): ExpectedMetadata {
  const base: ExpectedMetadata = {
    hasCaption: true,
    hasLocation: true,
    hasHashtags: true,
    hasMentions: true,
    hasImages: false,
    hasVideos: false,
    isTemporary: false,
    maxAge: 365
  };

  switch (contentType) {
    case InstagramContentType.POST:
      return {
        ...base,
        hasImages: true,
        hasVideos: true,
        maxAge: 365 * 5 // Posts duran años
      };

    case InstagramContentType.REEL:
      return {
        ...base,
        hasVideos: true,
        maxAge: 365 * 2 // Reels tienen buena longevidad
      };

    case InstagramContentType.IGTV:
      return {
        ...base,
        hasVideos: true,
        maxAge: 365 * 3 // IGTV puede durar bastante
      };

    case InstagramContentType.STORY:
      return {
        ...base,
        hasLocation: false, // Menos común en stories
        hasImages: true,
        hasVideos: true,
        isTemporary: true,
        maxAge: 1 // Stories duran 24 horas
      };

    default:
      return base;
  }
}

/**
 * Calcula la probabilidad de que un contenido aún esté disponible
 */
export function calculateAvailabilityProbability(
  contentType: InstagramContentType,
  estimatedAge: number // días
): number {
  const metadata = getExpectedMetadata(contentType);
  
  if (metadata.isTemporary && estimatedAge > metadata.maxAge) {
    return 0; // Contenido temporal ya expirado
  }

  if (estimatedAge <= 30) return 0.95; // Muy reciente
  if (estimatedAge <= 90) return 0.85; // Reciente
  if (estimatedAge <= 365) return 0.75; // Dentro del año
  if (estimatedAge <= 365 * 2) return 0.6; // Hasta 2 años
  
  return Math.max(0.3, 1 - (estimatedAge / (metadata.maxAge * 365))); // Degradación gradual
} 