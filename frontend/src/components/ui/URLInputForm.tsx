import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Instagram, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Play,
  Image,
  Video
} from 'lucide-react';

import { 
  instagramUrlSchema, 
  InstagramUrlFormData, 
  validateUrlRealtime,
  detectInstagramContentType 
} from '../../lib/validations';

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface URLInputFormProps {
  onSubmit: (data: InstagramUrlFormData) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const URLInputForm: React.FC<URLInputFormProps> = ({
  onSubmit,
  isLoading = false,
  disabled = false,
  className = '',
  autoFocus = false
}) => {
  const [urlStatus, setUrlStatus] = useState<'idle' | 'typing' | 'valid' | 'invalid'>('idle');
  const [contentType, setContentType] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    reset
  } = useForm<InstagramUrlFormData>({
    resolver: zodResolver(instagramUrlSchema),
    mode: 'onChange',
    defaultValues: {
      url: ''
    }
  });

  const watchedUrl = watch('url');
  const debouncedUrl = useDebounce(watchedUrl || '', 300);

  // Validación en tiempo real con debounce y manejo de errores
  useEffect(() => {
    try {
      if (!debouncedUrl) {
        setUrlStatus('idle');
        setContentType(null);
        return;
      }

      const validation = validateUrlRealtime(debouncedUrl);
      setUrlStatus(validation.status);
      
      if (validation.status === 'valid') {
        const type = detectInstagramContentType(debouncedUrl);
        setContentType(type);
      } else {
        setContentType(null);
      }
    } catch (error) {
      console.warn('Error en validación:', error);
      setUrlStatus('idle');
      setContentType(null);
    }
  }, [debouncedUrl]);

  const handleFormSubmit = useCallback(async (data: InstagramUrlFormData) => {
    try {
      await onSubmit(data);
      reset();
      setUrlStatus('idle');
      setContentType(null);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  }, [onSubmit, reset]);

  const getStatusIcon = useCallback(() => {
    switch (urlStatus) {
      case 'valid':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'typing':
        return <ExternalLink className="h-5 w-5 text-gray-400" />;
      default:
        return <Instagram className="h-5 w-5 text-gray-400" />;
    }
  }, [urlStatus]);

  const getContentTypeIcon = useCallback(() => {
    switch (contentType) {
      case 'post':
        return <Image className="h-4 w-4" />;
      case 'reel':
        return <Play className="h-4 w-4" />;
      case 'igtv':
        return <Video className="h-4 w-4" />;
      default:
        return null;
    }
  }, [contentType]);

  const getBorderColor = useCallback(() => {
    if (errors.url) return 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500';
    if (urlStatus === 'valid') return 'border-green-300 focus-within:border-green-500 focus-within:ring-green-500';
    if (urlStatus === 'invalid') return 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500';
    return 'border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500';
  }, [errors.url, urlStatus]);

  const canSubmit = useMemo(() => 
    isValid && isDirty && !isLoading && !disabled && urlStatus === 'valid',
    [isValid, isDirty, isLoading, disabled, urlStatus]
  );

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Campo de URL */}
        <div className="space-y-3">
          <label 
            htmlFor="instagram-url" 
            className="block text-sm font-semibold text-gray-700"
          >
            URL de Instagram
          </label>
          
          <div className="relative">
            {/* Contenedor del input con animaciones */}
            <motion.div
              layout
              className={`
                relative border-2 rounded-xl overflow-hidden
                transition-all duration-300 ease-in-out
                ${getBorderColor()}
                ${disabled || isLoading ? 'bg-gray-50 opacity-75' : 'bg-white'}
                focus-within:ring-2 focus-within:ring-offset-2
              `}
            >
              {/* Icono izquierdo */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <motion.div
                  key={urlStatus}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {getStatusIcon()}
                </motion.div>
              </div>
              
              {/* Input */}
              <input
                {...register('url')}
                id="instagram-url"
                type="url"
                placeholder="https://www.instagram.com/p/..."
                autoFocus={autoFocus}
                disabled={disabled || isLoading}
                aria-describedby={errors.url ? 'url-error' : 'url-help'}
                aria-invalid={!!errors.url}
                className={`
                  w-full pl-12 pr-16 py-4 text-base
                  placeholder-gray-400 text-gray-900
                  border-0 focus:ring-0 focus:outline-none
                  transition-all duration-200
                  ${disabled || isLoading ? 'cursor-not-allowed' : ''}
                `}
              />
              
              {/* Indicadores derechos */}
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
                {/* Indicador de tipo de contenido */}
                <AnimatePresence>
                  {contentType && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {getContentTypeIcon()}
                      <span className="capitalize">{contentType}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Loading spinner */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Mensajes de estado */}
          <AnimatePresence mode="wait">
            {errors.url && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                id="url-error"
                role="alert"
                className="flex items-center space-x-2 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.url.message}</span>
              </motion.div>
            )}
            
            {!errors.url && urlStatus === 'valid' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2 text-sm text-green-600"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>URL válida de Instagram detectada</span>
              </motion.div>
            )}
            
            {!errors.url && urlStatus === 'idle' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                id="url-help"
                className="text-xs text-gray-500"
              >
                Acepta URLs de posts, reels, IGTV y stories de Instagram
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Botón de envío */}
        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileTap={{ scale: 0.98 }}
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-base
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${canSubmit
              ? `bg-gradient-to-r from-blue-600 to-purple-600 text-white
                 hover:from-blue-700 hover:to-purple-700 
                 focus:ring-blue-500 shadow-lg hover:shadow-xl
                 transform-gpu`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-2"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Extrayendo evento...</span>
              </motion.div>
            ) : (
              <motion.div
                key="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-2"
              >
                <Instagram className="h-5 w-5" />
                <span>Extraer Evento</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
    </div>
  );
}; 