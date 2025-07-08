import React from 'react';
import { Heart } from 'lucide-react';

interface HeartIconProps {
  size?: number;
  className?: string;
}

const HeartIcon: React.FC<HeartIconProps> = ({ 
  size = 24, 
  className = "text-white" 
}) => (
  <Heart size={size} className={className} fill="currentColor" />
);

export default HeartIcon;