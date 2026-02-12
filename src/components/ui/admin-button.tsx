'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'export' | 'icon';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  badge?: number | string;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-amber-500 to-amber-600
    text-white font-semibold
    shadow-md shadow-amber-500/20
    hover:from-amber-600 hover:to-amber-700
    hover:shadow-lg hover:shadow-amber-500/30
    active:from-amber-700 active:to-amber-800 active:shadow-sm
    focus:ring-2 focus:ring-amber-300 focus:ring-offset-2
  `,
  secondary: `
    bg-gray-800 text-white font-medium
    shadow-sm
    hover:bg-gray-900 hover:shadow-md
    active:bg-gray-950 active:shadow-sm
    focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
  `,
  outline: `
    bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium
    border-2 border-gray-200 dark:border-gray-600
    shadow-sm
    hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md
    active:bg-gray-100 dark:active:bg-gray-600 active:shadow-sm
    focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
  `,
  ghost: `
    bg-transparent text-gray-600 dark:text-gray-300 font-medium
    hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100
    active:bg-gray-200 dark:active:bg-gray-600
    focus:ring-2 focus:ring-gray-200
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600
    text-white font-semibold
    shadow-md shadow-red-500/20
    hover:from-red-600 hover:to-red-700 hover:shadow-lg
    active:from-red-700 active:to-red-800 active:shadow-sm
    focus:ring-2 focus:ring-red-300 focus:ring-offset-2
  `,
  success: `
    bg-gradient-to-r from-emerald-500 to-emerald-600
    text-white font-semibold
    shadow-md shadow-emerald-500/20
    hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg
    active:from-emerald-700 active:to-emerald-800 active:shadow-sm
    focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2
  `,
  export: `
    bg-gradient-to-r from-blue-500 to-blue-600
    text-white font-medium
    shadow-md shadow-blue-500/20
    hover:from-blue-600 hover:to-blue-700 hover:shadow-lg
    active:from-blue-700 active:to-blue-800 active:shadow-sm
    focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
  `,
  icon: `
    bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
    border border-gray-200 dark:border-gray-600
    shadow-sm
    hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md
    active:bg-gray-100 dark:active:bg-gray-600 active:shadow-sm
    focus:ring-2 focus:ring-gray-200
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
  sm: 'px-3.5 py-2 text-sm rounded-lg gap-2',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export function AdminButton({
  variant = 'outline',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  badge,
  children,
  className = '',
  disabled,
  ...props
}: AdminButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        select-none relative
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${variant === 'icon' ? '!px-2.5 !py-2.5' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      {badge !== undefined && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}

export default AdminButton;
