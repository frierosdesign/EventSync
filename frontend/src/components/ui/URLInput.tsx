import React, { useState } from 'react';
import { Instagram, ExternalLink, AlertCircle } from 'lucide-react';

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const URLInput: React.FC<URLInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "https://www.instagram.com/p/...",
  disabled = false,
  className = ""
}) => {
  const [isValid, setIsValid] = useState(true);
  const [touched, setTouched] = useState(false);

  const validateInstagramURL = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is valid (not required)
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?/;
    return instagramRegex.test(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (touched) {
      setIsValid(validateInstagramURL(newValue));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setIsValid(validateInstagramURL(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    if (!value.trim()) return;
    
    const valid = validateInstagramURL(value);
    setIsValid(valid);
    
    if (valid) {
      onSubmit(value);
    }
  };

  const canSubmit = value.trim() && isValid && !isLoading && !disabled;

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor="instagram-url" 
            className="block text-sm font-semibold text-gray-700"
          >
            URL de Instagram
          </label>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Instagram className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              id="instagram-url"
              type="url"
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={`
                w-full pl-10 pr-10 py-3 
                border-2 rounded-xl 
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                placeholder-gray-400
                ${!isValid && touched 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
                ${disabled || isLoading 
                  ? 'bg-gray-50 cursor-not-allowed opacity-75' 
                  : 'bg-white hover:border-gray-400'
                }
              `}
            />
            
            {value && !isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isValid ? (
                  <ExternalLink className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          
          {!isValid && touched && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>Por favor, introduce una URL válida de Instagram</span>
            </p>
          )}
          
          <p className="text-xs text-gray-500">
            Acepta URLs de posts (/p/) y reels (/reel/) de Instagram
          </p>
        </div>
        
        <button
          type="submit"
          disabled={!canSubmit}
          className={`
            w-full py-3 px-6 rounded-xl font-semibold
            transition-all duration-200 transform
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${canSubmit
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] focus:ring-blue-500 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Instagram className="h-5 w-5" />
              <span>Extraer Evento</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}; 