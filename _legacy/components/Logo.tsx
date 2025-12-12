import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "text-ace-blue" }) => {
  // Extract text color class if present, otherwise default to text-ace-blue
  const isCustomColor = className.includes('text-');
  const textColorClass = isCustomColor ? '' : 'text-ace-blue';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M16 4L4 28H8L16 10L24 28H28L16 4Z" 
          fill="currentColor" 
        />
        <path 
          d="M10 20L22 20" 
          stroke="currentColor" 
          strokeWidth="2"
        />
        <path 
          d="M16 4L22 16" 
          stroke="currentColor" 
          strokeWidth="1"
          strokeOpacity="0.2"
        />
      </svg>
      <span className={`font-serif font-bold text-2xl tracking-tight ${textColorClass}`}>ACE</span>
    </div>
  );
};