import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const TopNav = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('history')) return 'History';
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('budgets')) return 'Budgets';
    if (path.includes('profile')) return 'Profile';
    return '';
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 bg-background/50 backdrop-blur-xl border-b border-white/[0.04]">
      
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center -ml-2 text-neutral-400 hover:text-white lg:hidden transition-colors rounded-xl hover:bg-white/5"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-white tracking-tight hidden sm:block lg:hidden">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
        
        {/* Search Action (Placeholder for global search) */}
        <button type="button" className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 hidden sm:flex">
          <span className="sr-only">Search</span>
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button type="button" className="relative w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </button>

        <div className="hidden lg:block h-8 w-px bg-white/10" aria-hidden="true" />

        {/* Profile Block */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-x-3 cursor-pointer p-1.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
        >
          <div className="hidden sm:flex sm:flex-col sm:items-end px-2">
            <span className="text-sm font-semibold leading-none text-white tracking-wide">{user?.name}</span>
            <span className="text-[11px] leading-tight text-primary-400 mt-1 uppercase tracking-wider font-semibold shadow-sm">Premium Member</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-surface-200 to-surface-300 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden relative group">
             {/* Simulated user avatar text */}
             <span className="text-sm font-bold text-white z-10">{user?.name?.charAt(0)}</span>
             <div className="absolute inset-0 bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </motion.div>
      </div>
    </header>
  );
};
