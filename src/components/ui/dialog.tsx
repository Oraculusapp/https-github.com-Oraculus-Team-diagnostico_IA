import React from 'react';

export const Dialog = ({ children, open, onOpenChange }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        {children}
        <button 
          onClick={() => onOpenChange?.(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const DialogContent = ({ children }: any) => <div>{children}</div>;
export const DialogHeader = ({ children }: any) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
export const DialogTitle = ({ children }: any) => <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>;
export const DialogDescription = ({ children }: any) => <p className="text-sm text-muted-foreground">{children}</p>;
