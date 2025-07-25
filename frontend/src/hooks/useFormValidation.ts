import { useState, useCallback, useMemo } from 'react';

// Tipos de validación
interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

interface FieldConfig<T> {
  rules?: ValidationRule<T>[];
  required?: boolean;
  requiredMessage?: string;
}

type FormConfig<T extends Record<string, any>> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

interface UseFormValidationReturn<T extends Record<string, any>> {
  state: FormState<T>;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  setAllTouched: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  reset: (values?: Partial<T>) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  config: FormConfig<T>
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as Record<keyof T, boolean>)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateSingleField = useCallback((field: keyof T, value: T[keyof T]): string | null => {
    const fieldConfig = config[field];
    if (!fieldConfig) return null;

    // Validar requerido
    if (fieldConfig.required) {
      const isEmpty = value === null || value === undefined || value === '';
      if (isEmpty) {
        return fieldConfig.requiredMessage || `${String(field)} es requerido`;
      }
    }

    // Validar reglas personalizadas
    if (fieldConfig.rules) {
      for (const rule of fieldConfig.rules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }
    }

    return null;
  }, [config]);

  const errors = useMemo(() => {
    const result: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
    
    for (const field in values) {
      result[field] = validateSingleField(field, values[field]);
    }
    
    return result;
  }, [values, validateSingleField]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => error === null);
  }, [errors]);

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const setAllTouched = useCallback(() => {
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouched(allTouched);
  }, [values]);

  const validateField = useCallback((field: keyof T) => {
    const error = validateSingleField(field, values[field]);
    return error === null;
  }, [values, validateSingleField]);

  const validateForm = useCallback(() => {
    setAllTouched();
    return isValid;
  }, [isValid, setAllTouched]);

  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = { ...initialValues, ...newValues };
    setValues(resetValues);
    setTouched(Object.keys(resetValues).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as Record<keyof T, boolean>));
    setIsSubmitting(false);
  }, [initialValues]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateForm]);

  const state: FormState<T> = {
    values,
    errors,
    touched,
    isValid,
    isSubmitting
  };

  return {
    state,
    setValue,
    setFieldTouched,
    setAllTouched,
    validateField,
    validateForm,
    reset,
    setSubmitting,
    handleSubmit
  };
}

// Validadores comunes
export const validators = {
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Ingresa un email válido'
  },
  url: {
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Ingresa una URL válida'
  },
  instagramUrl: {
    validate: (value: string) => /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?/.test(value),
    message: 'Ingresa una URL válida de Instagram'
  },
  minLength: (length: number) => ({
    validate: (value: string) => value.length >= length,
    message: `Debe tener al menos ${length} caracteres`
  }),
  maxLength: (length: number) => ({
    validate: (value: string) => value.length <= length,
    message: `Debe tener máximo ${length} caracteres`
  }),
  pattern: (regex: RegExp, message: string) => ({
    validate: (value: string) => regex.test(value),
    message
  })
}; 