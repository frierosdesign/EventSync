import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, ExternalLink, Filter, SortAsc, SortDesc } from 'lucide-react';
import { format, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarExport } from '../components/ui/CalendarExport';
import { apiClient } from '../lib/api-client';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

interface Event {
  id: string | number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  instagramUrl: string;
  rawContent?: string;
  extractedData?: string;
  createdAt: string;
  updatedAt: string;
}

type SortOrder = 'date' | 'created';
type SortDirection = 'asc' | 'desc';

interface GroupedEvents {
  [key: string]: Event[];
}

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getEvents();
      
      if (response.success && response.data?.events) {
        // Transformar los datos para que coincidan con nuestra interfaz
        const transformedEvents = response.data.events.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          imageUrl: event.imageUrl,
          instagramUrl: event.instagramUrl,
          rawContent: event.rawContent,
          extractedData: event.extractedData,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt
        }));
        setEvents(transformedEvents);
      } else {
        setError('No se pudieron cargar los eventos');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error al cargar los eventos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const sortEvents = (eventsToSort: Event[]): Event[] => {
    return [...eventsToSort].sort((a, b) => {
      let comparison = 0;
      
      if (sortOrder === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const groupEventsByMonth = (eventsToGroup: Event[]): GroupedEvents => {
    const grouped: GroupedEvents = {};
    
    eventsToGroup.forEach(event => {
      const eventDate = parseISO(event.date);
      const monthKey = format(startOfMonth(eventDate), 'yyyy-MM');
      const monthLabel = format(eventDate, 'MMMM yyyy', { locale: es });
      
      if (!grouped[monthLabel]) {
        grouped[monthLabel] = [];
      }
      grouped[monthLabel].push(event);
    });
    
    return grouped;
  };

  const handleSortChange = (newSortOrder: SortOrder) => {
    if (sortOrder === newSortOrder) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOrder(newSortOrder);
      setSortDirection('desc');
    }
  };

  const sortedEvents = sortEvents(events);
  const groupedEvents = sortOrder === 'date' ? groupEventsByMonth(sortedEvents) : { 'Todos los eventos': sortedEvents };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando eventos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ErrorMessage message={error} />
        <button
          onClick={fetchEvents}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No hay eventos</h2>
        <p className="text-gray-600">Aún no has extraído ningún evento de Instagram.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas y filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
          <p className="text-sm text-gray-600 mt-1">
            {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Filtros de ordenamiento */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Ordenar por:</span>
          
          <button
            onClick={() => handleSortChange('date')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortOrder === 'date'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Fecha
            {sortOrder === 'date' && (
              sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
            )}
          </button>
          
          <button
            onClick={() => handleSortChange('created')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortOrder === 'created'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Inclusión
            {sortOrder === 'created' && (
              sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([monthLabel, monthEvents]) => (
          <div key={monthLabel} className="space-y-4">
            {/* Heading del mes */}
            {sortOrder === 'date' && (
              <div className="border-b border-gray-200 pb-2">
                <h2 className="text-xl font-semibold text-gray-800 capitalize">
                  {monthLabel}
                </h2>
              </div>
            )}
            
            {/* Grid de eventos */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {monthEvents.map((event) => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Imagen del evento */}
                  {event.imageUrl && (
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <a
                          href={event.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-100 transition-colors"
                          title="Ver en Instagram"
                        >
                          <ExternalLink className="h-4 w-4 text-pink-600" />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 space-y-4">
                    {/* Header del evento */}
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {event.title}
                      </h3>
                      {!event.imageUrl && event.instagramUrl && (
                        <a
                          href={event.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary-600 transition-colors ml-2 flex-shrink-0"
                          title="Ver en Instagram"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {event.description}
                    </p>

                    {/* Detalles del evento */}
                                                              <div className="space-y-2">
                       <div className="flex items-center space-x-2 text-sm text-gray-600">
                         <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                         <span>
                           {format(parseISO(event.date), 'PPP', { locale: es })}
                         </span>
                       </div>

                       {event.time && (
                         <div className="flex items-center space-x-2 text-sm text-gray-600">
                           <Clock className="h-4 w-4 flex-shrink-0" />
                           <span>{event.time}</span>
                         </div>
                       )}

                       {event.location && (
                         <div className="flex items-center space-x-2 text-sm text-gray-600">
                           <MapPin className="h-4 w-4 flex-shrink-0" />
                           <span className="line-clamp-1">{event.location}</span>
                         </div>
                       )}
                     </div>

                    {/* Fecha de inclusión (solo cuando se ordena por fecha de inclusión) */}
                    {sortOrder === 'created' && (
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                        Añadido el {format(parseISO(event.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    )}

                                         {/* Botón de exportar */}
                     <div className="pt-4 border-t border-gray-200">
                       <CalendarExport
                         extractedData={{
                           title: event.title,
                           description: event.description || '',
                           dateTime: {
                             startDate: event.date,
                             startTime: event.time,
                             timezone: 'Europe/Madrid',
                             allDay: !event.time
                           },
                           location: event.location ? {
                             name: event.location
                           } : undefined,
                           originalUrl: event.instagramUrl,
                           rawContent: event.rawContent || '',
                           metadata: {
                             extractedAt: new Date().toISOString(),
                             processingTime: 0,
                             instagramPostId: '',
                             contentType: 'post',
                             confidence: 0.8,
                             confidenceLevel: 'high',
                             extractorVersion: '1.0.0',
                             errors: [],
                             warnings: []
                           },
                           social: {
                             hashtags: [],
                             mentions: []
                           },
                           media: {
                             images: event.imageUrl ? [{ url: event.imageUrl, alt: event.title }] : [],
                             videos: []
                           },
                           tags: []
                         }}
                         variant="button"
                         size="sm"
                         className="w-full"
                       />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 