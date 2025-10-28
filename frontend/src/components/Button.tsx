import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-slate-900/10';

  const variantClasses = {
    primary:
      'bg-slate-900 text-slate-100 hover:bg-slate-800 hover:-translate-y-0.5 focus-visible:ring-slate-500 focus-visible:ring-offset-slate-900',
    secondary:
      'bg-white/80 text-slate-900 border border-slate-200 hover:bg-white focus-visible:ring-indigo-300 focus-visible:ring-offset-white',
    danger:
      'bg-rose-600/90 text-white hover:bg-rose-600 focus-visible:ring-rose-500 focus-visible:ring-offset-slate-900',
  } as const;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-3.5 text-lg',
  } as const;

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
};

export default Button;
