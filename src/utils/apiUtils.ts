import { NextApiRequest, NextApiResponse } from 'next';
import { ApiSuccessResponse, ApiErrorResponse, PaginationParams, PaginatedResponse } from '@/types/api';

export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message
  };
  
  res.status(statusCode).json(response);
}

export function sendError(
  res: NextApiResponse,
  message: string,
  statusCode: number = 500,
  details?: any
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: message,
    ...(details && { details })
  };
  
  res.status(statusCode).json(response);
}

export function sendCreated<T>(
  res: NextApiResponse,
  data: T,
  message?: string
): void {
  sendSuccess(res, data, message || 'Resource created successfully', 201);
}

export function sendUpdated<T>(
  res: NextApiResponse,
  data: T,
  message?: string
): void {
  sendSuccess(res, data, message || 'Resource updated successfully', 200);
}

export function sendDeleted(
  res: NextApiResponse,
  message?: string
): void {
  sendSuccess(res, null, message || 'Resource deleted successfully', 200);
}

export function sendNoContent(res: NextApiResponse): void {
  res.status(204).end();
}

export function sendNotFound(res: NextApiResponse, message?: string): void {
  sendError(res, message || 'Resource not found', 404);
}

export function sendBadRequest(res: NextApiResponse, message?: string, details?: any): void {
  sendError(res, message || 'Bad request', 400, details);
}

export function sendUnauthorized(res: NextApiResponse, message?: string): void {
  sendError(res, message || 'Unauthorized', 401);
}

export function sendForbidden(res: NextApiResponse, message?: string): void {
  sendError(res, message || 'Forbidden', 403);
}

export function sendConflict(res: NextApiResponse, message?: string): void {
  sendError(res, message || 'Conflict', 409);
}

export function sendUnprocessableEntity(res: NextApiResponse, message?: string, details?: any): void {
  sendError(res, message || 'Unprocessable entity', 422, details);
}

export function sendTooManyRequests(res: NextApiResponse, message?: string): void {
  sendError(res, message || 'Too many requests', 429);
}

export function sendInternalServerError(res: NextApiResponse, message?: string): void {
  sendError(res, message || 'Internal server error', 500);
}

export function parseQueryParams(req: NextApiRequest): PaginationParams {
  const {
    page = '1',
    limit = '10',
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query;

  return {
    page: parseInt(page as string, 10) || 1,
    limit: Math.min(parseInt(limit as string, 10) || 10, 100),
    sortBy: sortBy as string,
    sortOrder: (sortOrder as string) === 'asc' ? 'asc' : 'desc'
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

export function extractBearerToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress || 'unknown';
  
  return ip.trim();
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function parseJSON<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

export function validateRequired(data: any, fields: string[]): string[] {
  const missing: string[] = [];
  
  for (const field of fields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }
  
  return missing;
}

export function validateTypes(data: any, schema: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>): string[] {
  const errors: string[] = [];
  
  for (const [field, expectedType] of Object.entries(schema)) {
    const value = data[field];
    
    if (value === undefined || value === null) {
      continue;
    }
    
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (actualType !== expectedType) {
      errors.push(`${field} must be of type ${expectedType}, got ${actualType}`);
    }
  }
  
  return errors;
}

export function validateLength(data: any, rules: Record<string, { min?: number; max?: number }>): string[] {
  const errors: string[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (value === undefined || value === null) {
      continue;
    }
    
    const length = typeof value === 'string' ? value.length : 
                   Array.isArray(value) ? value.length : 0;
    
    if (rule.min !== undefined && length < rule.min) {
      errors.push(`${field} must be at least ${rule.min} characters/items`);
    }
    
    if (rule.max !== undefined && length > rule.max) {
      errors.push(`${field} must be no more than ${rule.max} characters/items`);
    }
  }
  
  return errors;
}

export function handleSupabaseError(error: any): { message: string; statusCode: number } {
  if (!error) {
    return { message: 'Unknown error', statusCode: 500 };
  }
  
  if (error.code === 'PGRST116') {
    return { message: 'Resource not found', statusCode: 404 };
  }
  
  if (error.code === '23505') {
    return { message: 'Resource already exists', statusCode: 409 };
  }
  
  if (error.code === '23503') {
    return { message: 'Invalid reference', statusCode: 400 };
  }
  
  if (error.code === 'PGRST103') {
    return { message: 'Insufficient permissions', statusCode: 403 };
  }
  
  return { message: error.message || 'Database error', statusCode: 500 };
}

export function logApiCall(req: NextApiRequest, startTime: number, statusCode: number) {
  const duration = Date.now() - startTime;
  const ip = getClientIP(req);
  
  console.log(`${req.method} ${req.url} - ${statusCode} - ${duration}ms - ${ip}`);
}

export function createApiLogger(req: NextApiRequest) {
  const startTime = Date.now();
  
  return {
    success: (statusCode: number = 200) => logApiCall(req, startTime, statusCode),
    error: (statusCode: number = 500) => logApiCall(req, startTime, statusCode)
  };
}