import { FileText } from 'lucide-react';

export default function InvoiceHistory({ history }) {
  const money = (n) => new Intl.NumberFormat("en-PK").format(Number(n) || 0);

  return (
    <div className="mt-6 bg-[#111827]/60 border border-slate-700/50 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FileText size={18} className="text-emerald-400" /> Recent Invoices Ledger
        </h3>
      </div>
      
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-[#0f172a] shadow-md z-10">
            <tr className="text-slate-400 uppercase tracking-wider text-xs">
              <th className="p-4 font-semibold border-b border-slate-800">Date</th>
              <th className="p-4 font-semibold border-b border-slate-800">Invoice #</th>
              <th className="p-4 font-semibold border-b border-slate-800">Customer / Account</th>
              <th className="p-4 font-semibold text-right border-b border-slate-800">Total Bill</th>
              <th className="p-4 font-semibold text-right border-b border-slate-800">Paid Now</th>
              <th className="p-4 font-semibold text-right border-b border-slate-800">New Udhaar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {history.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">No invoices generated yet.</td>
              </tr>
            ) : (
              history.map((inv) => {
                const total = parseFloat(inv.total_amount);
                const paid = parseFloat(inv.amount_paid);
                const udhaar = Math.max(total - paid, 0);

                return (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-400">
                      {new Date(inv.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 font-mono text-emerald-400">#{inv.id}</td>
                    <td className="p-4 text-white font-medium">
                      {inv.customer_name || 'Walk-in Customer'}
                    </td>
                    <td className="p-4 text-right font-bold text-white">Rs {money(total)}</td>
                    <td className="p-4 text-right text-emerald-400">Rs {money(paid)}</td>
                    <td className="p-4 text-right">
                      {udhaar > 0 ? (
                        <span className="bg-rose-950/40 text-rose-400 px-2.5 py-1 rounded-md text-xs font-bold border border-rose-900/50">
                          Rs {money(udhaar)}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs font-medium">Cleared</span>
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