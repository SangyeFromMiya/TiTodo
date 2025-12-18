import React from 'react';
import { cn } from '../utils';

interface CheckboxProps {
  checked: boolean;
  priority?: 'high' | 'medium' | 'low';
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  priority = 'medium',
  onChange,
  className,
}) => {
  const priorityClass = priority === 'high' ? 'checkbox-high' : 
                        priority === 'medium' ? 'checkbox-medium' : 'checkbox-low';

  return (
    <div
      className={cn(
        'checkbox-circle',
        priorityClass,
        checked && 'checkbox-checked',
        className
      )}
      onClick={() => onChange(!checked)}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
};