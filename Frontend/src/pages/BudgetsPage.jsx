import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Target, Plus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const BudgetsPage = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 relative">
      
      {/* Immersive Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12 relative z-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold tracking-tight text-white leading-tight"
          >
            Budgets
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2 font-medium"
          >
            Control your financial velocity. Set limits and track progress.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Button className="shadow-[0_0_20px_rgba(16,185,129,0.3)] gap-2 h-12 px-6">
            <Plus className="w-5 h-5" />
            <span className="font-semibold tracking-wide">Create Budget</span>
          </Button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="relative z-10"
      >
        <Card className="overflow-hidden border border-white/[0.04]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-surface-100 to-accent-violet/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMC0zMFYwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjRoLTR6bS0yMCAwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjRoLTR6TTE2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00eiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
          
          <div className="relative py-24 px-6 flex flex-col items-center justify-center text-center">
            
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-[40px] animate-pulse-slow" />
               <div className="w-24 h-24 rounded-full bg-surface-200/80 border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                 <Target className="w-10 h-10 text-primary-400" />
               </div>
               {/* Orbital elements */}
               <div className="absolute -inset-8 border border-white/5 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none">
                 <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
               </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">No active budgets</h2>
            <p className="text-neutral-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
              Start directing your money purposefully. Define your monthly limits across different categories and monitor your velocity.
            </p>
            
            <Button size="lg" className="group shadow-[0_0_30px_rgba(16,185,129,0.2)]">
               <Zap className="w-5 h-5 mr-2 text-white group-hover:scale-110 transition-transform" />
               Set Your First Target
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
