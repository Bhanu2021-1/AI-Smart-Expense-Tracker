import React, { useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

export const SpendingPulse = ({ totalAmount = 0, isPositive = true }) => {
  // Spring logic for smooth counting
  const count = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: 2000
  });

  // Whenever totalAmount changes, animate the spring to the new value
  useEffect(() => {
    count.set(totalAmount);
  }, [totalAmount, count]);

  // Format the spring value to a currency string dynamically
  const displayAmount = useTransform(count, (latest) => {
    return `₹${Math.round(latest).toLocaleString()}`;
  });

  // Calculate pulse speed based on spending intensity
  // Baseline is e.g. 50k, pulse faster if closer to it
  const pulseDuration = Math.max(1, 4 - (totalAmount / 50000) * 2);

  return (
    <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center group">
      {/* Outer ambient glow */}
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: pulseDuration * 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-primary-500/20 blur-[35px]"
      />
      
      {/* Concentric rings */}
      <div className="absolute inset-2 rounded-full border border-primary-500/10" />
      <div className="absolute inset-6 rounded-full border border-primary-500/20" />
      <div className="absolute inset-10 rounded-full border border-primary-500/30 border-dashed animate-[spin_15s_linear_infinite]" />
      
      {/* Inner glowing core */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 w-36 h-36 rounded-full bg-surface-100 border border-primary-500/40 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center overflow-hidden cursor-default"
      >
        {/* Core background pulse */}
        <motion.div 
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-t from-primary-500/40 to-transparent"
        />
        
        <span className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-1 relative z-10">
          This Month
        </span>
        <motion.span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white relative z-10 drop-shadow-md">
          {displayAmount}
        </motion.span>
      </motion.div>
      
      {/* Dynamic waveform-like dots rotating around */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,1)]" />
        <div className="absolute bottom-6 left-1/4 w-1.5 h-1.5 bg-accent-violet rounded-full shadow-[0_0_10px_rgba(139,92,246,1)] opacity-80" />
        <div className="absolute top-1/2 right-2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)] opacity-60" />
      </motion.div>
    </div>
  );
};
