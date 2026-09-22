import React, { useState, useEffect, useMemo } from 'react';
import { expenseApi } from '../api/expenseApi';
import { Card } from '../components/ui/Card';
import { ChartSkeleton, ShimmerSkeleton } from '../components/ui/PremiumLoaders';
import { EmptyState } from '../components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format, parseISO, subDays, isThisMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, CalendarDays, Wallet, Sparkles } from 'lucide-react';

export const AnalyticsPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await expenseApi.getExpenses();
        setExpenses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare "Your Monthly Story" Data
  const storyData = useMemo(() => {
    const thisMonthExpenses = expenses.filter(e => isThisMonth(parseISO(e.date)));
    const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const txCount = thisMonthExpenses.length;
    
    // Top Category
    const catTotals = {};
    thisMonthExpenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    const topCategory = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a])[0] || 'N/A';
    
    // Largest Transaction
    const largestTx = [...thisMonthExpenses].sort((a, b) => b.amount - a.amount)[0];

    // Average per day
    const avgPerDay = totalSpent / (new Date().getDate() || 1);

    return { totalSpent, txCount, topCategory, largestTx, avgPerDay, catTotals };
  }, [expenses]);

  // Prepare Daily Spending Data (Last 14 Days)
  const dailyData = useMemo(() => {
    return [...Array(14)].map((_, i) => {
      const d = subDays(new Date(), 13 - i);
      const dateStr = format(d, 'MMM dd');
      const total = expenses
        .filter(exp => format(parseISO(exp.date), 'MMM dd') === dateStr)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return { date: dateStr, amount: total, isToday: i === 13 };
    });
  }, [expenses]);

  const pieData = useMemo(() => {
    return Object.keys(storyData.catTotals).map(key => ({
      name: key,
      value: storyData.catTotals[key]
    })).sort((a,b) => b.value - a.value);
  }, [storyData]);

  const COLORS = ['#10b981', '#34d399', '#059669', '#8b5cf6', '#06b6d4', '#f59e0b', '#f43f5e'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      <div className="flex flex-col mb-2">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-extrabold tracking-tight text-white leading-tight"
        >
          Intelligence
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-neutral-400 mt-2 font-medium"
        >
          Uncover the stories behind your spending.
        </motion.p>
      </div>

      {/* The Monthly Story Centerpiece */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="relative overflow-hidden group border-0 shadow-2xl">
          {/* Cinematic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-surface-100 to-accent-violet/10 opacity-80" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay" />
          
          <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-widest shadow-inner">
                <Sparkles className="w-3.5 h-3.5" /> Intelligence Report
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-200">{format(new Date(), 'MMMM')}</span> Story
              </h2>
              {isLoading ? (
                <div className="space-y-4">
                  <ShimmerSkeleton className="h-12 w-3/4" />
                  <ShimmerSkeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-3xl sm:text-4xl font-semibold text-white leading-snug">
                    You've spent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-200 font-bold">₹{storyData.totalSpent.toLocaleString()}</span> across {storyData.txCount} transactions this month.
                  </p>
                  <p className="text-lg text-neutral-300 leading-relaxed">
                    A significant portion went towards <span className="text-white font-bold">{storyData.topCategory}</span>, averaging <span className="text-white font-bold">₹{storyData.avgPerDay.toLocaleString(undefined, {maximumFractionDigits: 0})}</span> per day.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <StoryMetricCard icon={Award} label="Top Category" value={storyData.topCategory} isLoading={isLoading} />
               <StoryMetricCard 
                 icon={Wallet} 
                 label="Largest Transaction" 
                 value={storyData.largestTx ? `₹${storyData.largestTx.amount.toLocaleString()}` : 'N/A'} 
                 subtext={storyData.largestTx?.merchant || storyData.largestTx?.note}
                 isLoading={isLoading} 
               />
               <StoryMetricCard icon={TrendingUp} label="Daily Average" value={`₹${storyData.avgPerDay.toLocaleString(undefined, {maximumFractionDigits: 0})}`} isLoading={isLoading} />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap/Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="h-[450px] flex flex-col p-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6">14-Day Spending Heatmap</h3>
            <div className="flex-1 min-h-0">
              {isLoading ? (
                <ChartSkeleton />
              ) : dailyData.every(d => d.amount === 0) ? (
                <EmptyState icon={BarChart3} title="No data" description="Add expenses to see your daily chart." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#ffffff40" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                    <RechartsTooltip 
                      cursor={{ fill: '#ffffff05' }}
                      contentStyle={{ backgroundColor: '#171717', borderColor: '#ffffff10', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#10b981', fontWeight: 600 }}
                      formatter={(value) => [`₹${value}`, 'Spent']}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {dailyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isToday ? '#10b981' : '#047857'} fillOpacity={entry.isToday ? 1 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <Card className="h-[450px] flex flex-col p-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-6">Distribution</h3>
            <div className="flex-1 min-h-0 relative">
               {isLoading ? (
                <ShimmerSkeleton className="w-48 h-48 rounded-full mx-auto" />
               ) : pieData.length === 0 ? (
                 <EmptyState icon={BarChart3} title="No data" description="Insufficient data for breakdown." />
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={pieData}
                       cx="50%"
                       cy="45%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#171717', borderColor: '#ffffff10', borderRadius: '12px' }}
                        itemStyle={{ fontWeight: 600, color: '#fff' }}
                        formatter={(value) => [`₹${value}`]}
                      />
                   </PieChart>
                 </ResponsiveContainer>
               )}
               {/* Custom Legend */}
               {!isLoading && pieData.length > 0 && (
                 <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-x-4 gap-y-2 pb-2">
                   {pieData.slice(0,4).map((entry, index) => (
                     <div key={entry.name} className="flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                       <span className="text-xs text-neutral-400">{entry.name}</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const StoryMetricCard = ({ icon: Icon, label, value, subtext, isLoading }) => (
  <div className="bg-surface-200/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex flex-col items-start gap-2 shadow-inner">
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-surface-300/50">
        <Icon className="w-4 h-4 text-primary-400" />
      </div>
      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
    </div>
    {isLoading ? (
      <ShimmerSkeleton className="h-8 w-24" />
    ) : (
      <div>
         <span className="text-xl font-bold text-white">{value}</span>
         {subtext && <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{subtext}</p>}
      </div>
    )}
  </div>
);
