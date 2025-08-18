import React, { useState } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface EmailFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  value = '',
  onChange,
  className,
  error,
  ...props
}) => {
  const [localPart, setLocalPart] = useState(
    String(value).replace(/@gmail\.com$/, '')
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalPart(inputValue);
    onChange?.(inputValue ? `${inputValue}@gmail.com` : '');
  };

  return (
    <div className="relative">
      <div className={cn(
        "flex items-center border rounded-md overflow-hidden",
        error ? "border-red-500" : "border-input",
        className
      )}>
        <Input
          {...props}
          type="text"
          value={localPart}
          onChange={handleChange}
          className="border-none focus-visible:ring-0"
          placeholder="votre.nom"
        />
        <span className="pr-3 text-sm text-muted-foreground">@gmail.com</span>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};