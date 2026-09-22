import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { GlobalBootLoader } from '../ui/PremiumLoaders';

export const PageLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const location = useLocation();

  // Scroll reactivity
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { damping: 20, stiffness: 100 });
  
  // Parallax subtle shifts for orbs
  const yOrb1 = useTransform(smoothScrollY, [0, 1000], [0, 200]);
  const yOrb2 = useTransform(smoothScrollY, [0, 1000], [0, -150]);

  useEffect(() => {
    // Simulate a brief premium boot sequence on initial load
    const timer = setTimeout(() => setIsBooting(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Route-reactive colors/positions
  const getOrbConfigs = () => {
    const path = location.pathname;
    if (path.includes('analytics')) {
      return { 
        orb1: { bg: 'bg-accent-cyan/15', scale: 1.1 },
        orb2: { bg: 'bg-accent-violet/15', scale: 1.2 }
      };
    }
    if (path.includes('history')) {
      return { 
        orb1: { bg: 'bg-primary-500/10', scale: 1 },
        orb2: { bg: 'bg-blue-500/10', scale: 1.1 }
      };
    }
    if (path.includes('profile')) {
      return { 
        orb1: { bg: 'bg-emerald-500/10', scale: 1.2 },
        orb2: { bg: 'bg-primary-500/10', scale: 0.9 }
      };
    }
    // Default / Dashboard
    return { 
      orb1: { bg: 'bg-primary-500/10', scale: 1 },
      orb2: { bg: 'bg-accent-violet/10', scale: 1 }
    };
  };

  const orbs = getOrbConfigs();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      {/* Global Ambient Background System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Primary Orb */}
        <motion.div 
          style={{ y: yOrb1 }}
          animate={{ 
            x: [0, 50, -50, 0],
            scale: [orbs.orb1.scale, orbs.orb1.scale * 1.1, orbs.orb1.scale * 0.9, orbs.orb1.scale]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[120px] transition-colors duration-1000 ${orbs.orb1.bg}`} 
        />
        
        {/* Secondary Orb */}
        <motion.div 
          style={{ y: yOrb2 }}
          animate={{ 
            x: [0, -60, 40, 0],
            scale: [orbs.orb2.scale, orbs.orb2.scale * 1.05, orbs.orb2.scale * 0.95, orbs.orb2.scale]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className={`absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full blur-[150px] transition-colors duration-1000 ${orbs.orb2.bg}`} 
        />
      </div>

      <AnimatePresence>
        {isBooting && <GlobalBootLoader key="boot-loader" />}
      </AnimatePresence>

      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-72 relative z-10">
        <TopNav setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full p-4 sm:p-6 lg:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
