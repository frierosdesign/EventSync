import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// ===========================================
// TIPOS DE ERROR
// ===========================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  title?: string;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

// ===========================================
// ERROR BOUNDARY PRINCIPAL
// ===========================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Callback personalizado para logging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log automático en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Enviar error a servicio de monitoreo en producción
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implementar logging a servicio externo (Sentry, LogRocket, etc.)
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // En un caso real, enviar a servicio de logging
    console.log('Error logged to service:', errorData);
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const { title = 'Algo salió mal', showErrorDetails = false } = this.props;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
              </h1>
              
              <p className="text-gray-600 mb-6">
                Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
              </p>

              {showErrorDetails && error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                    Detalles técnicos (ID: {errorId})
                  </summary>
                  <div className="bg-gray-100 rounded p-3 text-xs font-mono overflow-auto max-h-32">
                    <div className="text-red-600 mb-2">{error.message}</div>
                    {error.stack && (
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {error.stack.split('\n').slice(0, 5).join('\n')}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al inicio
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Recargar página
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===========================================
// ERROR BOUNDARIES ESPECÍFICOS
// ===========================================

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ 
  children, 
  fallback,
  onError 
}) => {
  return (
    <ErrorBoundary
      fallback={fallback || <AsyncErrorFallback />}
      onError={onError}
      title="Error de carga"
    >
      {children}
    </ErrorBoundary>
  );
};

const AsyncErrorFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Error al cargar contenido
      </h3>
      <p className="text-gray-600 mb-4">
        No se pudo cargar esta sección. Por favor, intenta de nuevo.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);

// Error boundary para formularios
export const FormErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ 
  children, 
  onError 
}) => {
  return (
    <ErrorBoundary
      fallback={<FormErrorFallback />}
      onError={onError}
      title="Error en formulario"
      showErrorDetails={false}
    >
      {children}
    </ErrorBoundary>
  );
};

const FormErrorFallback: React.FC = () => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4">
    <div className="flex">
      <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
      <div>
        <h3 className="text-sm font-medium text-red-800">
          Error en el formulario
        </h3>
        <p className="mt-1 text-sm text-red-700">
          Ocurrió un error inesperado. Por favor, recarga la página e intenta de nuevo.
        </p>
      </div>
    </div>
  </div>
);

// Error boundary para componentes de desarrollo
export const DevErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ 
  children, 
  onError 
}) => {
  if (process.env.NODE_ENV === 'development') {
    return (
      <ErrorBoundary
        showErrorDetails={true}
        onError={onError}
        title="Error de desarrollo"
      >
        {children}
      </ErrorBoundary>
    );
  }

  return <>{children}</>;
};

// ===========================================
// HOC PARA WRAP COMPONENTES
// ===========================================

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// ===========================================
// HOOK PARA MANEJAR ERRORES ASYNC
// ===========================================

export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
    
    // Log the error
    console.error('Error captured by useErrorHandler:', errorObj);
  }, []);

  // Throw error para que sea capturado por ErrorBoundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}; 