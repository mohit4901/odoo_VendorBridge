import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  hoverable = false,
  noPadding = false
}) => {
  return (
    <div 
      className={`bg-zinc-950 border border-zinc-800/85 rounded-xl transition-all duration-300 overflow-hidden
        ${hoverable ? 'hover:border-zinc-700/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(6,182,212,0.05)]' : ''} 
        ${className}`}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 border-b border-zinc-900/60 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-zinc-100 tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex items-center gap-2">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
