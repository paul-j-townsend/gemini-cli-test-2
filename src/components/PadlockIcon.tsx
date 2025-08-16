import React from 'react';
import { Lock, Unlock } from 'lucide-react';

interface PadlockIconProps {
  isLocked: boolean;
  size?: number;
  className?: string;
}

const PadlockIcon: React.FC<PadlockIconProps> = ({ 
  isLocked, 
  size = 24, 
  className = '' 
}) => {
  const Icon = isLocked ? Lock : Unlock;
  
  return (
    <Icon 
      size={size}
      className={`${isLocked ? 'text-emerald-400' : 'text-emerald-600'} ${className}`}
    />
  );
};

export default PadlockIcon;