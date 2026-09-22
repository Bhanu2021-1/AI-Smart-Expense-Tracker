import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-primary-500/10 text-primary-400 border-primary-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]',
    destructive: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    outline: 'bg-transparent text-neutral-300 border-white/20',
    secondary: 'bg-surface-200/50 text-neutral-300 border-white/5 shadow-inner',
    violet: 'bg-accent-violet/10 text-purple-400 border-accent-violet/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]',
  };

  return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase transition-colors focus:outline-none",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </motion.span>
  );
};
