import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AccessibleInput } from './accessible-input';
import { AccessibleButton } from './accessible-button';
import { useAccessibleForm, useScreenReader } from '../../hooks/useAccessibility';
import { cn } from '@/lib/utils';
import { formAccessibility } from '@/lib/accessibility';

interface AccessibleFormProps {
  schema: z.ZodSchema;
  onSubmit: (data: any) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  submitButtonText?: string;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  schema,
  onSubmit,
  children,
  className = '',
  title,
  description,
  submitButtonText = 'Submit',
  isLoading = false,
  errorMessage,
  successMessage
}) => {
  const { announceError: formAnnounceError, announceSuccess: formAnnounceSuccess } = useAccessibleForm();
  const { announce } = useScreenReader();
  
  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur'
  });

  const { handleSubmit, formState: { errors, isSubmitting } } = methods;

  // Announce form errors when they change
  React.useEffect(() => {
    const errorEntries = Object.entries(errors);
    if (errorEntries.length > 0) {
      const errorMessages = errorEntries.reduce((acc, [key, error]) => {
        if (error?.message) {
          acc[key] = typeof error.message === 'string' ? error.message : String(error.message);
        }
        return acc;
      }, {} as Record<string, string>);
      formAnnounceError('Form validation errors', JSON.stringify(errorMessages));
    }
  }, [errors, formAnnounceError]);

  // Announce success/error messages
  React.useEffect(() => {
    if (errorMessage) {
      formAnnounceError('Form error', errorMessage);
    }
  }, [errorMessage, formAnnounceError]);

  React.useEffect(() => {
    if (successMessage) {
      formAnnounceSuccess(successMessage);
    }
  }, [successMessage, formAnnounceSuccess]);

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={handleSubmit(handleFormSubmit)}
        className={`space-y-6 ${className}`}
        role="form"
        aria-labelledby={title ? 'form-title' : undefined}
        aria-describedby={description ? 'form-description' : undefined}
        noValidate
      >
        {title && (
          <h2 id="form-title" className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
        )}
        
        {description && (
          <p id="form-description" className="text-gray-600">
            {description}
          </p>
        )}

        {/* Global form error */}
        {errorMessage && (
          <div 
            role="alert"
            className="bg-red-50 border border-red-200 rounded-md p-4"
          >
            <p className="text-red-800 text-sm">
              <span className="sr-only">Error: </span>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Global form success */}
        {successMessage && (
          <div 
            role="status"
            className="bg-green-50 border border-green-200 rounded-md p-4"
          >
            <p className="text-green-800 text-sm">
              <span className="sr-only">Success: </span>
              {successMessage}
            </p>
          </div>
        )}

        {children}

        <AccessibleButton
          type="submit"
          isLoading={isLoading || isSubmitting}
          loadingText="Submitting..."
          disabled={isLoading || isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          ariaLabel={`${submitButtonText} form`}
        >
          {submitButtonText}
        </AccessibleButton>
      </form>
    </FormProvider>
  );
};

// Field wrapper component for consistent form field styling
interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  error,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
      {error && (
        <p 
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
};