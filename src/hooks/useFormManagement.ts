import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Validation rule for a single field
 */
export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: T) => string | null;
}

/**
 * Validation schema for a form
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

/**
 * Configuration for form management
 */
export interface FormManagementConfig<T> {
  initialData: T;
  validationSchema?: ValidationSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

/**
 * Form management hook return type
 */
export interface FormManagementHook<T> {
  // State
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  
  // Actions
  handleChange: (field: keyof T, value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearErrors: () => void;
  reset: () => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  setData: (data: T) => void;
  setSubmitting: (submitting: boolean) => void;
}

/**
 * Hook for managing form state with validation
 */
export const useFormManagement = <T extends Record<string, any>>(
  config: FormManagementConfig<T>
): FormManagementHook<T> => {
  const {
    initialData,
    validationSchema = {} as ValidationSchema<T>,
    validateOnChange = false,
    validateOnBlur = true,
    resetOnSubmit = false,
  } = config;

  const [data, setDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: keyof T): boolean => {
    const fieldValue = data[field];
    const fieldRules = validationSchema[field];

    if (!fieldRules) {
      return true;
    }

    let error: string | null = null;

    // Required validation
    if (fieldRules.required) {
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        error = `${String(field)} is required`;
      }
    }

    // String validations
    if (error === null && typeof fieldValue === 'string') {
      if (fieldRules.minLength && fieldValue.length < fieldRules.minLength) {
        error = `${String(field)} must be at least ${fieldRules.minLength} characters`;
      }
      if (fieldRules.maxLength && fieldValue.length > fieldRules.maxLength) {
        error = `${String(field)} must be no more than ${fieldRules.maxLength} characters`;
      }
      if (fieldRules.pattern && !fieldRules.pattern.test(fieldValue)) {
        error = `${String(field)} format is invalid`;
      }
    }

    // Number validations
    if (error === null && typeof fieldValue === 'number') {
      if (fieldRules.min !== undefined && fieldValue < fieldRules.min) {
        error = `${String(field)} must be at least ${fieldRules.min}`;
      }
      if (fieldRules.max !== undefined && fieldValue > fieldRules.max) {
        error = `${String(field)} must be no more than ${fieldRules.max}`;
      }
    }

    // Custom validation
    if (error === null && fieldRules.custom) {
      error = fieldRules.custom(fieldValue);
    }

    // Update errors state
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }, [data, validationSchema]);

  /**
   * Validate all fields
   */
  const validate = useCallback((): boolean => {
    const fields = Object.keys(validationSchema) as Array<keyof T>;
    const results = fields.map(field => validateField(field));
    return results.every(result => result === true);
  }, [validationSchema, validateField]);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Check if form is dirty
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  /**
   * Handle field change
   */
  const handleChange = useCallback((field: keyof T, value: T[keyof T]) => {
    setDataState(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      setTimeout(() => validateField(field), 0);
    }
  }, [validateOnChange, validateField]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (validateOnBlur) {
      validateField(field);
    }
  }, [validateOnBlur, validateField]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((onSubmit: (data: T) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      
      try {
        const isValidForm = validate();
        
        if (isValidForm) {
          await onSubmit(data);
          
          if (resetOnSubmit) {
            setDataState(initialData);
            setErrors({});
            setTouched({});
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [data, validate, resetOnSubmit, initialData]);

  /**
   * Set field value
   */
  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setDataState(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Set field error
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Reset form
   */
  const reset = useCallback(() => {
    setDataState(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  /**
   * Set form data
   */
  const setData = useCallback((newData: T) => {
    setDataState(newData);
  }, []);

  /**
   * Set submitting state
   */
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  return {
    // State
    data,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    
    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    clearFieldError,
    clearErrors,
    reset,
    validate,
    validateField,
    setData,
    setSubmitting,
  };
};

export default useFormManagement;