import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  
  const variants = {
    primary: 'bg-primary-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-primary-400/50 hover:bg-primary-400',
    secondary: 'bg-surface-200 text-white border border-white/10 hover:bg-surface-300 hover:border-white/20 shadow-lg',
    outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-white/30',
    ghost: 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/5',
    destructive: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-400',
  };

  const sizes = {
    sm: 'h-9 px-4 text-xs font-medium',
    md: 'h-11 px-6 text-sm font-medium',
    lg: 'h-14 px-8 text-base font-semibold',
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 disabled:opacity-50 disabled:pointer-events-none overflow-hidden',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Button Ambient Glow for primary variant */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50" />
      )}
      
      {isLoading ? (
        <div className="flex items-center gap-2">
          {/* Custom dot loader for premium feel */}
          <div className="flex space-x-1">
            <motion.div className="w-1.5 h-1.5 bg-current rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} />
            <motion.div className="w-1.5 h-1.5 bg-current rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }} />
            <motion.div className="w-1.5 h-1.5 bg-current rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }} />
          </div>
          <span className="opacity-0">{children}</span> {/* Keeps width consistent */}
          <span className="absolute inset-0 flex items-center justify-center text-sm">Processing...</span>
        </div>
      ) : (
        <span className="relative z-10 flex items-center">{children}</span>
      )}
    </motion.button>
  );
});
Button.displayName = 'Button';
