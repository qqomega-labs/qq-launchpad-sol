import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'ghost' | 'tab';
  active?: boolean;
  children: ReactNode;
}

/**
 * @dev Reusable button component with accent, ghost, and tab variants
 */
export function Button({
  variant = 'accent',
  active = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'font-medium transition-all duration-150 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    accent:
      'bg-accent hover:bg-accent-hover text-white rounded-[12px] px-6 py-3 w-full text-base',
    ghost:
      'bg-transparent border border-border hover:border-border-active text-text-secondary hover:text-white rounded-[8px] px-3 py-1.5 text-sm',
    tab: `rounded-[8px] px-4 py-2 text-sm ${
      active
        ? 'bg-accent text-white'
        : 'bg-transparent text-text-secondary hover:text-white'
    }`,
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
