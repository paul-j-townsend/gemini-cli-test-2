import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { FormManagementHook } from '@/hooks/useFormManagement';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'select' | 'checkbox' | 'datetime-local' | 'custom';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  render?: (value: any, onChange: (value: any) => void, error?: string) => React.ReactNode;
  gridColumn?: 'span-1' | 'span-2' | 'span-3' | 'span-full';
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface FormSection {
  title?: string;
  fields: FormField[];
  columns?: 1 | 2 | 3;
}

interface AdminFormProps<T> {
  title: string;
  formHook: FormManagementHook<T>;
  sections: FormSection[];
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
  loading?: boolean;
  error?: string;
}

export function AdminForm<T extends Record<string, any>>({
  title,
  formHook,
  sections,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  className = '',
  loading = false,
  error,
}: AdminFormProps<T>) {
  const {
    data,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = formHook;

  const renderField = (field: FormField) => {
    const value = data[field.name];
    const fieldError = errors[field.name];
    const isFieldDisabled = field.disabled || isSubmitting;

    const handleFieldChange = (newValue: any) => {
      handleChange(field.name, newValue);
    };

    const handleFieldBlur = () => {
      handleBlur(field.name);
    };

    if (field.type === 'custom' && field.render) {
      return field.render(value, handleFieldChange, fieldError);
    }

    switch (field.type) {
      case 'textarea':
        return (
          <div className="space-y-2">
            <label htmlFor={field.name} className="block text-sm font-medium text-emerald-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.name}
              value={value || ''}
              onChange={(e) => handleFieldChange(e.target.value)}
              onBlur={handleFieldBlur}
              rows={field.rows || 3}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                fieldError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500'
              }`}
              placeholder={field.placeholder}
              required={field.required}
              disabled={isFieldDisabled}
            />
            {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <label htmlFor={field.name} className="block text-sm font-medium text-emerald-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={field.name}
              value={value || ''}
              onChange={(e) => handleFieldChange(e.target.value)}
              onBlur={handleFieldBlur}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                fieldError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500'
              }`}
              required={field.required}
              disabled={isFieldDisabled}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id={field.name}
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleFieldChange(e.target.checked)}
                onBlur={handleFieldBlur}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded"
                disabled={isFieldDisabled}
              />
              <label htmlFor={field.name} className="ml-2 block text-sm text-emerald-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {fieldError && <p className="text-sm text-red-500">{fieldError}</p>}
          </div>
        );

      case 'number':
        return (
          <Input
            id={field.name}
            label={field.label}
            type="number"
            value={value?.toString() || ''}
            onChange={(val) => handleFieldChange(val === '' ? null : parseFloat(val))}
            onBlur={handleFieldBlur}
            error={fieldError}
            required={field.required}
            disabled={isFieldDisabled}
            placeholder={field.placeholder}
            // Add number-specific props
            {...(field.min !== undefined && { min: field.min })}
            {...(field.max !== undefined && { max: field.max })}
            {...(field.step !== undefined && { step: field.step })}
          />
        );

      default:
        return (
          <Input
            id={field.name}
            label={field.label}
            type={field.type || 'text'}
            value={value || ''}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            error={fieldError}
            required={field.required}
            disabled={isFieldDisabled}
            placeholder={field.placeholder}
          />
        );
    }
  };

  const getGridClass = (columns: number) => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const getColumnSpanClass = (span?: FormField['gridColumn']) => {
    switch (span) {
      case 'span-1':
        return 'col-span-1';
      case 'span-2':
        return 'col-span-2';
      case 'span-3':
        return 'col-span-3';
      case 'span-full':
        return 'col-span-full';
      default:
        return 'col-span-1';
    }
  };

  return (
    <Card title={title} className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <ErrorDisplay error={error} onDismiss={() => {}} />
        )}

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            {section.title && (
              <div className="border-b pb-2">
                <h3 className="text-lg font-medium text-emerald-900">{section.title}</h3>
              </div>
            )}
            
            <div className={`grid gap-4 ${getGridClass(section.columns || 2)}`}>
              {section.fields.map((field) => (
                <div key={field.name} className={getColumnSpanClass(field.gridColumn)}>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || loading}
            disabled={!isValid || !isDirty || isSubmitting}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default AdminForm;