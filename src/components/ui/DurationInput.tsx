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
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Convert value to minutes and seconds
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
    
    setMinutes(Math.floor(totalSeconds / 60));
    setSeconds(totalSeconds % 60);
  }, [value]);

  // Update parent when minutes or seconds change
  const updateDuration = (newMinutes: number, newSeconds: number) => {
    const totalSeconds = newMinutes * 60 + newSeconds;
    onChange(totalSeconds);
  };

  const incrementMinutes = () => {
    const newMinutes = Math.min(minutes + 1, 999);
    setMinutes(newMinutes);
    updateDuration(newMinutes, seconds);
  };

  const decrementMinutes = () => {
    const newMinutes = Math.max(minutes - 1, 0);
    setMinutes(newMinutes);
    updateDuration(newMinutes, seconds);
  };

  const incrementSeconds = () => {
    let newSeconds = seconds + 1;
    let newMinutes = minutes;
    
    if (newSeconds >= 60) {
      newSeconds = 0;
      newMinutes = Math.min(minutes + 1, 999);
    }
    
    setMinutes(newMinutes);
    setSeconds(newSeconds);
    updateDuration(newMinutes, newSeconds);
  };

  const decrementSeconds = () => {
    let newSeconds = seconds - 1;
    let newMinutes = minutes;
    
    if (newSeconds < 0) {
      if (minutes > 0) {
        newSeconds = 59;
        newMinutes = minutes - 1;
      } else {
        newSeconds = 0;
      }
    }
    
    setMinutes(newMinutes);
    setSeconds(newSeconds);
    updateDuration(newMinutes, newSeconds);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = Math.max(0, Math.min(parseInt(e.target.value) || 0, 999));
    setMinutes(newMinutes);
    updateDuration(newMinutes, seconds);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeconds = Math.max(0, Math.min(parseInt(e.target.value) || 0, 59));
    setSeconds(newSeconds);
    updateDuration(minutes, newSeconds);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Minutes */}
        <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <input
            type="number"
            value={minutes}
            onChange={handleMinutesChange}
            disabled={disabled}
            className="w-16 px-2 py-1 text-center border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="999"
          />
          <div className="flex flex-col border-l border-gray-300">
            <button
              type="button"
              onClick={incrementMinutes}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={decrementMinutes}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▼
            </button>
          </div>
        </div>

        <span className="text-gray-500 font-medium">:</span>

        {/* Seconds */}
        <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <input
            type="number"
            value={seconds.toString().padStart(2, '0')}
            onChange={handleSecondsChange}
            disabled={disabled}
            className="w-16 px-2 py-1 text-center border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0"
            max="59"
          />
          <div className="flex flex-col border-l border-gray-300">
            <button
              type="button"
              onClick={incrementSeconds}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={decrementSeconds}
              disabled={disabled}
              className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▼
            </button>
          </div>
        </div>

        <span className="text-sm text-gray-400">mm:ss</span>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};