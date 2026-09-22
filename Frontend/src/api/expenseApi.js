import { apiClient } from './apiClient';

export const expenseApi = {
  getExpenses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/expenses?${query}` : '/expenses';
    return await apiClient(endpoint, { method: 'GET' });
  },

  getExpenseById: async (id) => {
    return await apiClient(`/expenses/${id}`, { method: 'GET' });
  },

  createExpense: async (expenseData) => {
    return await apiClient('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  updateExpense: async (id, expenseData) => {
    return await apiClient(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  deleteExpense: async (id) => {
    return await apiClient(`/expenses/${id}`, { method: 'DELETE' });
  },
};
