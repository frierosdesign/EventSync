import React from 'react';
import { Calendar, Clock, MapPin, Instagram, Download, Edit3, Check, X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarExport } from './CalendarExport';

// Definir tipos locales para evitar conflictos de importación
interface Event {
  id?: string;
  title: string;
  description?: string;
  dateTime?: {
    startDate: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    timezone?: string;
    allDay?: boolean;
  };
  date?: string;
  time?: string;
  location?: {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  urls?: {
    instagram?: string;
  };
  extractedData?: {
    originalUrl?: string;
    metadata?: {
      confidence?: number;
    };
  };
}

interface ExtractedData {
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
  originalUrl?: string;
  metadata?: {
    confidence?: number;
  };
}

// Enumeraciones necesarias
enum InstagramContentType {
  POST = 'post',
  REEL = 'reel',
  IGTV = 'igtv',
  STORY = 'story'
}

enum ExtractionConfidence {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

interface EventData {
  id?: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  instagramUrl: string;
  confidence?: number;
}

interface EventPreviewProps {
  event?: EventData;
  fullEvent?: Event;
  extractedData?: ExtractedData;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: (event: EventData) => void;
  onCancel?: () => void;
  onSaveToCalendar?: (event: EventData) => void;
  showMetadata?: boolean;
  className?: string;
}

// Función para decodificar títulos URI codificados
function decodeTitle(title: string): string {
  // Verificar si el título está codificado
  if (title.includes('%') || title.includes('+')) {
    try {
      // Intentar decodificar
      return decodeURIComponent(title.replace(/\+/g, '%20'));
    } catch (error) {
      // Si falla la decodificación, devolver el título original
      console.warn('Error decoding title:', error);
      return title;
    }
  }
  return title;
}

// Función utilitaria para convertir Event a EventData
function eventToEventData(event: Event): EventData {
  // Manejar diferentes formatos de fecha
  let date: string;
  let time: string | undefined;

  if (event.dateTime?.startDate) {
    // Formato anidado (dateTime.startDate)
    date = event.dateTime.startDate;
    time = event.dateTime.startTime;
  } else if (event.date) {
    // Formato plano (date, time)
    date = event.date;
    time = event.time;
  } else {
    // Fallback
    date = new Date().toISOString();
    time = undefined;
  }

  // Manejar diferentes formatos de ubicación
  let location: string | undefined;
  if (typeof event.location === 'string') {
    location = event.location;
  } else if (event.location && typeof event.location === 'object') {
    const locationParts = [
      event.location.name,
      event.location.address,
      event.location.city,
      event.location.country
    ].filter(Boolean);
    location = locationParts.join(', ');
  }

  return {
    id: event.id,
    title: decodeTitle(event.title),
    description: decodeTitle(event.description || ''),
    date: date,
    time: time,
    location: location,
    instagramUrl: event.urls?.instagram || event.extractedData?.originalUrl || '',
    confidence: event.extractedData?.metadata?.confidence
  };
}

// Función utilitaria para convertir ExtractedData a EventData
function extractedDataToEventData(extractedData: ExtractedData): EventData {
  // Manejar diferentes formatos de ubicación
  let location: string | undefined;
  if (typeof extractedData.location === 'string') {
    location = extractedData.location;
  } else if (extractedData.location && typeof extractedData.location === 'object') {
    const locationParts = [
      extractedData.location.name,
      extractedData.location.address,
      extractedData.location.city,
      extractedData.location.country
    ].filter(Boolean);
    location = locationParts.join(', ');
  }

  return {
    title: decodeTitle(extractedData.title),
    description: decodeTitle(extractedData.description || ''),
    date: extractedData.dateTime.startDate,
    time: extractedData.dateTime.startTime,
    location: location,
    instagramUrl: extractedData.originalUrl,
    confidence: extractedData.metadata.confidence
  };
}

export const EventPreview: React.FC<EventPreviewProps> = ({
  event,
  fullEvent,
  extractedData,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  onSaveToCalendar,
  className = ''
}) => {
  // Determinar qué datos usar
  const currentEvent: EventData = React.useMemo(() => {
    if (event) return event;
    if (fullEvent) return eventToEventData(fullEvent);
    if (extractedData) return extractedDataToEventData(extractedData);
    throw new Error('EventPreview requires either event, fullEvent, or extractedData prop');
  }, [event, fullEvent, extractedData]);

  const [editedEvent, setEditedEvent] = React.useState<EventData>(currentEvent);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setEditedEvent(currentEvent);
  }, [currentEvent]);

  const handleSave = async () => {
    if (!onSave) return;
    setIsLoading(true);
    try {
      await onSave(editedEvent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToCalendar = async () => {
    if (!onSaveToCalendar) return;
    setIsLoading(true);
    try {
      await onSaveToCalendar(currentEvent);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch {
      return dateString;
    }
  };

  const confidenceColor = currentEvent.confidence 
    ? currentEvent.confidence >= 0.8 
      ? 'bg-green-100 text-green-800' 
      : currentEvent.confidence >= 0.6 
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800'
    : 'bg-gray-100 text-gray-800';

  return (
    <div className={`
      bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden
      transform transition-all duration-300 hover:shadow-xl
      ${className}
    `}>
      {/* Header con imagen */}
      {currentEvent.imageUrl && (
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={currentEvent.imageUrl}
            alt={currentEvent.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <a
              href={currentEvent.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-100 transition-colors"
            >
              <Instagram className="h-4 w-4 text-pink-600" />
            </a>
          </div>
          {currentEvent.confidence && (
            <div className="absolute top-4 left-4">
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${confidenceColor}
              `}>
                {Math.round(currentEvent.confidence * 100)}% confianza
              </span>
            </div>
          )}
        </div>
      )}

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Título */}
        <div className="space-y-2">
          {isEditing ? (
            <input
              type="text"
              value={editedEvent.title}
              onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
              className="w-full text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título del evento"
            />
          ) : (
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {decodeTitle(currentEvent.title)}
            </h2>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          {isEditing ? (
            <textarea
              value={editedEvent.description}
              onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
              rows={3}
              className="w-full text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Descripción del evento"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {decodeTitle(currentEvent.description)}
            </p>
          )}
        </div>

        {/* Detalles del evento */}
        <div className="space-y-3">
          {/* Fecha */}
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
            {isEditing ? (
              <input
                type="date"
                value={editedEvent.date}
                onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <span className="text-gray-700 font-medium">
                {formatDate(currentEvent.date)}
              </span>
            )}
          </div>

          {/* Hora */}
          {(currentEvent.time || isEditing) && (
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              {isEditing ? (
                <input
                  type="time"
                  value={editedEvent.time || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, time: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <span className="text-gray-700 font-medium">
                  {currentEvent.time}
                </span>
              )}
            </div>
          )}

          {/* Ubicación */}
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={editedEvent.location || ''}
                onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ubicación del evento"
              />
            ) : currentEvent.location ? (
              <span className="text-gray-700 font-medium">
                {decodeTitle(currentEvent.location)}
              </span>
            ) : (
              <span className="text-gray-500 italic">
                Ubicación no especificada
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-4 border-t border-gray-200">
          {isEditing ? (
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4 inline mr-1" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Guardar
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Editar
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                {onSaveToCalendar && (
                  <button
                    onClick={handleSaveToCalendar}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </button>
                )}
                
                {/* Componente de exportación a calendario */}
                <CalendarExport
                  extractedData={{
                    title: currentEvent.title,
                    description: currentEvent.description,
                    dateTime: {
                      startDate: currentEvent.date,
                      startTime: currentEvent.time,
                      timezone: 'Europe/Madrid',
                      allDay: !currentEvent.time
                    },
                    location: currentEvent.location ? {
                      name: decodeTitle(currentEvent.location)
                    } : undefined,
                    originalUrl: currentEvent.instagramUrl,
                    rawContent: '',
                    metadata: {
                      extractedAt: new Date().toISOString(),
                      processingTime: 0,
                      instagramPostId: '',
                      contentType: InstagramContentType.POST,
                      confidence: currentEvent.confidence || 0.8,
                      confidenceLevel: ExtractionConfidence.HIGH,
                      extractorVersion: '1.0.0',
                      errors: [],
                      warnings: []
                    },
                    social: {
                      hashtags: [],
                      mentions: []
                    },
                    media: {
                      images: [],
                      videos: []
                    },
                    tags: []
                  }}
                  variant="button"
                  size="md"
                  showOptions={true}
                  onExportComplete={(url) => {
                    console.log('Event exported to calendar:', url);
                    // Aquí puedes agregar lógica adicional si es necesario
                  }}
                />

                {/* Instagram Link Icon */}
                {currentEvent.instagramUrl && (
                  <a
                    href={currentEvent.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Abrir en Instagram"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 