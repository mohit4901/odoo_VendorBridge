import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  icon: Icon = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full bg-zinc-950 border text-sm text-zinc-200 placeholder-zinc-600 rounded-lg py-2.5 transition-all duration-200 outline-none
            ${Icon ? 'pl-11 pr-4' : 'px-4'} 
            ${error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30' 
              : 'border-zinc-800 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20'
            }`}
        />
      </div>
      {error && (
        <span className="text-xs text-red-400 mt-0.5">{error}</span>
      )}
    </div>
  );
};

export default Input;
