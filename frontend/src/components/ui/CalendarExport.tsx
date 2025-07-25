import React, { useState } from 'react';
import { Calendar, Settings, Copy, CheckCircle, AlertCircle, ExternalLink, Clock, AlertTriangle } from 'lucide-react';

// Tipos temporales hasta resolver importaciones de módulos compartidos
interface CalendarExportOptions {
  timezone?: string;
  includeInstagramUrl?: boolean;
  includeHashtags?: boolean;
  includeExtractedMetadata?: boolean;
}

interface Event {
  title: string;
  description?: string;
  dateTime: {
    startDate: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    timezone?: string;
    allDay?: boolean;
  };
  location?: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  price?: {
    amount: number;
    currency: string;
    tier: 'free' | 'paid';
    description?: string;
  };
  organizer?: {
    name: string;
    instagramHandle?: string;
  };
  social?: {
    hashtags?: string[];
    mentions?: string[];
  };
  urls?: {
    instagram?: string;
  };
}

interface ExtractedData extends Event {
  originalUrl?: string;
  metadata?: any;
  rawContent?: string;
  [key: string]: any; // Allow any additional properties
}

// Función para decodificar texto URI codificado
const decodeText = (text: string): string => {
  if (!text) return '';
  
  // Verificar si el texto está codificado
  if (text.includes('%') || text.includes('+')) {
    try {
      return decodeURIComponent(text.replace(/\+/g, '%20'));
    } catch (error) {
      console.warn('Error decoding text:', error);
      return text;
    }
  }
  return text;
};

// Función mejorada de codificación URI
const encodeForUrl = (text: string): string => {
  return encodeURIComponent(text)
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
};

// Función para limpiar el título
const sanitizeTitle = (title: string): string => {
  return title
    .trim()
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 100); // Google Calendar tiene límite de caracteres
};

const generateGoogleCalendarUrl = (event: Event | ExtractedData, options: CalendarExportOptions = {}): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams();

  // Título - decodificar y enviar sin codificar (URLSearchParams lo maneja automáticamente)
  const decodedTitle = decodeText(event.title || '');
  params.append('text', sanitizeTitle(decodedTitle));

  // Fechas
  if (event.dateTime?.startDate) {
    const startDate = formatDateForGoogleCalendar(event.dateTime.startDate, event.dateTime.startTime, event.dateTime.allDay);
    const endDate = formatDateForGoogleCalendar(
      event.dateTime.endDate || event.dateTime.startDate,
      event.dateTime.endTime || event.dateTime.startTime,
      event.dateTime.allDay
    );
    params.append('dates', `${startDate}/${endDate}`);
  }

  // Descripción
  let description = decodeText(event.description || '');
  if (options.includeInstagramUrl && 'originalUrl' in event && event.originalUrl) {
    description += `\n\nVer en Instagram: ${event.originalUrl}`;
  }
  if (description) {
    params.append('details', description);
  }

  // Ubicación
  if (event.location) {
    let locationString: string;
    
    if (typeof event.location === 'string') {
      locationString = decodeText(event.location);
    } else if (typeof event.location === 'object') {
      const locationParts = [
        decodeText(event.location.name || ''),
        decodeText(event.location.address || ''),
        decodeText(event.location.city || ''),
        decodeText(event.location.country || '')
      ].filter(Boolean);
      locationString = locationParts.join(', ');
    } else {
      locationString = '';
    }
    
    if (locationString) {
      params.append('location', locationString);
    }
  }

  return `${baseUrl}&${params.toString()}`;
};

// Funciones de conveniencia
const generateGoogleCalendarUrlFromEvent = (event: Event, options: CalendarExportOptions = {}): string => {
  return generateGoogleCalendarUrl(event, options);
};

const generateGoogleCalendarUrlFromExtractedData = (data: ExtractedData, options: CalendarExportOptions = {}): string => {
  return generateGoogleCalendarUrl(data, options);
};

const formatDateForGoogleCalendar = (dateString: string, timeString?: string, isAllDay?: boolean): string => {
  const date = new Date(dateString);
  
  if (isAllDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
  
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

const validateEventForExport = (event: Event | ExtractedData): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} => {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  if (!event.title?.trim()) {
    missingFields.push('Título');
  }

  if (!event.dateTime?.startDate) {
    missingFields.push('Fecha de inicio');
  }

  if (!event.description) {
    warnings.push('Descripción');
  }

  if (!event.location) {
    warnings.push('Ubicación');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
};

// ===========================================
// TIPOS Y INTERFACES
// ===========================================

export interface CalendarExportProps {
  event?: Event;
  extractedData?: ExtractedData;
  className?: string;
  variant?: 'button' | 'card' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showOptions?: boolean;
  defaultOptions?: CalendarExportOptions;
  onExportStart?: () => void;
  onExportComplete?: (url: string) => void;
  onExportError?: (error: string) => void;
}

interface ExportState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  lastUrl: string | null;
}

// ===========================================
// COMPONENTE PRINCIPAL
// ===========================================

export const CalendarExport: React.FC<CalendarExportProps> = ({
  event,
  extractedData,
  className = '',
  variant = 'button',
  size = 'md',
  showOptions = false,
  defaultOptions = {},
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [exportState, setExportState] = useState<ExportState>({
    isLoading: false,
    isSuccess: false,
    error: null,
    lastUrl: null
  });

  const [options, setOptions] = useState<CalendarExportOptions>({
    timezone: 'Europe/Madrid',
    includeInstagramUrl: true,
    includeHashtags: false,
    includeExtractedMetadata: false,
    ...defaultOptions
  });

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Determinar qué datos usar
  const eventData = event || extractedData;
  
  if (!eventData) {
    return null;
  }

  // Validar datos antes de exportar
  const validation = validateEventForExport(eventData);

  const handleExport = async () => {
    try {
      setExportState((prev: ExportState) => ({ ...prev, isLoading: true, error: null }));
      onExportStart?.();

      // Validar datos
      if (!validation.isValid) {
        throw new Error(
          `Faltan datos requeridos: ${validation.missingFields.join(', ')}`
        );
      }

      // Generar URL
      let url: string;
      if (event) {
        url = generateGoogleCalendarUrlFromEvent(event, options);
      } else if (extractedData) {
        url = generateGoogleCalendarUrlFromExtractedData(extractedData, options);
      } else {
        throw new Error('No hay datos de evento disponibles');
      }

      // Abrir Google Calendar
      window.open(url, '_blank', 'noopener,noreferrer');

      setExportState({
        isLoading: false,
        isSuccess: true,
        error: null,
        lastUrl: url
      });

      onExportComplete?.(url);

      // Limpiar estado de éxito después de 3 segundos
      setTimeout(() => {
        setExportState((prev: ExportState) => ({ ...prev, isSuccess: false }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al exportar evento';
      
      setExportState({
        isLoading: false,
        isSuccess: false,
        error: errorMessage,
        lastUrl: null
      });

      onExportError?.(errorMessage);
    }
  };

  const handleRetry = () => {
    setExportState((prev: ExportState) => ({ ...prev, error: null }));
    handleExport();
  };

  const handleCopyUrl = async () => {
    if (exportState.lastUrl) {
      try {
        await navigator.clipboard.writeText(exportState.lastUrl);
        // TODO: Mostrar notificación de éxito
      } catch (error) {
        console.error('Error copying URL:', error);
      }
    }
  };

  // Estilos según variante y tamaño
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const variantClasses = {
      button: 'bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md',
      card: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg shadow-sm',
      minimal: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  const getIconSize = () => {
    return size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  };

  // Renderizar botón principal
  const renderMainButton = () => {
    if (exportState.isLoading) {
      return (
        <button
          disabled
          className={`${getButtonClasses()} opacity-75 cursor-not-allowed`}
        >
          <Clock className={`${getIconSize()} mr-2 animate-spin`} />
          Exportando...
        </button>
      );
    }

    if (exportState.isSuccess) {
      return (
        <button
          onClick={handleExport}
          className={`${getButtonClasses()} bg-green-600 hover:bg-green-700`}
        >
          <CheckCircle className={`${getIconSize()} mr-2`} />
          ¡Exportado!
        </button>
      );
    }

    if (exportState.error) {
      return (
        <button
          onClick={handleRetry}
          className={`${getButtonClasses()} bg-red-600 hover:bg-red-700 text-white`}
        >
          <AlertTriangle className={`${getIconSize()} mr-2`} />
          Reintentar
        </button>
      );
    }

    return (
      <button
        onClick={handleExport}
        disabled={!validation.isValid}
        className={`${getButtonClasses()} ${!validation.isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={!validation.isValid ? `Faltan datos: ${validation.missingFields.join(', ')}` : 'Abrir en Google Calendar'}
      >
        <Calendar className={`${getIconSize()} mr-2`} />
        Añadir a Calendar
      </button>
    );
  };

  // Renderizar opciones avanzadas
  const renderAdvancedOptions = () => {
    if (!showAdvancedOptions) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Opciones de exportación</h4>
        
        <div className="space-y-3">
          {/* Zona horaria */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Zona horaria
            </label>
            <select
              value={options.timezone}
              onChange={(e) => setOptions((prev: CalendarExportOptions) => ({ ...prev, timezone: e.target.value }))}
              className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Europe/Madrid">Europa/Madrid</option>
              <option value="Europe/London">Europa/Londres</option>
              <option value="America/New_York">América/Nueva York</option>
              <option value="America/Los_Angeles">América/Los Ángeles</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          {/* Opciones de contenido */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeInstagramUrl}
                onChange={(e) => setOptions((prev: CalendarExportOptions) => ({ ...prev, includeInstagramUrl: e.target.checked }))}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-xs text-gray-700">Incluir URL de Instagram</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeHashtags}
                onChange={(e) => setOptions((prev: CalendarExportOptions) => ({ ...prev, includeHashtags: e.target.checked }))}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-xs text-gray-700">Incluir hashtags</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeExtractedMetadata}
                onChange={(e) => setOptions((prev: CalendarExportOptions) => ({ ...prev, includeExtractedMetadata: e.target.checked }))}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-xs text-gray-700">Incluir metadatos de extracción</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar advertencias
  const renderWarnings = () => {
    if (validation.isValid && validation.warnings.length === 0) return null;

    return (
      <div className="mt-2">
        {!validation.isValid && (
          <div className="flex items-start p-2 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-red-700">
              <p className="font-medium">No se puede exportar:</p>
              <ul className="mt-1 space-y-1">
                {validation.missingFields.map((field: string, index: number) => (
                  <li key={index}>• {field}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {validation.isValid && validation.warnings.length > 0 && (
          <div className="flex items-start p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-yellow-700">
              <p className="font-medium">Datos recomendados faltantes:</p>
              <ul className="mt-1 space-y-1">
                {validation.warnings.map((warning: string, index: number) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {exportState.error && (
          <div className="flex items-start p-2 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-red-700">
              <p className="font-medium">Error:</p>
              <p className="mt-1">{exportState.error}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar según variante
  if (variant === 'minimal') {
    return (
      <div className={className}>
        {renderMainButton()}
        {renderWarnings()}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Exportar a Calendar
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Añade este evento a tu calendario de Google
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showOptions && (
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                title="Opciones avanzadas"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            {renderMainButton()}
          </div>
        </div>

        {renderAdvancedOptions()}
        {renderWarnings()}

        {exportState.lastUrl && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">URL generada</span>
              <button
                onClick={handleCopyUrl}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
              >
                Copiar enlace
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variante por defecto: button
  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        {renderMainButton()}
        
        {showOptions && (
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            title="Opciones avanzadas"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}

        {exportState.lastUrl && (
          <button
            onClick={handleCopyUrl}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            title="Copiar enlace"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
      </div>

      {renderAdvancedOptions()}
      {renderWarnings()}
    </div>
  );
}; 