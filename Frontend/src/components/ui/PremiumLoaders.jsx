import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';

export const GlobalBootLoader = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] animate-pulse-slow pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-primary-500/30 border-t-primary-500 rounded-full"
          />
          <div className="w-16 h-16 rounded-2xl bg-surface-100/80 border border-white/10 flex items-center justify-center backdrop-blur-md">
            <Wallet className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">Smart Expense Tracker</h2>
          <div className="h-1 w-24 bg-surface-200 rounded-full overflow-hidden mx-auto">
            <motion.div 
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const ShimmerSkeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-100/50 rounded-xl border border-white/5",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 shimmer-bg" />
    </div>
  );
};

export const ChartSkeleton = () => (
  <div className="w-full h-full flex flex-col gap-4">
    <div className="flex justify-between items-end h-full px-2 gap-2 pb-4 border-b border-white/5">
      {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
        <ShimmerSkeleton key={i} className="w-full rounded-t-sm rounded-b-none" style={{ height: `${h}%` }} />
      ))}
    </div>
    <div className="flex justify-between px-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ShimmerSkeleton key={i} className="w-6 h-3 rounded-md" />
      ))}
    </div>
  </div>
);

export const TransactionRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-100/30 border border-white/5">
    <div className="flex items-center gap-4 w-1/2">
      <ShimmerSkeleton className="w-12 h-12 rounded-xl shrink-0" />
      <div className="space-y-2 w-full">
        <ShimmerSkeleton className="h-4 w-3/4" />
        <ShimmerSkeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="flex flex-col items-end gap-2 w-1/4">
      <ShimmerSkeleton className="h-5 w-20" />
      <ShimmerSkeleton className="h-4 w-16 rounded-full" />
    </div>
  </div>
);
