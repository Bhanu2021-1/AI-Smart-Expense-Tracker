import React from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Smartphone, Tag, ArrowRight } from 'lucide-react';
import { Badge } from './Badge';

export const FinancialTimeline = ({ expenses, onTransactionClick }) => {
  if (!expenses || expenses.length === 0) return null;

  return (
    <div className="relative pl-6 sm:pl-8 py-4">
      {/* Timeline vertical line */}
      <div className="absolute top-0 bottom-0 left-[15px] sm:left-[23px] w-px bg-gradient-to-b from-primary-500/50 via-white/10 to-transparent" />

      <div className="space-y-8 relative z-10">
        {expenses.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            whileHover={{ x: 4 }}
            className="relative group cursor-pointer"
            onClick={() => onTransactionClick && onTransactionClick(exp)}
          >
            {/* Timeline node */}
            <div className="absolute -left-[30px] sm:-left-[38px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-surface-100 border-2 border-primary-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:bg-primary-500 transition-colors duration-300" />
            
            <div className="glass-card bg-surface-100/60 p-4 sm:p-5 flex items-center justify-between border border-white/[0.04] group-hover:border-primary-500/30 group-hover:bg-surface-200/50 transition-all duration-300">
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-200/80 border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {exp.source === 'SMS' ? (
                    <Smartphone className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Tag className="w-5 h-5 text-primary-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-base tracking-wide flex items-center gap-2">
                    {exp.note || exp.category}
                    {exp.source === 'SMS' && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-blue-500/30 text-blue-400">
                        Auto SMS
                      </Badge>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-neutral-400 font-medium">
                      {format(parseISO(exp.date), 'MMM dd, h:mm a')}
                    </p>
                    {exp.merchant && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <p className="text-xs text-neutral-400">{exp.merchant}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-white text-lg tracking-tight">
                    ₹{exp.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-primary-400 mt-0.5 font-semibold">
                    {exp.category}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-2 hidden sm:block">
                  <ArrowRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>

            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
