import { useState, useCallback } from 'react';
import { apiClient, ApiError, ApiErrorType } from '../lib/api-client';
import { Event, ExtractedData } from '../types';

// ===========================================
// TIPOS DE ESTADO
// ===========================================

export interface ExtractionState {
  isLoading: boolean;
  loadingStep?: 'scraping' | 'processing' | 'analyzing';
  error: string | null;
  errorType: ApiErrorType | null;
  event: Event | null;
  extractedData: ExtractedData | null;
  isSuccess: boolean;
  processingTime?: number;
  retryCount?: number;
}

export interface UseEventExtractionReturn {
  state: ExtractionState;
  extractEvent: (url: string) => Promise<void>;
  clearState: () => void;
  clearError: () => void;
  retry: () => Promise<void>;
}

// ===========================================
// HOOK PRINCIPAL
// ===========================================

export const useEventExtraction = (): UseEventExtractionReturn => {
  const [state, setState] = useState<ExtractionState>({
    isLoading: false,
    error: null,
    errorType: null,
    event: null,
    extractedData: null,
    isSuccess: false
  });

  const [lastUrl, setLastUrl] = useState<string>('');

  const clearState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      errorType: null,
      event: null,
      extractedData: null,
      isSuccess: false
    });
    setLastUrl('');
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null,
      errorType: null 
    }));
  }, []);

  const extractEvent = useCallback(async (url: string) => {
    const startTime = Date.now();
    setLastUrl(url);
    
    setState({
      isLoading: true,
      loadingStep: 'scraping',
      error: null,
      errorType: null,
      event: null,
      extractedData: null,
      isSuccess: false
    });

    try {
      console.log('[useEventExtraction] Starting extraction for:', url);
      
      // Simular progreso de los pasos
      const progressTimer = setTimeout(() => {
        setState(prev => ({ ...prev, loadingStep: 'processing' }));
      }, 5000);
      
      const response = await apiClient.extractEvent({ url });
      clearTimeout(progressTimer);
      
      const processingTime = Date.now() - startTime;

      if (response.success && response.data) {
        console.log('[useEventExtraction] Extraction successful:', response.data);
        
        setState({
          isLoading: false,
          error: null,
          errorType: null,
          event: response.data.event,
          extractedData: response.data.extracted,
          isSuccess: true,
          processingTime
        });
      } else {
        throw new Error(response.error || 'Extraction failed without specific error');
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error('[useEventExtraction] Extraction failed:', error);

      if (error instanceof ApiError) {
        let errorMessage = error.message;
        
        // Mensajes más específicos para diferentes tipos de error
        if (error.type === ApiErrorType.TIMEOUT_ERROR) {
          errorMessage = 'La extracción está tomando más tiempo del esperado. Esto puede deberse a que Instagram está procesando la solicitud. Por favor, intenta de nuevo en unos momentos.';
        } else if (error.type === ApiErrorType.NETWORK_ERROR) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
        } else if (error.type === ApiErrorType.SERVER_ERROR) {
          errorMessage = 'Error en el servidor. El sistema está procesando tu solicitud, pero ha ocurrido un problema. Por favor, intenta de nuevo.';
        }
        
        setState({
          isLoading: false,
          error: errorMessage,
          errorType: error.type,
          event: null,
          extractedData: null,
          isSuccess: false,
          processingTime,
          retryCount: error.retryCount
        });
      } else {
        setState({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
          errorType: ApiErrorType.UNKNOWN_ERROR,
          event: null,
          extractedData: null,
          isSuccess: false,
          processingTime
        });
      }
    }
  }, []);

  const retry = useCallback(async () => {
    if (lastUrl) {
      await extractEvent(lastUrl);
    }
  }, [lastUrl, extractEvent]);

  return {
    state,
    extractEvent,
    clearState,
    clearError,
    retry
  };
}; 