import React from 'react';
import { AlertCircle, X, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
  centered?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  variant = 'error',
  size = 'md',
  dismissible = false,
  onDismiss,
  onRetry,
  onGoHome,
  onGoBack,
  className = '',
  centered = false
}) => {
  const variantClasses = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800', 
      icon: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-400', 
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'h-4 w-4',
      title: 'text-sm font-medium',
      message: 'text-sm',
      button: 'px-2 py-1 text-xs'
    },
    md: {
      container: 'p-4',
      icon: 'h-5 w-5', 
      title: 'text-base font-medium',
      message: 'text-sm',
      button: 'px-3 py-2 text-sm'
    },
    lg: {
      container: 'p-6',
      icon: 'h-6 w-6',
      title: 'text-lg font-medium', 
      message: 'text-base',
      button: 'px-4 py-2 text-base'
    }
  };

  const currentVariant = variantClasses[variant];
  const currentSize = sizeClasses[size];

  const ErrorContent = () => (
    <div className={`
      relative rounded-lg border
      ${currentVariant.container}
      ${currentSize.container}
      ${className}
    `}>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <div className="flex items-start space-x-3">
        <AlertCircle className={`
          flex-shrink-0 mt-0.5
          ${currentSize.icon}
          ${currentVariant.icon}
        `} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`
              mb-1
              ${currentSize.title}
            `}>
              {title}
            </h3>
          )}
          
          <p className={currentSize.message}>
            {message}
          </p>
          
          {(onRetry || onGoHome || onGoBack) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`
                    inline-flex items-center space-x-1 rounded font-medium
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${currentSize.button}
                    ${currentVariant.button}
                  `}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reintentar</span>
                </button>
              )}
              
              {onGoHome && (
                <button
                  onClick={onGoHome}
                  className={`
                    inline-flex items-center space-x-1 rounded font-medium
                    border border-current bg-transparent hover:bg-current hover:bg-opacity-10
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${currentSize.button}
                  `}
                >
                  <Home className="h-4 w-4" />
                  <span>Ir al inicio</span>
                </button>
              )}
              
              {onGoBack && (
                <button
                  onClick={onGoBack}
                  className={`
                    inline-flex items-center space-x-1 rounded font-medium
                    border border-current bg-transparent hover:bg-current hover:bg-opacity-10
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${currentSize.button}
                  `}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          <ErrorContent />
        </div>
      </div>
    );
  }

  return <ErrorContent />;
};

// Variantes específicas pre-configuradas
export const ErrorPage: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ title = "¡Oops! Algo salió mal", message, onRetry, onGoHome }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="max-w-lg w-full mx-4">
      <ErrorMessage
        title={title}
        message={message}
        size="lg"
        onRetry={onRetry}
        onGoHome={onGoHome}
        centered
      />
    </div>
  </div>
);

export const ErrorAlert: React.FC<{
  message: string;
  onDismiss?: () => void;
}> = ({ message, onDismiss }) => (
  <ErrorMessage
    message={message}
    size="sm"
    dismissible={!!onDismiss}
    onDismiss={onDismiss}
  />
);

export const ErrorCard: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title, message, onRetry }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <ErrorMessage
      title={title}
      message={message}
      size="md"
      onRetry={onRetry}
    />
  </div>
); 