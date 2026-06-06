import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon: Icon = null
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-250 active:scale-97 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2'
  };

  const variants = {
    primary: 'bg-cyan-500 text-black hover:bg-cyan-400 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    secondary: 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700',
    outline: 'border border-cyan-500/30 text-cyan-400 bg-transparent hover:bg-cyan-500/10 hover:border-cyan-500 hover:text-cyan-300',
    danger: 'bg-red-950/60 border border-red-800/60 text-red-400 hover:bg-red-900/60 hover:text-red-200'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
