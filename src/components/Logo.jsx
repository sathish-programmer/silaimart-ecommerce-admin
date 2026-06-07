import React from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const Logo = ({ className = '', textClassName = 'text-2xl', iconClassName = 'w-8 h-8', invert = false }) => {
  const textColor = invert ? 'text-white' : 'text-gray-900';
  const primaryColor = invert ? 'text-white/80' : 'text-primary-600';
  const iconColor = invert ? 'text-white' : 'text-primary-600';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center justify-center rounded-lg ${iconColor}`}>
        <ShoppingBagIcon className={iconClassName} strokeWidth={2.5} />
      </div>
      <div className={`font-black tracking-tighter ${textClassName} ${textColor}`}>
        SILAI<span className={primaryColor}>MART</span>
      </div>
    </div>
  );
};

export default Logo;
