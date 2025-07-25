import React, { useState } from 'react';
import { 
  URLInput, 
  LoadingSpinner, 
  LoadingCard, 
  ErrorMessage, 
  ErrorCard, 
  EventPreview 
} from '../components/ui';
import { useEventExtraction } from '../hooks';

export const ComponentsDemo: React.FC = () => {
  const [url, setUrl] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { state, extractEvent, clearState } = useEventExtraction();

  // Datos mock para el EventPreview
  const mockEvent = {
    id: 'demo-event',
    title: 'Concierto de Rock en el Parque',
    description: 'Un increíble evento musical con las mejores bandas de rock. Ven y disfruta de una noche llena de música, diversión y buena energía con amigos.',
    date: '2024-03-15',
    time: '20:00',
    location: 'Parque Central, Madrid',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    instagramUrl: 'https://www.instagram.com/p/demo123/',
    confidence: 0.92
  };

  const handleSubmit = async (url: string) => {
    await extractEvent(url);
  };

  const handleToggleLoading = () => {
    setShowLoading(!showLoading);
    setTimeout(() => setShowLoading(false), 3000);
  };

  const handleShowError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Demo de Componentes EventSync
        </h1>
        <p className="text-xl text-gray-600">
          Explora todos los componentes UI disponibles con datos de ejemplo
        </p>
      </div>

      {/* URLInput Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">URLInput Component</h2>
        <div className="max-w-2xl">
          <URLInput
            value={url}
            onChange={setUrl}
            onSubmit={handleSubmit}
            isLoading={state.isLoading}
            placeholder="https://www.instagram.com/p/ejemplo123/"
          />
        </div>
        {state.event && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Evento Extraído:</h3>
            <EventPreview 
              fullEvent={state.event}
              onSaveToCalendar={() => console.log('Guardando en calendario...')}
            />
          </div>
        )}
        {state.error && (
          <ErrorMessage
            message={state.error}
            onRetry={() => handleSubmit(url)}
            onDismiss={clearState}
            dismissible
          />
        )}
      </section>

      {/* Loading Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Loading Components</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Small Spinner</h3>
            <LoadingSpinner size="sm" message="Cargando..." />
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Medium Spinner</h3>
            <LoadingSpinner size="md" message="Procesando..." />
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Large Spinner</h3>
            <LoadingSpinner size="lg" message="Extrayendo datos..." />
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">XL Spinner</h3>
            <LoadingSpinner size="xl" message="Analizando contenido..." />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Loading Card</h3>
          <div className="max-w-md">
            {showLoading ? (
              <LoadingCard message="Cargando evento desde Instagram..." />
            ) : (
              <button 
                onClick={handleToggleLoading}
                className="btn-primary"
              >
                Mostrar Loading Card (3s)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Error Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Error Components</h2>
        
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Error Variants</h3>
          
          <ErrorMessage
            title="Error de Conexión"
            message="No se pudo conectar con el servidor. Verifica tu conexión a internet."
            variant="error"
            onRetry={() => console.log('Reintentando...')}
          />
          
          <ErrorMessage
            title="Advertencia"
            message="La URL proporcionada podría no contener información de evento válida."
            variant="warning"
          />
          
          <ErrorMessage
            title="Información"
            message="Este proceso puede tardar unos minutos en completarse."
            variant="info"
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Error Card</h3>
          <div className="max-w-md">
            {showError ? (
              <ErrorCard
                title="Error al procesar"
                message="No se pudo extraer la información del evento desde la URL proporcionada."
                onRetry={() => console.log('Reintentando...')}
              />
            ) : (
              <button 
                onClick={handleShowError}
                className="btn-primary"
              >
                Mostrar Error Card (5s)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* EventPreview Component */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">EventPreview Component</h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Modo Vista</h3>
            <EventPreview
              event={mockEvent}
              isEditing={false}
              onEdit={() => setIsEditing(true)}
              onSaveToCalendar={(event) => {
                console.log('Guardando evento:', event);
                alert('¡Evento guardado en calendario!');
              }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Modo Edición</h3>
            <EventPreview
              event={mockEvent}
              isEditing={isEditing}
              onSave={(event) => {
                console.log('Evento editado:', event);
                setIsEditing(false);
                alert('¡Cambios guardados!');
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      </section>

      {/* Responsive Test */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Diseño Responsive</h2>
        <p className="text-gray-600">
          Todos los componentes están diseñados para funcionar perfectamente en dispositivos móviles, tablets y desktop.
          Prueba redimensionando la ventana del navegador para ver la adaptación.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 mb-2">Mobile First</h4>
            <p className="text-sm text-gray-600">
              Diseño optimizado para móviles con touch-friendly interactions.
            </p>
          </div>
          
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 mb-2">Tablet Friendly</h4>
            <p className="text-sm text-gray-600">
              Layouts adaptativos que aprovechan el espacio disponible en tablets.
            </p>
          </div>
          
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 mb-2">Desktop Enhanced</h4>
            <p className="text-sm text-gray-600">
              Experiencia enriquecida con hover effects y layouts expandidos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}; 