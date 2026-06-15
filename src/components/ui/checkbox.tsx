import React from 'react';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox = ({ id, checked, onCheckedChange, className = '' }: CheckboxProps) => (
  <input
    id={id}
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${className}`}
  />
);
