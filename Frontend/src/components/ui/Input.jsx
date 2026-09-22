import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Input = React.forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
            <Icon className={cn("h-5 w-5", isFocused ? "text-primary-400" : "text-neutral-500")} />
          </div>
        )}
        <input
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus && props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur && props.onBlur(e);
          }}
          className={cn(
            'glass-input w-full transition-all duration-300 py-3',
            Icon ? 'pl-11 pr-4' : 'px-4',
            error && 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500 text-rose-100',
            className
          )}
          {...props}
        />
        
        {/* Subtle focus glow behind input */}
        <AnimatePresence>
          {isFocused && !error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-0.5 bg-primary-500/20 rounded-xl blur-sm -z-10"
            />
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            className="text-xs font-medium text-rose-500 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
Input.displayName = 'Input';
