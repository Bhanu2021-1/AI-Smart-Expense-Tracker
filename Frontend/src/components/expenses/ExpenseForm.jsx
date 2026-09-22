import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { IndianRupee, FileText, Tag, Calendar } from 'lucide-react';
import { expenseApi } from '../../api/expenseApi';
import { useToast } from '../../context/ToastContext';

export const ExpenseForm = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    note: '',
    category: 'Other',
    date: new Date().toISOString().slice(0, 16),
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount,
        note: initialData.note || '',
        category: initialData.category || 'Other',
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      });
    }
  }, [initialData]);

  const CATEGORIES = [
    { value: 'Food', label: 'Food & Dining' },
    { value: 'Transport', label: 'Transportation' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Bills', label: 'Bills & Utilities' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Groceries', label: 'Groceries' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Other', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        source: 'MANUAL',
      };

      if (initialData?.id) {
        await expenseApi.updateExpense(initialData.id, payload);
        addToast('Expense updated successfully', 'success');
      } else {
        await expenseApi.createExpense(payload);
        addToast('Expense added successfully', 'success');
      }
      onSuccess();
    } catch (error) {
      addToast(error.message || 'Failed to save expense', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 w-full flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          icon={IndianRupee}
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          disabled={isLoading}
          autoFocus
        />

        <Input
          label="Note (Optional)"
          type="text"
          placeholder="What was this for?"
          icon={FileText}
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Category"
            icon={Tag}
            options={CATEGORIES}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={isLoading}
          />
          
          <Input
            label="Date & Time"
            type="datetime-local"
            icon={Calendar}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 p-6 pt-4 border-t border-white/10 shrink-0 bg-surface-100/50">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};
