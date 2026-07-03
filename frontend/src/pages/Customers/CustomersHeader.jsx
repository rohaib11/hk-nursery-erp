import { Users, UserPlus, RefreshCw, Wallet } from 'lucide-react';

export default function CustomersHeader({ customers, onAdd, onRefresh, isLoading }) {
  
  // Calculate total market Udhaar
  const totalUdhaar = customers.reduce((sum, c) => sum + parseFloat(c.outstanding_balance), 0);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Customers & Khata</h2>
          <p className="text-slate-400 text-sm">Manage wholesale buyers and track Udhaar</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onRefresh} className="bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors" title="Refresh">
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
          </button>
          <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
            <UserPlus size={18} /> Add Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-blue-950/50 flex items-center justify-center border border-blue-900/50">
            <Users className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Registered Clients</p>
            <p className="text-2xl font-bold text-white">{customers.length}</p>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-amber-950/50 flex items-center justify-center border border-amber-900/50">
            <Wallet className="text-amber-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Market Udhaar</p>
            <p className="text-2xl font-bold text-amber-400">Rs {totalUdhaar.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}