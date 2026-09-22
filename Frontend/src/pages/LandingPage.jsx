import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Zap, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();

  // Parallax effects
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);
  const yOrbs = useTransform(scrollY, [0, 1000], [0, 300]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary-500/30 selection:text-primary-100">
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          style={{ y: yOrbs }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary-500/10 blur-[150px] animate-float opacity-70"
        />
        <motion.div 
          style={{ y: yOrbs }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent-violet/10 blur-[150px] animate-float-delayed opacity-50"
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMC0zMFYwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjRoLTR6bS0yMCAwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjRoLTR6TTE2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00eiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 lg:px-12 backdrop-blur-md border-b border-white/[0.04] bg-background/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Smart Expense Tracker</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">Sign In</Button>
          <Button onClick={() => navigate('/register')} className="shadow-[0_0_20px_rgba(16,185,129,0.2)]">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pb-48 px-6 lg:px-8">
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-primary-400 bg-primary-500/10 border border-primary-500/20 mb-8 shadow-inner">
              <span className="flex w-2 h-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
              Automatic SMS Sync Now Available
            </span>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
              Your money,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-300 to-accent-cyan">finally understood.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-neutral-400 max-w-2xl mx-auto font-medium">
              A premium financial intelligence platform that automatically categorizes your bank SMS alerts, delivering beautiful insights without the manual data entry.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" onClick={() => navigate('/register')} className="group text-base shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                Start Tracking Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Dashboard Preview Mockup */}
        <motion.div
           initial={{ opacity: 0, y: 100 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
           className="mt-20 sm:mt-32 relative mx-auto max-w-6xl"
        >
           <div className="rounded-2xl border border-white/10 bg-surface-100/40 backdrop-blur-2xl p-2 sm:p-4 shadow-2xl">
              <div className="rounded-xl overflow-hidden bg-surface-50 border border-white/5 aspect-video flex items-center justify-center relative">
                 {/* Abstract representation of the dashboard */}
                 <div className="absolute inset-0 bg-gradient-to-br from-surface-100 to-surface-200" />
                 
                 <div className="absolute inset-0 p-8 flex flex-col gap-6">
                    <div className="flex gap-4 h-1/3">
                       <div className="w-1/3 rounded-xl bg-surface-300/20 border border-white/5 animate-pulse-slow" />
                       <div className="w-2/3 rounded-xl bg-surface-300/20 border border-white/5 animate-pulse-slow" style={{ animationDelay: '1s' }} />
                    </div>
                    <div className="flex gap-4 h-2/3">
                       <div className="w-2/3 rounded-xl bg-surface-300/20 border border-white/5 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
                       <div className="w-1/3 rounded-xl bg-surface-300/20 border border-white/5 flex flex-col items-center justify-center gap-4">
                          <div className="w-24 h-24 rounded-full border-[8px] border-primary-500/20 border-t-primary-500 animate-[spin_10s_linear_infinite]" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-32 mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Smartphone}
              title="Zero Data Entry"
              description="Our companion Android app reads your bank SMS alerts and seamlessly syncs transactions to your dashboard."
            />
            <FeatureCard 
              icon={Activity}
              title="Intelligent Insights"
              description="Discover your spending patterns with beautiful, interactive visualizations and a curated monthly story."
            />
            <FeatureCard 
              icon={Shield}
              title="Bank-Level Privacy"
              description="Your data never leaves our encrypted servers. We don't ask for your bank credentials, just your SMS."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-8 group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="w-14 h-14 rounded-2xl bg-surface-200/50 border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:border-primary-500/30 transition-colors">
      <Icon className="w-7 h-7 text-primary-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-neutral-400 leading-relaxed">{description}</p>
  </motion.div>
);
