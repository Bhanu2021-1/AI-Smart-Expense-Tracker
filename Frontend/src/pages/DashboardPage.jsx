import React, { useState, useEffect, useMemo } from 'react';
import { expenseApi } from '../api/expenseApi';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { EmptyState } from '../components/ui/EmptyState';
import { SpendingPulse } from '../components/ui/SpendingPulse';
import { FinancialTimeline } from '../components/ui/FinancialTimeline';
import { ChartSkeleton, ShimmerSkeleton } from '../components/ui/PremiumLoaders';
import { Plus, Target, ArrowUpRight, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isThisMonth, isThisWeek, isToday, parseISO, subMonths } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseApi.getExpenses();
      // Sort by date descending
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const debitExpenses = expenses.filter(e => e.transactionType !== 'CREDIT');
    const creditExpenses = expenses.filter(e => e.transactionType === 'CREDIT');

    const today = debitExpenses.filter(e => isToday(parseISO(e.date))).reduce((sum, e) => sum + e.amount, 0);
    const thisWeek = debitExpenses.filter(e => isThisWeek(parseISO(e.date))).reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = debitExpenses.filter(e => isThisMonth(parseISO(e.date))).reduce((sum, e) => sum + e.amount, 0);
    
    const incomeThisMonth = creditExpenses.filter(e => isThisMonth(parseISO(e.date))).reduce((sum, e) => sum + e.amount, 0);

    const prevMonth = debitExpenses.filter(e => {
       const date = parseISO(e.date);
       const lastMonth = subMonths(new Date(), 1);
       return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);

    const trend = prevMonth === 0 ? 0 : ((thisMonth - prevMonth) / prevMonth) * 100;
    
    return { today, thisWeek, thisMonth, prevMonth, trend, incomeThisMonth, totalCount: expenses.length };
  }, [expenses]);

  // Chart data
  const chartData = useMemo(() => {
    // Last 7 days trend
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = format(d, 'MMM dd');
      const amount = expenses
        .filter(e => e.transactionType !== 'CREDIT' && format(parseISO(e.date), 'MMM dd') === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      data.push({ date: dateStr, amount });
    }
    return data;
  }, [expenses]);

  const recentTransactions = expenses.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Header Action */}
      <div className="flex justify-between items-end">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight"
          >
            Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 mt-2 font-medium"
          >
            Your financial intelligence at a glance.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Button onClick={() => setIsAddModalOpen(true)} className="shadow-[0_0_20px_rgba(16,185,129,0.3)] gap-2">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Expense</span>
          </Button>
        </motion.div>
      </div>

      {/* Hero Overview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Pulse Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 xl:col-span-4 h-full"
        >
          <Card className="h-full bg-gradient-to-br from-surface-100/80 to-surface-200/50 flex flex-col justify-center items-center py-12 relative overflow-hidden group">
            {/* Ambient card background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMC0zMFYwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjRoLTR6bS0yMCAwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjRoLTR6TTE2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00eiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
            
            {isLoading ? (
              <ShimmerSkeleton className="w-48 h-48 rounded-full" />
            ) : (
              <SpendingPulse totalAmount={stats.thisMonth} />
            )}

            {!isLoading && (
               <div className="mt-8 text-center relative z-10 flex flex-col items-center">
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-300/30 border border-white/5 mb-2">
                   {stats.trend > 0 ? (
                     <><ArrowUpRight className="w-3.5 h-3.5 text-rose-400" /><span className="text-xs font-semibold text-rose-400">+{stats.trend.toFixed(1)}%</span></>
                   ) : (
                     <><TrendingDown className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400">{stats.trend.toFixed(1)}%</span></>
                   )}
                   <span className="text-xs text-neutral-400 ml-1">vs last month</span>
                 </div>
               </div>
            )}
          </Card>
        </motion.div>

        {/* Supporting Metrics & Chart */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Today', value: stats.today },
              { label: 'This Week', value: stats.thisWeek },
              { label: 'Income (Mo)', value: stats.incomeThisMonth },
              { label: 'Total Txs', value: stats.totalCount }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
              >
                <Card className="p-4 sm:p-5 flex flex-col justify-center h-full hoverEffect">
                  <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1">{stat.label}</span>
                  {isLoading ? (
                    <ShimmerSkeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {stat.label === 'Total Txs' ? stat.value : `₹${stat.value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                    </span>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1 min-h-[250px]"
          >
            <Card className="h-full p-4 sm:p-6 flex flex-col relative overflow-hidden">
              <h3 className="text-sm font-semibold text-neutral-400 mb-6 uppercase tracking-wider relative z-10">7-Day Trailing Trend</h3>
              <div className="flex-1 min-h-0 relative z-10">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', borderColor: '#ffffff10', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#10b981', fontWeight: 600 }}
                        formatter={(value) => [`₹${value}`, 'Spent']}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Financial Timeline Area */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">Recent Activity</h2>
          <Button variant="ghost" className="text-primary-400 hover:text-primary-300" onClick={() => window.location.href = '/history'}>
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <ShimmerSkeleton className="h-20 w-full" />
            <ShimmerSkeleton className="h-20 w-full" />
            <ShimmerSkeleton className="h-20 w-full" />
          </div>
        ) : recentTransactions.length === 0 ? (
          <Card className="border-dashed border-white/10 bg-transparent">
             <CardContent className="py-12">
               <EmptyState 
                 icon={Target}
                 title="No activity yet" 
                 description="Add your first expense or sync from Android."
                 action={<Button onClick={() => setIsAddModalOpen(true)}>Add Expense</Button>}
               />
             </CardContent>
          </Card>
        ) : (
          <FinancialTimeline 
            expenses={recentTransactions} 
            onTransactionClick={(exp) => setSelectedExpense(exp)} 
          />
        )}
      </motion.div>

      {/* Modals */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm 
          onCancel={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchExpenses();
          }}
        />
      </Modal>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        title="Transaction Details"
      >
        {selectedExpense && (
          <div className="space-y-6 p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 w-full">
             <div className="flex flex-col items-center justify-center py-6 bg-surface-200/30 rounded-2xl border border-white/5">
                <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-2">Amount</p>
                <p className={`text-4xl font-bold ${selectedExpense.transactionType === 'CREDIT' ? 'text-emerald-400' : 'text-white'}`}>
                  {selectedExpense.transactionType === 'CREDIT' ? '+' : ''}₹{selectedExpense.amount.toLocaleString()}
                </p>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-white/5">
                   <span className="text-neutral-400">Date</span>
                   <span className="text-white font-medium">{format(parseISO(selectedExpense.date), 'MMMM dd, yyyy • h:mm a')}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                   <span className="text-neutral-400">Category</span>
                   <span className="text-white font-medium">{selectedExpense.category}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                   <span className="text-neutral-400">Note</span>
                   <span className="text-white font-medium">{selectedExpense.note || '-'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                   <span className="text-neutral-400">Merchant</span>
                   <span className="text-white font-medium">{selectedExpense.merchant || '-'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                   <span className="text-neutral-400">Type</span>
                   <span className={`font-medium ${selectedExpense.transactionType === 'CREDIT' ? 'text-emerald-400' : 'text-white'}`}>
                     {selectedExpense.transactionType === 'CREDIT' ? 'Credit / Income' : 'Debit / Expense'}
                   </span>
                </div>
                <div className="flex justify-between py-3">
                   <span className="text-neutral-400">Source</span>
                   <span className="text-white font-medium flex items-center gap-2">
                     {selectedExpense.source}
                     {selectedExpense.source === 'SMS' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                   </span>
                </div>
             </div>
             <div className="pt-4">
                <Button className="w-full" variant="secondary" onClick={() => setSelectedExpense(null)}>Close</Button>
             </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
