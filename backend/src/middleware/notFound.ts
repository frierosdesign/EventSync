import { Request, Response, NextFunction } from 'express';
import { ErrorResponse, ERROR_CODES, HTTP_STATUS } from '../types';

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  console.log(`🔍 Route not found: ${req.method} ${req.originalUrl}`);
  
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      details: {
        method: req.method,
        path: req.originalUrl,
        availableEndpoints: [
          'GET /api/health',
          'GET /api/events',
          'POST /api/events/extract',
          'GET /api/events/:id'
        ]
      }
    },
    timestamp: new Date().toISOString()
  };

  const error = new Error('Route not found') as any;
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  error.code = ERROR_CODES.NOT_FOUND;
  error.response = errorResponse;
  
  next(error);
}; 