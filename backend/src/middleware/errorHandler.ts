import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorResponse, ERROR_CODES, HTTP_STATUS } from '../types';

/**
 * Middleware centralizado para manejo de errores
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error caught by middleware:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Si ya se envió una respuesta, no hacer nada
  if (res.headersSent) {
    return;
  }

  // Error personalizado de la API
  if (error instanceof ApiError || 'statusCode' in error) {
    const apiError = error as ApiError;
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: apiError.code || ERROR_CODES.INTERNAL_ERROR,
        message: apiError.message,
        details: apiError.details
      },
      timestamp: new Date().toISOString()
    };

    res.status(apiError.statusCode || HTTP_STATUS.INTERNAL_ERROR).json(errorResponse);
    return;
  }

  // Errores de validación de Express
  if (error.name === 'ValidationError') {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Datos de entrada inválidos',
        details: error.message
      },
      timestamp: new Date().toISOString()
    };

    res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
    return;
  }

  // Error genérico del servidor
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    timestamp: new Date().toISOString()
  };

  res.status(HTTP_STATUS.INTERNAL_ERROR).json(errorResponse);
};

/**
 * Crea un error personalizado de la API
 */
export const createApiError = (
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_ERROR,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  details?: any
): ApiError => {
  return new ApiError(message, statusCode, code, details);
};

/**
 * Alias para createApiError para compatibilidad
 */
export const createError = createApiError; 