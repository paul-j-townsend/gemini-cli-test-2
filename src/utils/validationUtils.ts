import { ValidationError, ValidationResult } from '@/types/api';

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'uuid';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export function validateField(
  value: any,
  fieldName: string,
  rule: ValidationRule
): ValidationError | null {
  if (rule.required && (value === undefined || value === null || value === '')) {
    return {
      field: fieldName,
      message: rule.message || `${fieldName} is required`
    };
  }
  
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  if (rule.type) {
    const typeError = validateType(value, fieldName, rule.type);
    if (typeError) return typeError;
  }
  
  if (rule.minLength !== undefined && typeof value === 'string') {
    if (value.length < rule.minLength) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be at least ${rule.minLength} characters long`
      };
    }
  }
  
  if (rule.maxLength !== undefined && typeof value === 'string') {
    if (value.length > rule.maxLength) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be no more than ${rule.maxLength} characters long`
      };
    }
  }
  
  if (rule.min !== undefined && typeof value === 'number') {
    if (value < rule.min) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be at least ${rule.min}`
      };
    }
  }
  
  if (rule.max !== undefined && typeof value === 'number') {
    if (value > rule.max) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be no more than ${rule.max}`
      };
    }
  }
  
  if (rule.pattern && typeof value === 'string') {
    if (!rule.pattern.test(value)) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} format is invalid`
      };
    }
  }
  
  if (rule.custom) {
    const result = rule.custom(value);
    if (result === false) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} is invalid`
      };
    }
    if (typeof result === 'string') {
      return {
        field: fieldName,
        message: result
      };
    }
  }
  
  return null;
}

export function validateType(
  value: any,
  fieldName: string,
  type: ValidationRule['type']
): ValidationError | null {
  const actualType = getValueType(value);
  
  if (type === 'email') {
    if (actualType !== 'string' || !isValidEmail(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid email address`
      };
    }
  } else if (type === 'url') {
    if (actualType !== 'string' || !isValidUrl(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid URL`
      };
    }
  } else if (type === 'uuid') {
    if (actualType !== 'string' || !isValidUUID(value)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid UUID`
      };
    }
  } else if (actualType !== type) {
    return {
      field: fieldName,
      message: `${fieldName} must be of type ${type}`
    };
  }
  
  return null;
}

export function validateData(data: any, schema: ValidationSchema): ValidationResult {
  const errors: ValidationError[] = [];
  
  for (const [fieldName, rule] of Object.entries(schema)) {
    const error = validateField(data[fieldName], fieldName, rule);
    if (error) {
      errors.push(error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getValueType(value: any): string {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8 && 
         /[a-z]/.test(password) && 
         /[A-Z]/.test(password) && 
         /\d/.test(password);
}

export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function isValidIPAddress(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

export const commonValidations = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message
  }),
  
  string: (message?: string): ValidationRule => ({
    type: 'string',
    message
  }),
  
  number: (message?: string): ValidationRule => ({
    type: 'number',
    message
  }),
  
  boolean: (message?: string): ValidationRule => ({
    type: 'boolean',
    message
  }),
  
  array: (message?: string): ValidationRule => ({
    type: 'array',
    message
  }),
  
  object: (message?: string): ValidationRule => ({
    type: 'object',
    message
  }),
  
  email: (message?: string): ValidationRule => ({
    type: 'email',
    message
  }),
  
  url: (message?: string): ValidationRule => ({
    type: 'url',
    message
  }),
  
  uuid: (message?: string): ValidationRule => ({
    type: 'uuid',
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message
  }),
  
  length: (min: number, max: number, message?: string): ValidationRule => ({
    minLength: min,
    maxLength: max,
    message
  }),
  
  min: (min: number, message?: string): ValidationRule => ({
    min,
    message
  }),
  
  max: (max: number, message?: string): ValidationRule => ({
    max,
    message
  }),
  
  range: (min: number, max: number, message?: string): ValidationRule => ({
    min,
    max,
    message
  }),
  
  pattern: (pattern: RegExp, message?: string): ValidationRule => ({
    pattern,
    message
  }),
  
  custom: (validator: (value: any) => boolean | string, message?: string): ValidationRule => ({
    custom: validator,
    message
  })
};

export const quizValidationSchema: ValidationSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 255
  },
  description: {
    type: 'string',
    maxLength: 1000
  },
  category: {
    type: 'string',
    maxLength: 100
  },
  pass_percentage: {
    type: 'number',
    min: 0,
    max: 100
  }
};

export const quizQuestionValidationSchema: ValidationSchema = {
  question_text: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 1000
  },
  explanation: {
    type: 'string',
    maxLength: 1000
  },
  rationale: {
    type: 'string',
    maxLength: 1000
  },
  learning_outcome: {
    type: 'string',
    maxLength: 1000
  },
  question_number: {
    required: true,
    type: 'number',
    min: 1
  },
  points: {
    type: 'number',
    min: 0
  }
};

export const quizAnswerValidationSchema: ValidationSchema = {
  answer_text: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 500
  },
  answer_letter: {
    required: true,
    type: 'string',
    pattern: /^[A-D]$/
  },
  is_correct: {
    required: true,
    type: 'boolean'
  }
};

export const quizCompletionValidationSchema: ValidationSchema = {
  quiz_id: {
    required: true,
    type: 'uuid'
  },
  user_id: {
    required: true,
    type: 'uuid'
  },
  score: {
    required: true,
    type: 'number',
    min: 0
  },
  max_score: {
    required: true,
    type: 'number',
    min: 0
  },
  percentage: {
    required: true,
    type: 'number',
    min: 0,
    max: 100
  },
  passed: {
    required: true,
    type: 'boolean'
  },
  time_spent: {
    type: 'number',
    min: 0
  },
  answers: {
    type: 'array'
  },
  attempts: {
    type: 'number',
    min: 1
  }
};

export const articleValidationSchema: ValidationSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 255
  },
  content: {
    type: 'string'
  },
  excerpt: {
    type: 'string',
    maxLength: 500
  },
  author: {
    type: 'string',
    maxLength: 100
  },
  category: {
    type: 'string',
    maxLength: 100
  },
  published: {
    type: 'boolean'
  },
  featured: {
    type: 'boolean'
  },
  slug: {
    type: 'string',
    maxLength: 255,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  }
};

export const userValidationSchema: ValidationSchema = {
  email: {
    required: true,
    type: 'email'
  },
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100
  },
  role: {
    type: 'string',
    custom: (value) => ['super_admin', 'admin', 'editor', 'user', 'viewer'].includes(value)
  },
  avatar_url: {
    type: 'url'
  }
};

export function createValidationMiddleware(schema: ValidationSchema) {
  return (req: any, res: any, next: () => void) => {
    const result = validateData(req.body, schema);
    
    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.errors
      });
    }
    
    next();
  };
}

export function validateAndThrow(data: any, schema: ValidationSchema): void {
  const result = validateData(data, schema);
  
  if (!result.isValid) {
    const error = new Error('Validation failed');
    (error as any).statusCode = 400;
    (error as any).details = result.errors;
    throw error;
  }
}