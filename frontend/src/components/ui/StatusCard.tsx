import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Loader2,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface StatusCardProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'info';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  title,
  message,
  action,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-6 w-6 animate-spin" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="h-6 w-6" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default: // idle
        return {
          icon: <Sparkles className="h-6 w-6" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();

  // Simplificar animaciones para evitar problemas de tipado
  const cardAnimation = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
    transition: { duration: 0.3 }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={cardAnimation.initial}
        animate={cardAnimation.animate}
        exit={cardAnimation.exit}
        transition={cardAnimation.transition}
        className={`
          relative rounded-xl border-2 p-6
          ${config.bgColor} ${config.borderColor}
          ${className}
        `}
      >
        {/* Indicador de estado animado para loading */}
        {status === 'loading' && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-xl"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}

        <div className="flex items-start space-x-4">
          {/* Icono con animación */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.1 
            }}
            className={`flex-shrink-0 ${config.iconColor}`}
          >
            {config.icon}
          </motion.div>

          {/* Contenido */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex-1 min-w-0"
          >
            {title && (
              <motion.h3 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-lg font-semibold mb-1 ${config.textColor}`}
              >
                {title}
              </motion.h3>
            )}
            
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`text-sm leading-relaxed ${config.textColor}`}
            >
              {message}
            </motion.p>

            {/* Botón de acción */}
            {action && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <button
                  onClick={action.onClick}
                  className={`
                    inline-flex items-center space-x-2 px-4 py-2 rounded-lg
                    text-sm font-medium transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${action.variant === 'secondary'
                      ? `border border-current bg-transparent hover:bg-current hover:bg-opacity-10 ${config.textColor}`
                      : `bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-gray-500`
                    }
                  `}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>{action.label}</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 