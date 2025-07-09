import { NextApiRequest, NextApiResponse } from 'next';
import { ApiMethodHandlers, ApiHandlerOptions, ApiErrorResponse } from '@/types/api';
import { sendError, sendSuccess } from './apiUtils';

export function createApiHandler(
  handlers: ApiMethodHandlers,
  options: ApiHandlerOptions = {}
) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      const method = req.method?.toUpperCase();
      
      if (!method) {
        return sendError(res, 'Method not specified', 400);
      }

      const allowedMethods = options.allowedMethods || Object.keys(handlers);
      
      if (!allowedMethods.includes(method)) {
        res.setHeader('Allow', allowedMethods);
        return sendError(res, 'Method not allowed', 405);
      }

      const methodHandler = handlers[method as keyof ApiMethodHandlers];
      
      if (!methodHandler) {
        res.setHeader('Allow', allowedMethods);
        return sendError(res, 'Method not allowed', 405);
      }

      if (options.cors) {
        setCorsHeaders(res);
        
        if (method === 'OPTIONS') {
          return res.status(200).end();
        }
      }

      await methodHandler(req, res);
    } catch (error) {
      console.error('API Handler Error:', error);
      
      if (error instanceof ApiValidationError) {
        return sendError(res, error.message, error.statusCode, error.details);
      }
      
      if (error instanceof Error) {
        return sendError(res, error.message, 500);
      }
      
      return sendError(res, 'Internal server error', 500);
    }
  };
}

export class ApiValidationError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.name = 'ApiValidationError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('Handler Error:', error);
      throw error;
    }
  };
}

export function withValidation<T>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
  validator: (req: NextApiRequest) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<T> => {
    try {
      await validator(req);
      return await handler(req, res);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        throw error;
      }
      throw new ApiValidationError(
        error instanceof Error ? error.message : 'Validation failed',
        400
      );
    }
  };
}

export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiValidationError('Authorization required', 401);
    }
    
    return handler(req, res);
  };
}

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options: { windowMs: number; max: number } = { windowMs: 60000, max: 100 }
) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const clientId = getClientId(req);
    const now = Date.now();
    const clientData = requests.get(clientId);
    
    if (clientData && now < clientData.resetTime) {
      if (clientData.count >= options.max) {
        throw new ApiValidationError('Rate limit exceeded', 429);
      }
      clientData.count++;
    } else {
      requests.set(clientId, {
        count: 1,
        resetTime: now + options.windowMs
      });
    }
    
    return handler(req, res);
  };
}

function setCorsHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getClientId(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress || 'unknown';
  
  return ip;
}

export function methodNotAllowed(res: NextApiResponse, allowedMethods: string[]) {
  res.setHeader('Allow', allowedMethods);
  return sendError(res, 'Method not allowed', 405);
}

export function requireMethod(req: NextApiRequest, method: string | string[]) {
  const methods = Array.isArray(method) ? method : [method];
  const requestMethod = req.method?.toUpperCase();
  
  if (!requestMethod || !methods.includes(requestMethod)) {
    throw new ApiValidationError('Method not allowed', 405);
  }
}

export function requireFields(data: any, fields: string[]) {
  const missing = fields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw new ApiValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      { missingFields: missing }
    );
  }
}

export function validateQueryParams(req: NextApiRequest, params: string[]) {
  const missing = params.filter(param => !req.query[param]);
  
  if (missing.length > 0) {
    throw new ApiValidationError(
      `Missing required query parameters: ${missing.join(', ')}`,
      400,
      { missingParams: missing }
    );
  }
}