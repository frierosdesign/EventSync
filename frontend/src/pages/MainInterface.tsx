import React, { useState, useEffect } from 'react';
import { URLInputForm } from '../components/ui/URLInputForm';
import { EventPreview } from '../components/ui/EventPreview';
import { LoadingSpinner, ExtractionSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { StatusCard } from '../components/ui/StatusCard';
import { useApp } from '../contexts/AppContext';
import { FormErrorBoundary, AsyncErrorBoundary } from '../components/ErrorBoundary';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Zap,
  History
} from 'lucide-react';

export const MainInterface: React.FC = () => {
  const { state, actions } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  // Estados derivados para facilitar uso
  const isExtracting = state.extraction.loading;
  const extractionResult = state.extraction.result;
  const extractionError = state.extraction.error;
  const isOnline = state.isOnline;
  const connectionStatus = state.connectionStatus;
  const extractionHistory = state.extraction.history;
  const notifications = state.notifications;

  // Health check al montar el componente
  useEffect(() => {
    actions.checkHealth();
  }, []);

  // Auto-fetch events si están vacíos
  useEffect(() => {
    if (state.events.items.length === 0 && !state.events.loading && !state.events.error) {
      actions.fetchEvents();
    }
  }, []);

  const handleUrlSubmit = async (data: { url: string }) => {
    try {
      await actions.extractEvent(data.url);
    } catch (error) {
      console.error('Error in URL submission:', error);
    }
  };

  const handleRetry = () => {
    actions.retry();
  };

  const handleClearExtraction = () => {
    actions.clearExtraction();
  };

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        status: 'error' as const,
        message: 'Sin conexión a internet'
      };
    }

    if (connectionStatus === 'reconnecting') {
      return {
        status: 'loading' as const,
        message: 'Reconectando...'
      };
    }

    if (isExtracting) {
      return {
        status: 'loading' as const,
        message: `Extrayendo evento... ${state.extraction.progress}%`
      };
    }

    if (extractionResult) {
      return {
        status: 'success' as const,
        message: `Evento extraído con éxito (${Math.round(extractionResult.confidence * 100)}% confianza)`
      };
    }

    if (extractionError) {
      return {
        status: 'error' as const,
        message: extractionError.message
      };
    }

    return {
      status: 'idle' as const,
      message: 'Listo para extraer eventos'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header con estado de conexión */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            EventSync
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Extrae información de eventos desde Instagram automáticamente
          </p>
          
          {/* Status indicator */}
          <div className="flex items-center justify-center mb-6">
            <StatusCard
              status={statusInfo.status}
              message={statusInfo.message}
            />
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-md flex items-center justify-between ${
                  notification.type === 'success' ? 'bg-green-50 border border-green-200' :
                  notification.type === 'error' ? 'bg-red-50 border border-red-200' :
                  notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                <div>
                  <h4 className={`font-medium ${
                    notification.type === 'success' ? 'text-green-800' :
                    notification.type === 'error' ? 'text-red-800' :
                    notification.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {notification.title}
                  </h4>
                  <p className={`text-sm ${
                    notification.type === 'success' ? 'text-green-600' :
                    notification.type === 'error' ? 'text-red-600' :
                    notification.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => actions.removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column - Input and Controls */}
          <div className="space-y-6">
            
            {/* URL Input Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Extraer Evento
              </h2>
              
              <FormErrorBoundary>
                <URLInputForm
                  onSubmit={handleUrlSubmit}
                  isLoading={isExtracting}
                  disabled={!isOnline}
                />
              </FormErrorBoundary>

              {/* Progress Bar */}
              {isExtracting && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progreso</span>
                    <span>{state.extraction.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${state.extraction.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="mt-4 flex flex-wrap gap-2">
                {extractionError && (
                  <button
                    onClick={handleRetry}
                    disabled={isExtracting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </button>
                )}
                
                {(extractionResult || extractionError) && (
                  <button
                    onClick={handleClearExtraction}
                    disabled={isExtracting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Limpiar
                  </button>
                )}

                {extractionHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Historial ({extractionHistory.length})
                  </button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {extractionError && (
              <ErrorMessage
                message={extractionError.message}
                variant="error"
                onRetry={extractionError.retryCount > 0 ? handleRetry : undefined}
              />
            )}

            {/* History Panel */}
            {showHistory && extractionHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Historial de Extracciones
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {extractionHistory.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md border ${
                        item.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {item.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                          )}
                          <span className="text-sm font-medium">
                            {item.success ? item.event?.title || 'Evento extraído' : 'Error'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {item.url}
                      </p>
                      {!item.success && item.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {item.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            
            {/* Loading State */}
            {isExtracting && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <ExtractionSpinner 
                      step="scraping"
                    />
                    <p className="text-sm text-gray-500 mt-4">
                      La extracción puede tomar entre 30-60 segundos
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Dependiendo de la complejidad del contenido
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success State - Event Preview */}
            {extractionResult && extractionResult.event && (
              <AsyncErrorBoundary>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-green-50 border-b border-green-200 p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-800">
                        Evento extraído exitosamente
                      </span>
                      <span className="ml-auto text-sm text-green-600">
                        Confianza: {Math.round(extractionResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <EventPreview
                    fullEvent={extractionResult.event}
                    extractedData={extractionResult.extractedData || undefined}
                  />

                  {/* Processing time info */}
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Procesado en {extractionResult.processingTime}ms
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {extractionResult.extractedData?.metadata?.instagramPostId || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </AsyncErrorBoundary>
            )}

            {/* Empty State */}
            {!isExtracting && !extractionResult && !extractionError && (
              <div className="bg-white rounded-lg shadow-lg p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Listo para comenzar
                  </h3>
                  <p className="text-gray-600">
                    Ingresa la URL de un post de Instagram para extraer la información del evento automáticamente.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer with stats */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">
                {state.events.total}
              </div>
              <div className="text-sm text-gray-600">Eventos guardados</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">
                {extractionHistory.filter(h => h.success).length}
              </div>
              <div className="text-sm text-gray-600">Extracciones exitosas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-purple-600">
                {extractionResult ? Math.round(extractionResult.confidence * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Confianza promedio</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}; 