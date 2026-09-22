import React from 'react';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({ icon: Icon = FileQuestion, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center relative group">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative w-20 h-20 rounded-2xl bg-surface-200/50 border border-white/5 flex items-center justify-center mb-8 shadow-inner shadow-black/20 group-hover:bg-surface-300/50 transition-colors duration-500">
        <Icon className="w-10 h-10 text-neutral-500 group-hover:text-primary-400/80 transition-colors duration-500" />
      </div>
      
      <h3 className="text-2xl font-bold text-white tracking-tight mb-3 relative z-10">{title}</h3>
      <p className="text-neutral-400 text-sm sm:text-base max-w-sm mb-8 leading-relaxed relative z-10">{description}</p>
      
      <div className="relative z-10">
        {action}
      </div>
    </div>
  );
};
