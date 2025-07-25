import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  ReactNode,
  useMemo 
} from 'react';
import { apiClient, ApiError, ApiErrorType } from '../lib/api-client';
import { Event, ExtractedData, HealthResponse } from '../types';

// ===========================================
// TIPOS DEL ESTADO GLOBAL
// ===========================================

export interface AppState {
  // Estado de la aplicación
  isOnline: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  
  // Estado de eventos
  events: {
    items: Event[];
    total: number;
    loading: boolean;
    error: string | null;
    lastFetch: number | null;
    filters: {
      search: string;
      dateFrom?: string;
      dateTo?: string;
      category?: string;
      type?: string;
    };
    pagination: {
      page: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  
  // Estado de extracción actual
  extraction: {
    loading: boolean;
    progress: number;
    currentUrl: string | null;
    result: {
      event: Event | null;
      extractedData: ExtractedData | null;
      confidence: number;
      processingTime: number;
    } | null;
    error: {
      message: string;
      type: ApiErrorType;
      retryCount: number;
    } | null;
    history: Array<{
      url: string;
      timestamp: number;
      success: boolean;
      event?: Event;
      error?: string;
    }>;
  };
  
  // Cache de requests
  cache: {
    health: {
      data: HealthResponse | null;
      timestamp: number | null;
      ttl: number; // Time to live in ms
    };
    events: Map<string, {
      data: Event[];
      timestamp: number;
      ttl: number;
    }>;
    stats: {
      data: any;
      timestamp: number | null;
      ttl: number;
    };
  };
  
  // Configuración de usuario
  userSettings: {
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    notifications: boolean;
    autoRetry: boolean;
    debugMode: boolean;
  };
  
  // Estado de notificaciones
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    autoHide: boolean;
    duration?: number;
  }>;
}

// Acciones del reducer
export type AppAction =
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connected' | 'disconnected' | 'reconnecting' }
  | { type: 'FETCH_EVENTS_START' }
  | { type: 'FETCH_EVENTS_SUCCESS'; payload: { events: Event[]; total: number; page: number; hasNext: boolean; hasPrev: boolean } }
  | { type: 'FETCH_EVENTS_ERROR'; payload: string }
  | { type: 'SET_EVENTS_FILTERS'; payload: Partial<AppState['events']['filters']> }
  | { type: 'SET_EVENTS_PAGINATION'; payload: Partial<AppState['events']['pagination']> }
  | { type: 'EXTRACTION_START'; payload: string }
  | { type: 'EXTRACTION_PROGRESS'; payload: number }
  | { type: 'EXTRACTION_SUCCESS'; payload: { event: Event; extractedData: ExtractedData; processingTime: number } }
  | { type: 'EXTRACTION_ERROR'; payload: { message: string; type: ApiErrorType; retryCount: number } }
  | { type: 'EXTRACTION_CLEAR' }
  | { type: 'CACHE_SET'; payload: { key: string; data: any; ttl?: number } }
  | { type: 'CACHE_CLEAR'; payload?: string }
  | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<AppState['userSettings']> }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppState['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

// Estado inicial
const initialState: AppState = {
  isOnline: navigator.onLine,
  connectionStatus: 'connected',
  
  events: {
    items: [],
    total: 0,
    loading: false,
    error: null,
    lastFetch: null,
    filters: {
      search: '',
    },
    pagination: {
      page: 1,
      limit: 10,
      hasNext: false,
      hasPrev: false
    }
  },
  
  extraction: {
    loading: false,
    progress: 0,
    currentUrl: null,
    result: null,
    error: null,
    history: []
  },
  
  cache: {
    health: {
      data: null,
      timestamp: null,
      ttl: 30000 // 30 segundos
    },
    events: new Map(),
    stats: {
      data: null,
      timestamp: null,
      ttl: 60000 // 1 minuto
    }
  },
  
  userSettings: {
    theme: 'auto',
    language: 'es',
    notifications: true,
    autoRetry: true,
    debugMode: false
  },
  
  notifications: []
};

// ===========================================
// REDUCER
// ===========================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
        connectionStatus: action.payload ? 'connected' : 'disconnected'
      };
      
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload
      };
      
    case 'FETCH_EVENTS_START':
      return {
        ...state,
        events: {
          ...state.events,
          loading: true,
          error: null
        }
      };
      
    case 'FETCH_EVENTS_SUCCESS':
      return {
        ...state,
        events: {
          ...state.events,
          loading: false,
          items: action.payload.events,
          total: action.payload.total,
          lastFetch: Date.now(),
          pagination: {
            ...state.events.pagination,
            page: action.payload.page,
            hasNext: action.payload.hasNext,
            hasPrev: action.payload.hasPrev
          }
        }
      };
      
    case 'FETCH_EVENTS_ERROR':
      return {
        ...state,
        events: {
          ...state.events,
          loading: false,
          error: action.payload
        }
      };
      
    case 'SET_EVENTS_FILTERS':
      return {
        ...state,
        events: {
          ...state.events,
          filters: {
            ...state.events.filters,
            ...action.payload
          },
          pagination: {
            ...state.events.pagination,
            page: 1 // Reset to first page when filtering
          }
        }
      };
      
    case 'SET_EVENTS_PAGINATION':
      return {
        ...state,
        events: {
          ...state.events,
          pagination: {
            ...state.events.pagination,
            ...action.payload
          }
        }
      };
      
    case 'EXTRACTION_START':
      return {
        ...state,
        extraction: {
          ...state.extraction,
          loading: true,
          progress: 0,
          currentUrl: action.payload,
          result: null,
          error: null
        }
      };
      
    case 'EXTRACTION_PROGRESS':
      return {
        ...state,
        extraction: {
          ...state.extraction,
          progress: action.payload
        }
      };
      
    case 'EXTRACTION_SUCCESS':
      return {
        ...state,
        extraction: {
          ...state.extraction,
          loading: false,
          progress: 100,
          result: {
            event: action.payload.event,
            extractedData: action.payload.extractedData,
            confidence: action.payload.extractedData.metadata.confidence,
            processingTime: action.payload.processingTime
          },
          history: [
            {
              url: state.extraction.currentUrl!,
              timestamp: Date.now(),
              success: true,
              event: action.payload.event
            },
            ...state.extraction.history.slice(0, 9) // Keep last 10
          ]
        }
      };
      
    case 'EXTRACTION_ERROR':
      return {
        ...state,
        extraction: {
          ...state.extraction,
          loading: false,
          error: action.payload,
          history: [
            {
              url: state.extraction.currentUrl!,
              timestamp: Date.now(),
              success: false,
              error: action.payload.message
            },
            ...state.extraction.history.slice(0, 9)
          ]
        }
      };
      
    case 'EXTRACTION_CLEAR':
      return {
        ...state,
        extraction: {
          ...initialState.extraction
        }
      };
      
    case 'CACHE_SET':
      const { key, data, ttl = 300000 } = action.payload; // Default 5 minutes
      return {
        ...state,
        cache: {
          ...state.cache,
          [key]: {
            data,
            timestamp: Date.now(),
            ttl
          }
        }
      };
      
    case 'CACHE_CLEAR':
      if (action.payload) {
        const { [action.payload]: _, ...restCache } = state.cache as any;
        return {
          ...state,
          cache: restCache
        };
      }
      return {
        ...state,
        cache: initialState.cache
      };
      
    case 'UPDATE_USER_SETTINGS':
      return {
        ...state,
        userSettings: {
          ...state.userSettings,
          ...action.payload
        }
      };
      
    case 'ADD_NOTIFICATION':
      const notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications.slice(0, 4)] // Keep max 5
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
      
    default:
      return state;
  }
}

// ===========================================
// CONTEXT Y PROVIDER
// ===========================================

interface AppContextValue {
  state: AppState;
  actions: {
    // Eventos
    fetchEvents: (filters?: Partial<AppState['events']['filters']>) => Promise<void>;
    setEventsFilters: (filters: Partial<AppState['events']['filters']>) => void;
    setEventsPagination: (pagination: Partial<AppState['events']['pagination']>) => void;
    
    // Extracción
    extractEvent: (url: string) => Promise<void>;
    clearExtraction: () => void;
    
    // Cache
    clearCache: (key?: string) => void;
    getCachedData: (key: string) => any;
    
    // Configuración
    updateUserSettings: (settings: Partial<AppState['userSettings']>) => void;
    
    // Notificaciones
    addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    
    // Utilidades
    checkHealth: () => Promise<HealthResponse | null>;
    retry: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

// ===========================================
// PROVIDER COMPONENT
// ===========================================

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    const autoHideNotifications = state.notifications.filter(n => n.autoHide);
    
    autoHideNotifications.forEach(notification => {
      const timeout = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
      }, notification.duration || 5000);
      
      return () => clearTimeout(timeout);
    });
  }, [state.notifications]);

  // Actions
  const actions = useMemo(() => ({
    fetchEvents: async (filters?: Partial<AppState['events']['filters']>) => {
      try {
        dispatch({ type: 'FETCH_EVENTS_START' });
        
        if (filters) {
          dispatch({ type: 'SET_EVENTS_FILTERS', payload: filters });
        }
        
        const currentFilters = { ...state.events.filters, ...filters };
        const pagination = state.events.pagination;
        
        const response = await apiClient.getEvents({
          page: pagination.page,
          limit: pagination.limit,
          search: currentFilters.search || undefined
        });
        
        if (response.success) {
          dispatch({
            type: 'FETCH_EVENTS_SUCCESS',
            payload: {
              events: response.data.events,
              total: response.data.total,
              page: response.data.page,
              hasNext: response.data.page * pagination.limit < response.data.total,
              hasPrev: response.data.page > 1
            }
          });
        }
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Error fetching events';
        dispatch({ type: 'FETCH_EVENTS_ERROR', payload: message });
      }
    },

    setEventsFilters: (filters: Partial<AppState['events']['filters']>) => {
      dispatch({ type: 'SET_EVENTS_FILTERS', payload: filters });
    },

    setEventsPagination: (pagination: Partial<AppState['events']['pagination']>) => {
      dispatch({ type: 'SET_EVENTS_PAGINATION', payload: pagination });
    },

    extractEvent: async (url: string) => {
      try {
        dispatch({ type: 'EXTRACTION_START', payload: url });
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          dispatch({ type: 'EXTRACTION_PROGRESS', payload: Math.min(90, state.extraction.progress + 10) });
        }, 500);

        const response = await apiClient.extractEvent({ url });
        
        clearInterval(progressInterval);
        
        if (response.success && response.data) {
          dispatch({
            type: 'EXTRACTION_SUCCESS',
            payload: {
              event: response.data.event,
              extractedData: response.data.extracted,
              processingTime: Date.now() - (state.extraction as any).startTime || 0
            }
          });
          
          actions.addNotification({
            type: 'success',
            title: 'Extracción exitosa',
            message: `Evento "${response.data.event.title}" extraído correctamente`,
            autoHide: true
          });
        } else {
          throw new Error(response.error || 'Extraction failed');
        }
      } catch (error) {
        if (error instanceof ApiError) {
          dispatch({
            type: 'EXTRACTION_ERROR',
            payload: {
              message: error.message,
              type: error.type,
              retryCount: error.retryCount
            }
          });
        } else {
          dispatch({
            type: 'EXTRACTION_ERROR',
            payload: {
              message: error instanceof Error ? error.message : 'Error desconocido',
              type: ApiErrorType.UNKNOWN_ERROR,
              retryCount: 0
            }
          });
        }
        
        actions.addNotification({
          type: 'error',
          title: 'Error en extracción',
          message: error instanceof Error ? error.message : 'Error desconocido',
          autoHide: true
        });
      }
    },

    clearExtraction: () => {
      dispatch({ type: 'EXTRACTION_CLEAR' });
    },

    clearCache: (key?: string) => {
      dispatch({ type: 'CACHE_CLEAR', payload: key });
    },

    getCachedData: (key: string) => {
      const cached = (state.cache as any)[key];
      if (!cached || !cached.timestamp) return null;
      
      const isExpired = Date.now() - cached.timestamp > cached.ttl;
      return isExpired ? null : cached.data;
    },

    updateUserSettings: (settings: Partial<AppState['userSettings']>) => {
      dispatch({ type: 'UPDATE_USER_SETTINGS', payload: settings });
    },

    addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    },

    removeNotification: (id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    },

    clearNotifications: () => {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    },

    checkHealth: async () => {
      try {
        const cached = actions.getCachedData('health');
        if (cached) return cached;
        
        const health = await apiClient.health();
        dispatch({ type: 'CACHE_SET', payload: { key: 'health', data: health, ttl: 30000 } });
        
        return health;
      } catch (error) {
        console.error('Health check failed:', error);
        return null;
      }
    },

    retry: async () => {
      if (state.extraction.currentUrl) {
        await actions.extractEvent(state.extraction.currentUrl);
      }
    }
  }), [state]);

  const contextValue: AppContextValue = {
    state,
    actions
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// ===========================================
// CUSTOM HOOK
// ===========================================

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 