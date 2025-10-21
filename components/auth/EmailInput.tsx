'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { validateEmail } from '@/lib/auth-client';

interface EmailInputProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  'data-testid'?: string;
}

export const EmailInput = ({ 
  id, 
  name, 
  value, 
  onChange,
  onBlur,
  placeholder = "your.email@example.com", 
  className = "",
  required = false,
  'data-testid': dataTestId,
  ...props 
}: EmailInputProps) => {
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    
    // Call parent onChange if provided
    if (onChange) {
      onChange(e);
    }

    // Validate email in real-time
    if (email && !validateEmail(email)) {
      setError('Only Gmail and Outlook emails are allowed');
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-1">
      <Input
        id={id}
        name={name}
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`${className} ${error ? 'border-red-500' : ''}`}
        title="Only Gmail and Outlook emails are allowed"
        required={required}
        data-testid={dataTestId}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};
