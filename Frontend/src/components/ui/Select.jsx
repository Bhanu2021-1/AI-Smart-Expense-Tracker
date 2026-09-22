import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Select = React.forwardRef(({ className, label, error, icon: Icon, options, ...props }, ref) => {
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
        <select
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
            'glass-input w-full appearance-none transition-all duration-300',
            Icon && 'pl-11',
            error && 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500 text-rose-100',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-100 text-white p-2">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isFocused ? "text-primary-400 rotate-180" : "text-neutral-500")} />
        </div>

        {/* Subtle focus glow behind select */}
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
Select.displayName = 'Select';
