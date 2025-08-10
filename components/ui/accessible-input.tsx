import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formAccessibility } from '@/lib/accessibility';

interface AccessibleInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  // Accessibility props
  label: string;
  id: string;
  error?: string;
  description?: string;
  required?: boolean;
  showRequiredIndicator?: boolean;
  
  // Enhanced features
  characterLimit?: number;
  showCharacterCount?: boolean;
}

export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    label,
    id,
    error,
    description,
    required = false,
    showRequiredIndicator = true,
    characterLimit,
    showCharacterCount = false,
    value,
    onChange,
    ...props
  }, ref) => {
    const errorId = formAccessibility.getErrorId(id);
    const descriptionId = formAccessibility.getHelpId(id);
    const characterCountId = `${id}-character-count`;
    
    const currentLength = typeof value === 'string' ? value.length : 0;
    const remainingCharacters = characterLimit ? characterLimit - currentLength : null;
    
    // Build aria-describedby string
    const ariaDescribedBy = React.useMemo(() => {
      const parts = [];
      if (description) parts.push(descriptionId);
      if (error) parts.push(errorId);
      if (showCharacterCount && characterLimit) parts.push(characterCountId);
      return parts.length > 0 ? parts.join(' ') : undefined;
    }, [description, error, showCharacterCount, characterLimit, descriptionId, errorId, characterCountId]);

    const isOverLimit = characterLimit && currentLength > characterLimit;

    return (
      <div className="space-y-2">
        <Label 
          htmlFor={id}
          className={`block text-sm font-medium ${required && showRequiredIndicator ? 'form-field-required' : ''}`}
        >
          {label}
          {required && (
            <span className="sr-only">Required field</span>
          )}
        </Label>
        
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {description}
          </p>
        )}
        
        <Input
          ref={ref}
          id={id}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy}
          value={value}
          onChange={onChange}
          className={`${error ? 'border-red-500 focus:ring-red-500' : ''} ${
            isOverLimit ? 'border-red-500' : ''
          }`}
          {...props}
        />
        
        {error && (
          <p 
            id={errorId}
            role="alert"
            className="form-error text-sm text-red-600 dark:text-red-400"
          >
            <span className="sr-only">Error: </span>
            {error}
          </p>
        )}
        
        {showCharacterCount && characterLimit && (
          <p 
            id={characterCountId}
            className={`text-sm ${
              isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            }`}
            aria-live="polite"
          >
            <span className="sr-only">
              {isOverLimit ? 'Character limit exceeded: ' : 'Characters used: '}
            </span>
            {currentLength}{characterLimit && ` / ${characterLimit}`}
            {remainingCharacters !== null && remainingCharacters < 0 && (
              <span className="sr-only">
                , {Math.abs(remainingCharacters)} characters over limit
              </span>
            )}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';