import React, { useState, useEffect } from 'react';

interface DurationInputProps {
  label?: string;
  value: string | number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const DurationInput: React.FC<DurationInputProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "0:00"
}) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Convert value to hours and minutes
  useEffect(() => {
    let totalSeconds = 0;
    
    if (typeof value === 'number') {
      totalSeconds = value;
    } else if (typeof value === 'string' && value.includes(':')) {
      const parts = value.split(':').map(Number);
      if (parts.length === 2) {
        totalSeconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
    
    setHours(Math.floor(totalSeconds / 3600));
    setMinutes(Math.floor((totalSeconds % 3600) / 60));
  }, [value]);

  // Update parent when hours or minutes change
  const updateDuration = (newHours: number, newMinutes: number) => {
    const totalSeconds = newHours * 3600 + newMinutes * 60;
    onChange(totalSeconds);
  };

  const incrementHours = () => {
    const newHours = Math.min(hours + 1, 999);
    setHours(newHours);
    updateDuration(newHours, minutes);
  };

  const decrementHours = () => {
    const newHours = Math.max(hours - 1, 0);
    setHours(newHours);
    updateDuration(newHours, minutes);
  };

  const incrementMinutes = () => {
    let newMinutes = minutes + 1;
    let newHours = hours;
    
    if (newMinutes >= 60) {
      newMinutes = 0;
      newHours = Math.min(hours + 1, 999);
    }
    
    setHours(newHours);
    setMinutes(newMinutes);
    updateDuration(newHours, newMinutes);
  };

  const decrementMinutes = () => {
    let newMinutes = minutes - 1;
    let newHours = hours;
    
    if (newMinutes < 0) {
      if (hours > 0) {
        newMinutes = 59;
        newHours = hours - 1;
      } else {
        newMinutes = 0;
      }
    }
    
    setHours(newHours);
    setMinutes(newMinutes);
    updateDuration(newHours, newMinutes);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = Math.max(0, Math.min(parseInt(e.target.value) || 0, 999));
    setHours(newHours);
    updateDuration(newHours, minutes);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = Math.max(0, Math.min(parseInt(e.target.value) || 0, 59));
    setMinutes(newMinutes);
    updateDuration(hours, newMinutes);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-emerald-700">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Hours */}
        <div className="flex items-center border border-emerald-300 rounded-md focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
          <input
            type="number"
            value={hours}
            onChange={handleHoursChange}
            disabled={disabled}
            className="w-16 px-2 py-1 text-center border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="999"
          />
          <div className="flex flex-col border-l border-emerald-300">
            <button
              type="button"
              onClick={incrementHours}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={decrementHours}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▼
            </button>
          </div>
        </div>

        <span className="text-emerald-500 font-medium">:</span>

        {/* Minutes */}
        <div className="flex items-center border border-emerald-300 rounded-md focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
          <input
            type="number"
            value={minutes.toString().padStart(2, '0')}
            onChange={handleMinutesChange}
            disabled={disabled}
            className="w-16 px-2 py-1 text-center border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="59"
          />
          <div className="flex flex-col border-l border-emerald-300">
            <button
              type="button"
              onClick={incrementMinutes}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={decrementMinutes}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▼
            </button>
          </div>
        </div>

        <span className="text-sm text-emerald-400">hh:mm</span>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};