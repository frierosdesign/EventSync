import { useState, useCallback } from 'react';
import { apiClient, ApiError, ApiErrorType } from '../lib/api-client';
import { Event, ExtractedData } from '../types';

// ===========================================
// TIPOS DE ESTADO
// ===========================================

export interface ExtractionState {
  isLoading: boolean;
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
      error: null,
      errorType: null,
      event: null,
      extractedData: null,
      isSuccess: false
    });

    try {
      console.log('[useEventExtraction] Starting extraction for:', url);
      
      const response = await apiClient.extractEvent({ url });
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
        setState({
          isLoading: false,
          error: error.message,
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