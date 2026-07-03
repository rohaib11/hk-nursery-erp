import { Truck, Factory, RefreshCw, TrendingDown } from 'lucide-react';

export default function SuppliersHeader({ suppliers, onAdd, onRefresh, isLoading }) {
  
  // Calculate total money YOU owe to vendors
  const totalPayable = suppliers.reduce((sum, s) => sum + parseFloat(s.payable_balance), 0);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Suppliers & Vendors</h2>
          <p className="text-slate-400 text-sm">Manage Bhal, Pot, and Seed vendors (Accounts Payable)</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onRefresh} className="bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors" title="Refresh">
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-indigo-400' : ''} />
          </button>
          <button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20">
            <Factory size={18} /> Add Vendor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-950/50 flex items-center justify-center border border-indigo-900/50">
            <Truck className="text-indigo-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Suppliers</p>
            <p className="text-2xl font-bold text-white">{suppliers.length}</p>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-rose-950/50 flex items-center justify-center border border-rose-900/50">
            <TrendingDown className="text-rose-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Payable (Udhaar)</p>
            <p className="text-2xl font-bold text-rose-400">Rs {totalPayable.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}