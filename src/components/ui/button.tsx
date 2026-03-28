import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'ghost' | 'tab';
  active?: boolean;
  children: ReactNode;
}

/**
 * @dev Reusable button component with accent, ghost, and tab variants.
 * Accent uses a translucent pink fill matching qq-omega-landing glass style.
 */
export function Button({
  variant = 'accent',
  active = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'font-medium transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    accent: [
      'bg-[rgba(253,1,90,0.15)] hover:bg-[rgba(253,1,90,0.25)]',
      'text-white rounded-[12px] px-6 py-3 w-full text-base',
      'border border-accent/35 hover:border-accent/50',
      'shadow-[0_0_20px_rgba(253,1,90,0.08)]',
      'active:scale-[0.98]',
    ].join(' '),
    ghost: [
      'bg-transparent border border-border hover:border-border-active',
      'text-text-secondary hover:text-white rounded-[8px] px-3 py-1.5 text-sm',
    ].join(' '),
    tab: [
      'rounded-[8px] px-4 py-2 text-sm',
      active
        ? 'bg-[rgba(253,1,90,0.12)] text-white shadow-[0_0_20px_rgba(253,1,90,0.08)]'
        : 'bg-transparent text-text-secondary hover:text-white',
    ].join(' '),
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
