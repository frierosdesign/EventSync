import { z } from 'zod';

// Función temporal hasta resolver importaciones de módulos compartidos
const detectInstagramContentType = (url: string): string | null => {
  const patterns = {
    post: /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?(\?.*)?$/,
    reel: /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[A-Za-z0-9_-]+\/?(\?.*)?$/,
    igtv: /^https?:\/\/(www\.)?instagram\.com\/(tv|igtv)\/[A-Za-z0-9_-]+\/?(\?.*)?$/,
    story: /^https?:\/\/(www\.)?instagram\.com\/stories\/[A-Za-z0-9_.-]+\/[0-9]+\/?(\?.*)?$/
  };

  if (patterns.post.test(url)) return 'post';
  if (patterns.reel.test(url)) return 'reel';
  if (patterns.igtv.test(url)) return 'igtv';
  if (patterns.story.test(url)) return 'story';
  return null;
};

// Esquema para validar URLs de Instagram
export const instagramUrlSchema = z.object({
  url: z
    .string()
    .min(1, 'La URL es requerida')
    .url('Debe ser una URL válida')
    .regex(
      /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv|igtv|stories)\/[A-Za-z0-9_.-]+\/?[0-9]*\/?(\?.*)?$/,
      'Debe ser una URL válida de Instagram (post, reel, IGTV o story)'
    )
    .refine(
      (url) => {
        // Validación adicional para asegurar que no sea una URL de perfil
        return !url.match(/^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/?$/);
      },
      'La URL debe ser de un post específico, no de un perfil'
    )
});

export type InstagramUrlFormData = z.infer<typeof instagramUrlSchema>;

// Función de validación más específica para posts de Instagram
export const validateInstagramUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    // Validación defensiva
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL inválida' };
    }
    
    instagramUrlSchema.parse({ url });
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.issues[0]?.message || 'URL inválida' 
      };
    }
    return { isValid: false, error: 'Error de validación' };
  }
};

// Validación en tiempo real para mostrar feedback inmediato
export const validateUrlRealtime = (url: string): {
  status: 'idle' | 'typing' | 'valid' | 'invalid';
  message?: string;
} => {
  try {
    // Validación defensiva
    if (!url || typeof url !== 'string') {
      return { status: 'idle' };
    }
    
    if (url.length === 0) {
      return { status: 'idle' };
    }
    
    if (url.length < 10) {
      return { status: 'typing' };
    }
    
    const validation = validateInstagramUrl(url);
    
    if (validation.isValid) {
      return { status: 'valid', message: 'URL válida de Instagram' };
    } else {
      return { status: 'invalid', message: validation.error };
    }
  } catch (error) {
    console.warn('Error en validación en tiempo real:', error);
    return { status: 'idle' };
  }
};

// Regex patterns para diferentes tipos de content de Instagram
export const instagramPatterns = {
  post: /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?(\?.*)?$/,
  reel: /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[A-Za-z0-9_-]+\/?(\?.*)?$/,
  igtv: /^https?:\/\/(www\.)?instagram\.com\/(tv|igtv)\/[A-Za-z0-9_-]+\/?(\?.*)?$/,
  story: /^https?:\/\/(www\.)?instagram\.com\/stories\/[A-Za-z0-9_.-]+\/[0-9]+\/?(\?.*)?$/
};

// Re-exportar la función del módulo shared
export { detectInstagramContentType }; 