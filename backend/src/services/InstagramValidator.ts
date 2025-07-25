import { ValidationConfig } from '../types';
import { isValidUrl, isInstagramUrl, isValidInstagramContentUrl } from '../middleware/validation';
import { detectInstagramContentType } from 'eventsync-shared';

/**
 * Servicio para validar y analizar URLs de Instagram
 */
export class InstagramValidator {
  private config: ValidationConfig;

  constructor(config?: Partial<ValidationConfig>) {
    this.config = {
      instagram: {
        allowedPatterns: [
          /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?(\?.*)?$/, // Posts
          /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[A-Za-z0-9_-]+\/?(\?.*)?$/, // Reels
          /^https?:\/\/(www\.)?instagram\.com\/(tv|igtv)\/[A-Za-z0-9_-]+\/?(\?.*)?$/, // IGTV
        ],
        blockedPatterns: [
          /^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/?$/, // User profiles
          /^https?:\/\/(www\.)?instagram\.com\/explore\/.*$/, // Explore pages
          /^https?:\/\/(www\.)?instagram\.com\/stories\/.*$/, // Stories (temporal)
        ],
        maxUrlLength: 2048,
        ...config?.instagram
      }
    };
  }

  /**
   * Valida completamente una URL de Instagram
   */
  public validateUrl(url: string): {
    isValid: boolean;
    contentType?: 'post' | 'reel' | 'igtv';
    errors: string[];
    metadata: {
      originalUrl: string;
      normalizedUrl: string;
      postId?: string;
    };
  } {
    const errors: string[] = [];
    let contentType: 'post' | 'reel' | 'igtv' | undefined;
    let postId: string | undefined;

    // Validar formato básico de URL
    if (!isValidUrl(url)) {
      errors.push('URL format is invalid');
    }

    // Validar longitud de URL
    if (url.length > this.config.instagram.maxUrlLength) {
      errors.push(`URL exceeds maximum length of ${this.config.instagram.maxUrlLength} characters`);
    }

    // Validar que sea de Instagram
    if (!isInstagramUrl(url)) {
      errors.push('URL is not from Instagram');
    }

    // Validar que sea contenido específico (no perfil)
    if (!isValidInstagramContentUrl(url)) {
      errors.push('URL must be from a specific Instagram post, reel, or IGTV');
    }

    // Validar contra patrones bloqueados
    const isBlocked = this.config.instagram.blockedPatterns.some(pattern => pattern.test(url));
    if (isBlocked) {
      errors.push('URL type is not supported (profiles, explore pages, etc.)');
    }

    // Si pasa todas las validaciones, extraer información
    if (errors.length === 0) {
      const detectedType = detectInstagramContentType(url);
      if (detectedType && ['post', 'reel', 'igtv'].includes(detectedType)) {
        contentType = detectedType as 'post' | 'reel' | 'igtv';
      }
      postId = this.extractPostId(url);
    }

    const normalizedUrl = this.normalizeUrl(url);

    return {
      isValid: errors.length === 0,
      contentType,
      errors,
      metadata: {
        originalUrl: url,
        normalizedUrl,
        postId
      }
    };
  }

  /**
   * Normaliza una URL de Instagram removiendo parámetros innecesarios
   */
  public normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remover parámetros de tracking comunes
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'igshid', 'hl'];
      paramsToRemove.forEach(param => {
        urlObj.searchParams.delete(param);
      });

      // Asegurar protocolo HTTPS
      urlObj.protocol = 'https:';

      // Asegurar dominio www
      if (urlObj.hostname === 'instagram.com') {
        urlObj.hostname = 'www.instagram.com';
      }

      return urlObj.toString();
    } catch {
      return url; // Return original if normalization fails
    }
  }

  /**
   * Extrae el ID del post de una URL de Instagram
   */
  public extractPostId(url: string): string | undefined {
    const patterns = [
      /\/p\/([A-Za-z0-9_-]+)/, // Posts
      /\/(reel|reels)\/([A-Za-z0-9_-]+)/, // Reels
      /\/(tv|igtv)\/([A-Za-z0-9_-]+)/, // IGTV
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[match.length - 1]; // Last capture group
      }
    }

    return undefined;
  }

  /**
   * Verifica si una URL ya ha sido procesada (para evitar duplicados)
   */
  public async checkIfProcessed(_url: string): Promise<boolean> {
    // TODO: Implementar verificación en base de datos
    // Por ahora, siempre devuelve false
    return false;
  }

  /**
   * Estima la complejidad de extracción basada en el tipo de contenido
   */
  public estimateExtractionComplexity(contentType: 'post' | 'reel' | 'igtv'): {
    difficulty: 'low' | 'medium' | 'high';
    estimatedTime: number; // milliseconds
    confidenceScore: number; // 0-1
  } {
    switch (contentType) {
      case 'post':
        return {
          difficulty: 'low',
          estimatedTime: 2000,
          confidenceScore: 0.85
        };
      case 'reel':
        return {
          difficulty: 'medium',
          estimatedTime: 3500,
          confidenceScore: 0.75
        };
      case 'igtv':
        return {
          difficulty: 'high',
          estimatedTime: 5000,
          confidenceScore: 0.65
        };
      default:
        return {
          difficulty: 'high',
          estimatedTime: 6000,
          confidenceScore: 0.5
        };
    }
  }

  /**
   * Genera recomendaciones para mejorar la calidad de la URL
   */
  public getUrlRecommendations(url: string): {
    suggestions: string[];
    optimizedUrl?: string;
  } {
    const suggestions: string[] = [];
    let optimizedUrl: string | undefined;

    try {
      const urlObj = new URL(url);

      // Sugerir HTTPS si es HTTP
      if (urlObj.protocol === 'http:') {
        suggestions.push('Consider using HTTPS for better security');
        urlObj.protocol = 'https:';
        optimizedUrl = urlObj.toString();
      }

      // Sugerir www si no está presente
      if (urlObj.hostname === 'instagram.com') {
        suggestions.push('Using www subdomain for consistency');
        urlObj.hostname = 'www.instagram.com';
        optimizedUrl = urlObj.toString();
      }

      // Sugerir remover parámetros innecesarios
      const unnecessaryParams = ['utm_source', 'utm_medium', 'utm_campaign', 'igshid'];
      const hasUnnecessaryParams = unnecessaryParams.some(param => 
        urlObj.searchParams.has(param)
      );

      if (hasUnnecessaryParams) {
        suggestions.push('Remove tracking parameters for cleaner URL');
        unnecessaryParams.forEach(param => urlObj.searchParams.delete(param));
        optimizedUrl = urlObj.toString();
      }

    } catch {
      suggestions.push('URL format appears to be invalid');
    }

    return {
      suggestions,
      optimizedUrl
    };
  }
} 