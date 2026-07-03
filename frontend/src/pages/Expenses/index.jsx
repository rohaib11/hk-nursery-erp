import { useState, useEffect } from 'react';
import axios from 'axios';
import ExpensesHeader from './ExpensesHeader';
import ExpensesTable from './ExpensesTable';
import ExpenseModal from './ExpenseModal';
import { AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(getInitialState());

  function getInitialState() {
    return {
      title: '', category: 'Labor', amount: '', expense_date: new Date().toISOString().split('T')[0],
      is_batch_expense: false, plant_ids: [], split_method: 'proportional', notes: '', receipt: null
    };
  }

  const fetchData = async () => {
    setIsLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [expenseRes, plantRes] = await Promise.all([
        axios.get(`${API_BASE}/expenses`, config),
        axios.get(`${API_BASE}/plants`, config)
      ]);
      
      setExpenses(expenseRes.data);
      setPlants(plantRes.data.filter(p => p.quantity > 0 && p.health_status !== 'Dead'));
    } catch (err) {
      setError('Failed to load financial data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenAdd = () => {
    setCurrentExpense(getInitialState());
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (expense) => {
    setCurrentExpense({
      ...expense,
      expense_date: new Date(expense.expense_date).toISOString().split('T')[0],
      plant_ids: expense.plant_id ? [expense.plant_id] : [],
      receipt: null // Reset file input
    });
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this expense? This will reverse any plant cost calculations.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { alert('Failed to delete expense'); }
  };

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      
      if (editMode) {
        await axios.put(`${API_BASE}/expenses/${currentExpense.id}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/expenses`, formData, config);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save expense');
    }
  };

  return (
    <div className="animate-fade-in">
      <ExpensesHeader 
        expenses={expenses} 
        onAdd={handleOpenAdd} 
        onRefresh={fetchData} 
        isLoading={isLoading} 
      />

      {error && (
        <div className="bg-red-950/30 border border-red-800/50 text-red-300 p-4 rounded-xl mb-4 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <ExpensesTable 
        expenses={expenses} 
        isLoading={isLoading} 
        onEdit={handleEdit}
        onDelete={handleDelete} 
      />

      {isModalOpen && (
        <ExpenseModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          expense={currentExpense} 
          setExpense={setCurrentExpense} 
          plants={plants}
          onSubmit={handleSubmit} 
          editMode={editMode}
        />
      )}
    </div>
  );
}