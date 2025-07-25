import { Request, Response, NextFunction } from 'express';

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip: string;
}

/**
 * Middleware de logging para requests HTTP
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Capturar información básica del request
  const logEntry: LogEntry = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || 'unknown'
  };

  // Log del request entrante
  console.log(`📥 ${getMethodEmoji(req.method)} ${req.method} ${req.originalUrl}`, {
    ip: logEntry.ip,
    userAgent: logEntry.userAgent,
    timestamp
  });

  // Interceptar el final de la respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    logEntry.statusCode = res.statusCode;
    logEntry.responseTime = responseTime;

    // Log de la respuesta
    console.log(`📤 ${getStatusEmoji(res.statusCode)} ${res.statusCode} ${req.method} ${req.originalUrl}`, {
      responseTime: `${responseTime}ms`,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    });

    // Log detallado para errores
    if (res.statusCode >= 400) {
      console.error(`💥 Error Response:`, {
        ...logEntry,
        responseData: data ? JSON.stringify(data).substring(0, 500) : null
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Obtiene emoji basado en el método HTTP
 */
const getMethodEmoji = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'GET': return '🔍';
    case 'POST': return '📝';
    case 'PUT': return '✏️';
    case 'PATCH': return '🔧';
    case 'DELETE': return '🗑️';
    default: return '📡';
  }
};

/**
 * Obtiene emoji basado en el código de estado HTTP
 */
const getStatusEmoji = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) return '✅';
  if (statusCode >= 300 && statusCode < 400) return '🔄';
  if (statusCode >= 400 && statusCode < 500) return '⚠️';
  if (statusCode >= 500) return '💥';
  return '📊';
};

/**
 * Middleware para logging de errores no capturados
 */
export const errorLogger = (error: Error, req: Request, _res: Response, next: NextFunction): void => {
  console.error(`💀 Unhandled Error in ${req.method} ${req.originalUrl}:`, {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    },
    timestamp: new Date().toISOString()
  });

  next(error);
};

export const apiLogger = {
  info: (message: string, data?: any) => {
    console.log(`📊 INFO: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  
  error: (message: string, data?: any) => {
    console.error(`💥 ERROR: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ WARNING: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  
  success: (message: string, data?: any) => {
    console.log(`✅ SUCCESS: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  
  scraping: (message: string, data?: any) => {
    console.log(`🕷️ SCRAPING: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};