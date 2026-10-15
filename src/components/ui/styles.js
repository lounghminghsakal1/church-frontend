// Complete utility strings keep state styles visible to Tailwind's source scanner.
export const statusClasses = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  visible: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  urgent: 'border-red-200 bg-red-50 text-red-700',
  scheduled: 'border-sky-200 bg-sky-50 text-sky-700',
  expired: 'border-slate-200 bg-slate-100 text-slate-600',
  inactive: 'border-slate-200 bg-slate-100 text-slate-600',
};

const buttonBase = 'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
const buttonVariants = {
  primary: 'border-navy bg-navy text-white hover:border-navy/90 hover:bg-navy/90',
  secondary: 'border-navy/15 bg-white text-navy hover:border-navy/25 hover:bg-slate-50',
  gold: 'border-gold bg-gold text-navy hover:bg-gold/85',
  reject: 'border-red-200 bg-white text-red-600 hover:bg-red-50',
  danger: 'border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700',
};
const buttonSizes = {
  md: 'min-h-12 px-4 py-3 text-sm',
  sm: 'min-h-11 px-4 py-2.5 text-xs',
};

export function buttonClassName(variant = 'primary', className = '', size = 'md') {
  return `${buttonBase} ${buttonVariants[variant] || buttonVariants.primary} ${buttonSizes[size] || buttonSizes.md} ${className}`.trim();
}

export const inputClasses = 'w-full min-w-0 rounded-xl border border-navy/15 bg-white px-3.5 py-3 text-base text-navy outline-none transition-colors placeholder:text-slate-400 focus:border-gold focus:ring-2 focus:ring-gold/20 aria-invalid:border-red-400 aria-invalid:bg-red-50 disabled:opacity-50 sm:text-sm';
