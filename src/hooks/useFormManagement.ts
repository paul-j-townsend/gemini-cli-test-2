import { useState, useCallback, useEffect } from 'react';

export interface FormField<T = any> {
  value: T;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
}

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: T) => string | null;
}

export interface ValidationSchema<T> {
  [K in keyof T]?: ValidationRule<T[K]>;
}

export interface FormManagementActions<T> {
  handleChange: (field: keyof T, value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (onSubmit: (data: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearErrors: () => void;
  reset: (newData?: Partial<T>) => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  setData: (data: T) => void;
  setSubmitting: (isSubmitting: boolean) => void;
}

export interface FormManagementConfig<T> {
  initialData: T;
  validationSchema?: ValidationSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

export interface FormManagementHook<T> extends FormState<T>, FormManagementActions<T> {}

/**
 * Generic hook for form state management with validation
 * Provides consistent form handling, validation, and error management
 * 
 * @template T - The type of the form data
 * @param config - Configuration object for the form
 * @returns Object containing form state and actions
 * 
 * @example
 * ```typescript
 * interface QuizForm {
 *   title: string;
 *   description: string;
 *   totalQuestions: number;
 *   passPercentage: number;
 * }
 * 
 * const {
 *   data,
 *   errors,
 *   isValid,
 *   isDirty,
 *   isSubmitting,
 *   handleChange,
 *   handleSubmit,
 *   reset
 * } = useFormManagement<QuizForm>({
 *   initialData: {
 *     title: '',
 *     description: '',
 *     totalQuestions: 0,
 *     passPercentage: 70
 *   },
 *   validationSchema: {
 *     title: { required: true, minLength: 3 },
 *     description: { required: true },
 *     totalQuestions: { required: true, min: 1 },
 *     passPercentage: { required: true, min: 0, max: 100 }
 *   },
 *   validateOnChange: true,
 *   validateOnBlur: true
 * });
 * ```
 */
export const useFormManagement = <T extends Record<string, any>>(
  config: FormManagementConfig<T>
): FormManagementHook<T> => {
  const {
    initialData,
    validationSchema = {},
    validateOnChange = false,
    validateOnBlur = true,
    resetOnSubmit = false,
  } = config;

  const [data, setDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate a single field based on the validation schema
   */
  const validateField = useCallback((field: keyof T): boolean => {
    const fieldValue = data[field];
    const fieldRules = validationSchema[field];

    if (!fieldRules) {
      return true;
    }

    let error: string | null = null;

    // Required validation
    if (fieldRules.required && (fieldValue === null || fieldValue === undefined || fieldValue === '')) {
      error = 'This field is required';
    }

    // String validations
    if (typeof fieldValue === 'string' && fieldValue !== '' && !error) {
      if (fieldRules.minLength && fieldValue.length < fieldRules.minLength) {
        error = `Minimum length is ${fieldRules.minLength} characters`;
      }
      if (fieldRules.maxLength && fieldValue.length > fieldRules.maxLength) {
        error = `Maximum length is ${fieldRules.maxLength} characters`;
      }
      if (fieldRules.pattern && !fieldRules.pattern.test(fieldValue)) {
        error = 'Invalid format';
      }
    }

    // Number validations
    if (typeof fieldValue === 'number' && !error) {
      if (fieldRules.min !== undefined && fieldValue < fieldRules.min) {
        error = `Minimum value is ${fieldRules.min}`;
      }
      if (fieldRules.max !== undefined && fieldValue > fieldRules.max) {
        error = `Maximum value is ${fieldRules.max}`;
      }
    }

    // Custom validation
    if (fieldRules.custom && !error) {
      error = fieldRules.custom(fieldValue);
    }

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
  const validate = useCallback(): boolean => {
    const fields = Object.keys(validationSchema) as Array<keyof T>;
    let isFormValid = true;

    fields.forEach(field => {
      const isFieldValid = validateField(field);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [validationSchema, validateField]);

  /**
   * Handle field value changes
   */
  const handleChange = useCallback((field: keyof T, value: T[keyof T]) => {
    setDataState(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      // Validate after state update
      setTimeout(() => validateField(field), 0);
    }
  }, [validateOnChange, validateField]);

  /**
   * Handle field blur events
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
  const handleSubmit = useCallback((onSubmit: (data: T) => Promise<void> | void) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      
      try {
        // Validate all fields before submission
        const isValid = validate();
        
        if (!isValid) {
          // Mark all fields as touched to show validation errors
          const allFields = Object.keys(validationSchema) as Array<keyof T>;
          const touchedState = allFields.reduce((acc, field) => {
            acc[field] = true;
            return acc;
          }, {} as Partial<Record<keyof T, boolean>>);
          
          setTouched(touchedState);
          return;
        }

        // Submit the form
        await onSubmit(data);
        
        // Reset form if configured to do so
        if (resetOnSubmit) {
          reset();
        }
      } catch (error) {
        console.error('Form submission error:', error);
        // Error handling can be extended here
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [data, validate, validationSchema, resetOnSubmit]);

  /**
   * Set a specific field value
   */
  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setDataState(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Set a specific field error
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Clear a specific field error
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
   * Reset form to initial state or new data
   */
  const reset = useCallback((newData?: Partial<T>) => {
    const resetData = newData ? { ...initialData, ...newData } : initialData;
    setDataState(resetData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  /**
   * Set form data directly
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

  // Calculate derived state
  const isValid = Object.keys(errors).length === 0 && Object.keys(validationSchema).length > 0;
  const isDirty = JSON.stringify(data) !== JSON.stringify(initialData);

  // Auto-validate on data changes if configured
  useEffect(() => {
    if (validateOnChange && Object.keys(touched).length > 0) {
      validate();
    }
  }, [data, validateOnChange, touched, validate]);

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