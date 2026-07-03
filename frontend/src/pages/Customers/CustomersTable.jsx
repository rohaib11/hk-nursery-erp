import { Users, CreditCard } from 'lucide-react';

export default function CustomersTable({ customers, isLoading, onReceivePayment }) {
  return (
    <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
              <th className="p-4 font-semibold">Client Name</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Address</th>
              <th className="p-4 font-semibold text-right">Outstanding Udhaar</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr><td colSpan="5" className="p-12 text-center text-slate-500">Loading records...</td></tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-500">
                  <Users size={32} className="mx-auto mb-3 opacity-30 text-blue-500" />
                  <p className="font-medium text-lg">No customers registered yet.</p>
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const balance = parseFloat(c.outstanding_balance);
                const hasUdhaar = balance > 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-4">
                      <p className="text-white font-bold text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Joined: {new Date(c.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{c.phone || '-'}</td>
                    <td className="p-4 text-slate-400 text-sm truncate max-w-[200px]">{c.address || '-'}</td>
                    <td className="p-4 text-right">
                      <span className={`font-bold px-3 py-1.5 rounded-lg border ${
                        hasUdhaar 
                          ? 'bg-amber-950/30 text-amber-400 border-amber-900/50' 
                          : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                      }`}>
                        Rs {balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {hasUdhaar ? (
                        <button 
                          onClick={() => onReceivePayment(c)}
                          className="bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/50 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-end gap-1.5 ml-auto"
                        >
                          <CreditCard size={14} /> Receive Payment
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Clear</span>
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