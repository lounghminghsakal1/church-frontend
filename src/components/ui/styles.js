// Complete utility strings keep state styles visible to Tailwind's source scanner.
export const statusClasses = {
  pending: 'border-dashed border-ink/40 bg-white text-ink',
  approved: 'border-accent bg-soft text-ink',
  visible: 'border-accent bg-soft text-ink',
  rejected: 'border-double border-ink bg-white text-ink',
  urgent: 'border-ink bg-ink text-white',
  scheduled: 'border-accent bg-soft text-ink',
  expired: 'border-line bg-soft text-muted',
  inactive: 'border-line bg-soft text-muted',
};

const buttonBase = 'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
const buttonVariants = {
  primary: 'border-ink bg-ink text-white hover:border-ink/90 hover:bg-ink/90',
  secondary: 'border-ink/15 bg-white text-ink hover:border-ink/25 hover:bg-soft',
  accent: 'border-accent bg-accent text-ink hover:bg-accent/85',
  reject: 'border-line bg-white text-ink hover:bg-soft',
  danger: 'border-ink bg-ink text-white hover:border-ink hover:bg-ink',
};
const buttonSizes = {
  md: 'min-h-12 px-4 py-3 text-sm',
  sm: 'min-h-11 px-4 py-2.5 text-xs',
};

export function buttonClassName(variant = 'primary', className = '', size = 'md') {
  return `${buttonBase} ${buttonVariants[variant] || buttonVariants.primary} ${buttonSizes[size] || buttonSizes.md} ${className}`.trim();
}

export const inputClasses = 'w-full min-w-0 rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-ink/20 aria-invalid:border-ink aria-invalid:bg-soft disabled:opacity-50 sm:text-sm';
