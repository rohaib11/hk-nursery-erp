import { ReceiptText, Trash2, Edit, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function ExpensesTable({ expenses, isLoading, onEdit, onDelete }) {
  
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Fertilizer': return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50';
      case 'Pots': return 'text-amber-400 bg-amber-950/30 border-amber-900/50';
      case 'Labor': return 'text-orange-400 bg-orange-950/30 border-orange-900/50';
      case 'Utility': return 'text-blue-400 bg-blue-950/30 border-blue-900/50';
      default: return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Expense Title</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Batch Link</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr><td colSpan="6" className="p-12 text-center text-slate-500">Loading records...</td></tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-slate-500">
                  <ReceiptText size={32} className="mx-auto mb-3 opacity-30 text-rose-500" />
                  <p className="font-medium text-lg">No expenses logged yet.</p>
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                    {new Date(exp.expense_date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4">
                    <p className="text-white font-bold text-sm">{exp.title}</p>
                    {exp.notes && <p className="text-xs text-slate-500 truncate max-w-xs">{exp.notes}</p>}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${getCategoryColor(exp.category)}`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4">
                    {exp.is_batch_expense && exp.plant_name ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded-md border border-emerald-900/30 w-max">
                        <CheckCircle size={12} /> {exp.plant_name}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">- General -</span>
                    )}
                  </td>
                  <td className="p-4 text-rose-400 font-bold whitespace-nowrap">
                    Rs {parseFloat(exp.amount).toLocaleString()}
                    {exp.is_batch_expense && exp.unit_cost_added > 0 && (
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5">
                        (+Rs {parseFloat(exp.unit_cost_added).toFixed(2)}/plant)
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {exp.receipt_image && (
                        <a href={`http://localhost:5000/${exp.receipt_image}`} target="_blank" rel="noreferrer"
                           className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-sm">
                          <ImageIcon size={16} />
                        </a>
                      )}
                      <button onClick={() => onEdit(exp)}
                        className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-sm">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => onDelete(exp.id)}
                        className="p-2 rounded-xl bg-slate-800/50 hover:bg-red-950/80 border border-slate-700/80 hover:border-red-900/80 text-slate-500 hover:text-red-400 transition-all shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}