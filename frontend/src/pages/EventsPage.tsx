import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarExport } from '../components/ui/CalendarExport';
// Removed unused imports

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  instagramUrl: string;
  createdAt: string;
}

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch events from API
    const fetchEvents = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Concierto de Rock en el Parque',
            description: 'Un increíble concierto al aire libre con las mejores bandas locales.',
            date: '2024-02-15',
            time: '20:00',
            location: 'Parque Central, Ciudad',
            instagramUrl: 'https://www.instagram.com/p/example1',
            createdAt: '2024-01-20',
          },
          {
            id: '2',
            title: 'Festival de Arte Urbano',
            description: 'Exposición de arte callejero y graffiti de artistas emergentes.',
            date: '2024-02-20',
            time: '14:00',
            location: 'Barrio Artístico',
            instagramUrl: 'https://www.instagram.com/p/example2',
            createdAt: '2024-01-22',
          },
        ];
        
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando eventos...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No hay eventos</h2>
        <p className="text-gray-600">Aún no has extraído ningún evento de Instagram.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
        <div className="text-sm text-gray-600">
          {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {event.title}
                </h3>
                <a
                  href={event.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3">
                {event.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(event.date), 'PPP', { locale: es })}
                  </span>
                </div>

                {event.time && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <CalendarExport
                  extractedData={{
                    title: event.title,
                    description: event.description,
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
                    rawContent: '',
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
                      images: [],
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
  );
}; 