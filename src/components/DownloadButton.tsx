import React, { useState } from 'react';

interface DownloadButtonProps {
  onClick: () => Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  onClick,
  disabled = false,
  children,
  icon,
  variant = 'secondary',
  size = 'sm'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base"
  };

  const variantClasses = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
    secondary: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {isLoading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : icon}
      {isLoading ? 'Downloading...' : children}
    </button>
  );
};

export default DownloadButton;