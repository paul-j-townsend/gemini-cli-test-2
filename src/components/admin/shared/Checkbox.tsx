import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50"
      />
      <label htmlFor={checkboxId} className="ml-2 text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;