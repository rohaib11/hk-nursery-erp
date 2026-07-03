import { Factory, CreditCard } from 'lucide-react';

export default function SuppliersTable({ suppliers, isLoading, onSendPayment }) {
  return (
    <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
              <th className="p-4 font-semibold">Vendor Info</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold text-right">Payable Balance</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr><td colSpan="5" className="p-12 text-center text-slate-500">Loading records...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-500">
                  <Factory size={32} className="mx-auto mb-3 opacity-30 text-indigo-500" />
                  <p className="font-medium text-lg">No suppliers added yet.</p>
                </td>
              </tr>
            ) : (
              suppliers.map((s) => {
                const balance = parseFloat(s.payable_balance);
                const oweMoney = balance > 0;

                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-4">
                      <p className="text-white font-bold text-sm">{s.name}</p>
                      {s.company_name && <p className="text-xs text-indigo-400 mt-0.5">{s.company_name}</p>}
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{s.phone || '-'}</td>
                    <td className="p-4 text-slate-400 text-sm truncate max-w-[200px]">{s.address || '-'}</td>
                    <td className="p-4 text-right">
                      <span className={`font-bold px-3 py-1.5 rounded-lg border ${
                        oweMoney 
                          ? 'bg-rose-950/30 text-rose-400 border-rose-900/50' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        Rs {balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {oweMoney ? (
                        <button 
                          onClick={() => onSendPayment(s)}
                          className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-end gap-1.5 ml-auto"
                        >
                          <CreditCard size={14} /> Send Payment
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Cleared</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}