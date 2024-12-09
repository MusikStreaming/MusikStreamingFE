'use client';

import { twMerge } from 'tailwind-merge';
import { ChangeEvent } from 'react';

// interface ChipInputProps {
//   label: string;
//   value?: string;
//   onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
//   icon?: string;
//   className?: string;
//   disabled?: boolean;
// }

/**
 * @param {Object} props
 * @param {string} label
 * @param {string} value
 * @param {function} onChange
 * @param {string} icon
 * @param {string} className
 * @param {boolean} disabled
 * @returns {JSX.Element}
 */
export default function ChipInput({ 
  label,
  value,
  onChange,
  icon,
  className,
  disabled = false,
  ...props
}) {
  return (
    <div 
      className={twMerge(
        "inline-flex items-center px-3 py-1 rounded-full",
        "bg-[--md-sys-color-surface-container]",
        "hover:bg-[--md-sys-color-surface-container-high]",
        "transition-colors duration-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined mr-2 text-[--md-sys-color-on-surface-variant]">
          {icon}
        </span>
      )}
      
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={label}
        className={twMerge(
          "bg-transparent border-none outline-none",
          "text-[--md-sys-color-on-surface]",
          "placeholder:text-[--md-sys-color-on-surface-variant]",
          "text-sm"
        )}
      />
    </div>
  );
} 