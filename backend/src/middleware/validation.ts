import { Request, Response, NextFunction } from 'express';
import { ExtractEventRequest, ValidationError, ERROR_CODES, HTTP_STATUS } from '../types';
import { createApiError } from './errorHandler';

/**
 * Valida que el request body contenga los campos requeridos
 */
export const validateExtractRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { url } = req.body as ExtractEventRequest;

    const errors: ValidationError[] = [];

    // Validar que URL existe
    if (!url) {
      errors.push({
        field: 'url',
        message: 'La URL es requerida',
        value: url
      });
    }

    // Validar formato de URL
    if (url && !isValidUrl(url)) {
      errors.push({
        field: 'url',
        message: 'La URL debe tener un formato válido',
        value: url
      });
    }

    // Validar que sea URL de Instagram
    if (url && isValidUrl(url) && !isInstagramUrl(url)) {
      errors.push({
        field: 'url',
        message: 'La URL debe ser de Instagram',
        value: url
      });
    }

    // Validar patrón específico de Instagram
    if (url && isInstagramUrl(url) && !isValidInstagramContentUrl(url)) {
      errors.push({
        field: 'url',
        message: 'La URL debe ser de un post, reel o IGTV específico de Instagram',
        value: url
      });
    }

    if (errors.length > 0) {
      throw createApiError(
        'Errores de validación en la solicitud',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        { errors }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware genérico para validar JSON
 */
export const validateJson = (
  error: any,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (error instanceof SyntaxError && 'status' in error && error.status === 400 && 'body' in error) {
    const apiError = createApiError(
      'JSON inválido en el cuerpo de la solicitud',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      { originalError: error.message }
    );
    next(apiError);
  } else {
    next(error);
  }
};

/**
 * Valida parámetros de consulta para la lista de eventos
 */
export const validateEventsQuery = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    const errors: ValidationError[] = [];

    // Validar página
    if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
      errors.push({
        field: 'page',
        message: 'La página debe ser un número entero mayor a 0',
        value: page
      });
    }

    // Validar límite
    if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
      errors.push({
        field: 'limit',
        message: 'El límite debe ser un número entero entre 1 y 100',
        value: limit
      });
    }

    // Validar ordenamiento
    if (sortBy && !['date', 'createdAt', 'title'].includes(sortBy as string)) {
      errors.push({
        field: 'sortBy',
        message: 'El campo de ordenamiento debe ser: date, createdAt o title',
        value: sortBy
      });
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder as string)) {
      errors.push({
        field: 'sortOrder',
        message: 'El orden debe ser: asc o desc',
        value: sortOrder
      });
    }

    if (errors.length > 0) {
      throw createApiError(
        'Parámetros de consulta inválidos',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        { errors }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ===========================================
// UTILIDADES DE VALIDACIÓN
// ===========================================

/**
 * Valida si una cadena es una URL válida
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida si una URL es de Instagram
 */
export const isInstagramUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'instagram.com' || 
           urlObj.hostname === 'www.instagram.com';
  } catch {
    return false;
  }
};

/**
 * Valida si una URL de Instagram es de contenido específico (no perfil)
 */
export const isValidInstagramContentUrl = (url: string): boolean => {
  const patterns = [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?(\?.*)?$/, // Posts
    /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[A-Za-z0-9_-]+\/?(\?.*)?$/, // Reels
    /^https?:\/\/(www\.)?instagram\.com\/(tv|igtv)\/[A-Za-z0-9_-]+\/?(\?.*)?$/, // IGTV
    /^https?:\/\/(www\.)?instagram\.com\/stories\/[A-Za-z0-9_.-]+\/[0-9]+\/?(\?.*)?$/, // Stories
  ];

  return patterns.some(pattern => pattern.test(url));
};

 