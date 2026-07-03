import { Plus, RefreshCw, TrendingDown, Factory, Leaf } from 'lucide-react';

export default function ExpensesHeader({ expenses, onAdd, onRefresh, isLoading }) {
  
  // Financial Math
  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const plantInvestment = expenses.filter(e => e.is_batch_expense).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const overhead = totalSpent - plantInvestment;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Expenses & Ledger</h2>
          <p className="text-slate-400 text-sm">Track your Kharch and operational costs</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onRefresh} className="bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors" title="Refresh">
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
          </button>
          <button onClick={onAdd} className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-900/20">
            <Plus size={18} /> Log Expense
          </button>
        </div>
      </div>

      {/* Financial Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-rose-950/50 flex items-center justify-center border border-rose-900/50">
            <TrendingDown className="text-rose-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-white">Rs {totalSpent.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-950/50 flex items-center justify-center border border-emerald-900/50">
            <Leaf className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Plant Investments</p>
            <p className="text-2xl font-bold text-emerald-400">Rs {plantInvestment.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-blue-950/50 flex items-center justify-center border border-blue-900/50">
            <Factory className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">General Overhead</p>
            <p className="text-2xl font-bold text-blue-400">Rs {overhead.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}