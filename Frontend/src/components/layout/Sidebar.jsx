import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, PieChart, User, Wallet, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, setOpen }) => {
  const { logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Budgets', path: '/budgets', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating Sidebar (Desktop) / Slide-out (Mobile) */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-72 p-4 transform transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full w-full glass-card border border-white/[0.08] flex flex-col shadow-2xl overflow-hidden bg-surface-100/60">
          
          {/* Logo Area */}
          <div className="flex h-20 items-center px-8 border-b border-white/[0.04]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] mr-3">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Tracker</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] bg-surface-200/50" 
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Background Glow */}
                      {isActive && (
                        <motion.div 
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent opacity-50 border-l-2 border-primary-500"
                        />
                      )}
                      
                      <Icon className={cn(
                        "w-5 h-5 relative z-10 transition-colors duration-300", 
                        isActive ? "text-primary-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "text-neutral-500 group-hover:text-neutral-300"
                      )} />
                      <span className="font-medium relative z-10 tracking-wide text-sm">{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Action Area */}
          <div className="p-4 border-t border-white/[0.04]">
             <button 
                onClick={logout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 group"
              >
                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium tracking-wide text-sm">Sign Out</span>
             </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
