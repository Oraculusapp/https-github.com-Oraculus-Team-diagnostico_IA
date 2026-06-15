import React from 'react';

export const RadioGroup = ({ children, className = '', ...props }: any) => (
  <div className={`grid gap-2 ${className}`} {...props}>
    {children}
  </div>
);

export const RadioGroupItem = ({ className = '', ...props }: any) => (
  <input
    type="radio"
    className={`h-4 w-4 border-primary text-primary focus:ring-primary ${className}`}
    {...props}
  />
);
