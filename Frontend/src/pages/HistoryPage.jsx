import React, { useState, useEffect, useMemo } from 'react';
import { expenseApi } from '../api/expenseApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { TransactionRowSkeleton } from '../components/ui/PremiumLoaders';
import { Search, Filter, Trash2, Edit2, Smartphone, Tag, FileText, ChevronDown, Check } from 'lucide-react';
import { format, parseISO, isSameDay, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export const HistoryPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState('This Month');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [editingExpense, setEditingExpense] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  const { addToast } = useToast();

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseApi.getExpenses();
      setExpenses(data);
    } catch (error) {
      addToast('Failed to load history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (expense) => {
    try {
      await expenseApi.deleteExpense(expense.id);
      setExpenses(prev => prev.filter(e => e.id !== expense.id));
      addToast(`Deleted ₹${expense.amount.toLocaleString()}`, 'success');
    } catch (error) {
      addToast('Failed to delete', 'error');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingExpense(null);
    fetchExpenses();
  };

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    
    // Time Range Filter
    const now = new Date();
    result = result.filter(e => {
      const date = parseISO(e.date);
      switch(timeRange) {
        case 'Today': return isToday(date);
        case 'Yesterday': return isYesterday(date);
        case 'This Week': return isThisWeek(date);
        case 'This Month': return isThisMonth(date);
        case 'Previous Month': {
          const lastMonth = subMonths(now, 1);
          return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        }
        case 'This Year': return isThisYear(date);
        case 'All Time':
        default: return true;
      }
    });

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(e => 
        (e.note && e.note.toLowerCase().includes(lower)) ||
        (e.merchant && e.merchant.toLowerCase().includes(lower))
      );
    }

    if (categoryFilter !== 'All') {
      result = result.filter(e => e.category === categoryFilter);
    }

    // Always sort newest first
    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    return result;
  }, [expenses, search, categoryFilter, timeRange]);

  // Group by Date
  const groupedExpenses = useMemo(() => {
    const groups = {};
    filteredExpenses.forEach(exp => {
      const dateStr = format(parseISO(exp.date), 'yyyy-MM-dd');
      if (!groups[dateStr]) groups[dateStr] = { date: dateStr, totalDebit: 0, totalCredit: 0, items: [] };
      groups[dateStr].items.push(exp);
      if (exp.transactionType === 'CREDIT') {
        groups[dateStr].totalCredit += exp.amount;
      } else {
        groups[dateStr].totalDebit += exp.amount;
      }
    });
    return groups;
  }, [filteredExpenses]);

  const TIME_RANGES = ['Today', 'Yesterday', 'This Week', 'This Month', 'Previous Month', 'This Year', 'All Time'];
  const CATEGORY_OPTIONS = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <motion.h1 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-4xl font-extrabold tracking-tight text-white leading-tight"
           >
             History
           </motion.h1>
        </div>
        
        {/* Mobile Filter Toggle */}
        <Button 
          variant="secondary" 
          className="lg:hidden w-full sm:w-auto"
          onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar (Desktop) / Drawer (Mobile) */}
        <motion.div 
          className={`lg:col-span-1 ${isFilterDrawerOpen ? 'block' : 'hidden lg:block'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="sticky top-28 space-y-8 pb-10">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase ml-1">Search</h3>
              <Input
                placeholder="Search transactions..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Card className="p-2 glass border border-white/[0.04]">
              <div className="p-3 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Time Range</div>
              <div className="flex flex-col gap-1">
                {TIME_RANGES.map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${timeRange === range ? 'bg-primary-500/10 text-primary-400' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {range}
                    {timeRange === range && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-2 glass border border-white/[0.04]">
              <div className="p-3 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Category</div>
              <div className="flex flex-col gap-1">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${categoryFilter === cat ? 'bg-surface-300 text-white shadow-inner' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {cat}
                    {categoryFilter === cat && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Transaction Feed */}
        <div className="lg:col-span-3 space-y-10 relative">
          
          {isLoading ? (
            <div className="space-y-6">
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
              <TransactionRowSkeleton />
            </div>
          ) : Object.keys(groupedExpenses).length === 0 ? (
            <EmptyState 
              icon={FileText} 
              title="No transactions found" 
              description="Adjust your filters or add a new expense to see it here." 
            />
          ) : (
            Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a)).map(dateStr => {
              const group = groupedExpenses[dateStr];
              const dateObj = parseISO(dateStr);
              return (
                <div key={dateStr} className="relative">
                  {/* Elegant Calendar Spine Date Header */}
                  <div className="sticky top-20 z-20 flex items-center justify-between pb-3 mb-4 mt-6">
                    <div className="flex items-center gap-4">
                      {/* Calendar Icon Date Block */}
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-surface-200/80 border border-white/10 shadow-lg shrink-0 overflow-hidden">
                         <div className="w-full bg-primary-500/20 text-primary-400 text-[9px] font-bold uppercase tracking-widest text-center py-0.5">
                           {format(dateObj, 'MMM')}
                         </div>
                         <div className="text-lg font-bold text-white leading-none mt-1">
                           {format(dateObj, 'dd')}
                         </div>
                      </div>
                      
                      <div>
                        <p className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                          {format(dateObj, 'EEEE')}
                          {isSameDay(dateObj, new Date()) && <Badge variant="outline" className="ml-1 bg-primary-500/10 border-primary-500/30 text-primary-400 text-[10px]">Today</Badge>}
                          {isSameDay(dateObj, new Date(Date.now() - 86400000)) && <Badge variant="outline" className="ml-1 bg-white/5 text-[10px]">Yesterday</Badge>}
                        </p>
                        <p className="text-xs text-neutral-400 font-medium">{format(dateObj, 'MMMM yyyy')}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-base font-bold text-white">
                        {group.totalDebit > 0 ? `₹${group.totalDebit.toLocaleString()} spent` : ''}
                        {group.totalDebit > 0 && group.totalCredit > 0 ? ' • ' : ''}
                        {group.totalCredit > 0 ? <span className="text-emerald-400">+₹{group.totalCredit.toLocaleString()} income</span> : ''}
                        {group.totalDebit === 0 && group.totalCredit === 0 ? '₹0' : ''}
                      </p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">{group.items.length} transaction{group.items.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pl-4 sm:pl-6 border-l-2 border-white/[0.03] ml-6">
                    <AnimatePresence>
                      {group.items.map((exp, index) => (
                        <motion.div
                          key={exp.id}
                          layout
                          initial={{ opacity: 0, scale: 0.98, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 4 }}
                          className="group relative"
                        >
                          {/* Timeline node connection */}
                          <div className="absolute top-1/2 -left-[19px] sm:-left-[27px] w-4 h-px bg-white/[0.06] group-hover:bg-primary-500/50 transition-colors" />
                          <div className="absolute top-1/2 -left-[22px] sm:-left-[30px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary-500 transition-colors" />

                          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 blur-sm" />
                          <div className="relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface-100/60 border border-white/[0.04] group-hover:border-primary-500/20 group-hover:bg-surface-200/80 transition-all duration-300 shadow-sm hover:shadow-lg">
                            
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl bg-surface-300/40 border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}>
                                {exp.source === 'SMS' ? (
                                  <Smartphone className={`w-5 h-5 ${exp.transactionType === 'CREDIT' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]'}`} />
                                ) : (
                                  <Tag className={`w-5 h-5 ${exp.transactionType === 'CREDIT' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-primary-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-white text-base">
                                    {exp.note || exp.category}
                                  </p>
                                  {exp.source === 'SMS' && (
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-blue-500/30 text-blue-400 bg-blue-500/10">
                                      Auto SMS
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                                  <span>{format(parseISO(exp.date), 'h:mm a')}</span>
                                  {exp.merchant && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-white/20" />
                                      <span>{exp.merchant}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1 relative z-10">
                              <p className={`font-bold text-lg tracking-tight ${exp.transactionType === 'CREDIT' ? 'text-emerald-400' : 'text-white'}`}>
                                {exp.transactionType === 'CREDIT' ? '+' : ''}₹{exp.amount.toLocaleString()}
                              </p>
                              <div className="flex items-center justify-end gap-2 sm:gap-4 mt-1">
                                <Badge variant="secondary" className="hidden sm:inline-flex bg-transparent border-none p-0 text-[10px] text-neutral-500 hover:bg-transparent shadow-none">
                                  {exp.category}
                                </Badge>
                                
                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(exp)} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(exp)} className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditingExpense(null); }}
        title="Edit Expense"
      >
        <ExpenseForm 
          initialData={editingExpense}
          onCancel={() => { setIsEditModalOpen(false); setEditingExpense(null); }}
          onSuccess={handleEditSuccess}
        />
      </Modal>
    </div>
  );
};
