import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Link as LinkIcon, ArrowRight, Calendar, Edit3 } from 'lucide-react';
import { URLInput, EventPreview, ErrorMessage } from '../components/ui';
import { useEventExtraction } from '../hooks';

export const HomePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const { state, extractEvent, clearState, clearError } = useEventExtraction();

  const handleSubmit = async (url: string) => {
    await extractEvent(url);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Extrae eventos de Instagram
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Convierte automáticamente las publicaciones de eventos de Instagram en entradas de calendario.
          Simplemente pega la URL y nosotros nos encargamos del resto.
        </p>
      </div>

      {/* URL Input Section */}
      <div className="max-w-2xl mx-auto">
        <div className="card p-6">
          <URLInput
            value={url}
            onChange={setUrl}
            onSubmit={handleSubmit}
            isLoading={state.isLoading}
            placeholder="https://www.instagram.com/p/ejemplo123/"
          />
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="max-w-2xl mx-auto">
          <ErrorMessage
            title="Error al extraer evento"
            message={state.error}
            onRetry={() => handleSubmit(url)}
            onDismiss={clearError}
            dismissible
          />
        </div>
      )}

      {/* Event Preview */}
      {state.event && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              ¡Evento extraído exitosamente! 🎉
            </h2>
            <p className="text-gray-600">
              Revisa la información extraída y guárdala en tu calendario
            </p>
          </div>
          
          <EventPreview
            fullEvent={state.event}
            onSaveToCalendar={(event) => {
              console.log('Guardando evento:', event);
              // TODO: Implementar guardado en calendario
              alert('¡Evento guardado en calendario!');
            }}
            onEdit={() => {
              // TODO: Implementar edición
              console.log('Editando evento');
            }}
          />
          
          <div className="text-center">
            <button
              onClick={clearState}
              className="btn-secondary"
            >
              Extraer otro evento
            </button>
          </div>
        </div>
      )}

      {/* Features Section */}
      {!state.event && !state.isLoading && (
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <LinkIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Extracción Automática
            </h3>
            <p className="text-gray-600">
              Analiza automáticamente el contenido de Instagram para extraer información de eventos
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sincronización de Calendario
            </h3>
            <p className="text-gray-600">
              Guarda eventos directamente en tu calendario favorito con un solo clic
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Edit3 className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Edición Inteligente
            </h3>
            <p className="text-gray-600">
              Edita y ajusta la información extraída antes de guardarla en tu calendario
            </p>
          </div>
        </div>
      )}

      {/* Navigation Section */}
      {!state.event && !state.isLoading && (
        <div className="text-center space-y-6">
          <p className="text-gray-600">¿Quieres ver todos tus eventos extraídos?</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/events"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Ver Eventos</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              to="/demo"
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <span>Ver Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}; 