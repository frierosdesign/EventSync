import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  centered?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'white';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  centered = false,
  className = '',
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const borderClasses = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3', 
    xl: 'border-4'
  };

  const variantClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent', 
    white: 'border-white border-t-transparent'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const Spinner = () => (
    <div className="flex flex-col items-center space-y-3">
      <div 
        className={`
          animate-spin rounded-full
          ${sizeClasses[size]}
          ${borderClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
      />
      {message && (
        <p className={`
          text-gray-600 font-medium
          ${textSizeClasses[size]}
        `}>
          {message}
        </p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

// Variantes específicas pre-configuradas
export const LoadingPage: React.FC<{ message?: string }> = ({ 
  message = "Cargando..." 
}) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner 
      size="xl" 
      message={message} 
      variant="primary"
    />
  </div>
);

export const LoadingButton: React.FC<{ message?: string }> = ({ 
  message = "Procesando..." 
}) => (
  <LoadingSpinner 
    size="sm" 
    message={message} 
    variant="white"
  />
);

export const ExtractionSpinner: React.FC<{ 
  message?: string;
  step?: 'scraping' | 'processing' | 'analyzing';
}> = ({ 
  message,
  step = 'scraping'
}) => {
  const stepMessages = {
    scraping: "🕷️ Extrayendo contenido de Instagram...",
    processing: "🤖 Procesando con IA...",
    analyzing: "📊 Analizando datos del evento..."
  };

  const displayMessage = message || stepMessages[step];

  return (
    <LoadingSpinner 
      size="lg" 
      message={displayMessage} 
      variant="primary"
    />
  );
};

export const LoadingCard: React.FC<{ message?: string }> = ({ 
  message = "Cargando datos..." 
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
    <LoadingSpinner 
      size="lg" 
      message={message} 
      centered
    />
  </div>
);

export const LoadingOverlay: React.FC<{ 
  message?: string;
  show?: boolean;
}> = ({ 
  message = "Procesando...", 
  show = true 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
        <LoadingSpinner 
          size="lg" 
          message={message} 
          centered
        />
      </div>
    </div>
  );
}; 