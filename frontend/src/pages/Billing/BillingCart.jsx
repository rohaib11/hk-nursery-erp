import { Trash2 } from 'lucide-react';

export default function BillingCart({ cart, onUpdate, onRemove }) {
  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
          <Trash2 className="opacity-20" size={32} />
        </div>
        <p className="text-lg font-medium text-slate-400">Cart is empty</p>
        <p className="text-sm">Search and select plants to start billing.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-900/80 sticky top-0 z-10 border-b border-slate-700/50">
          <tr className="text-slate-400 text-xs uppercase tracking-wider">
            <th className="p-4 font-semibold">Plant / Item</th>
            <th className="p-4 font-semibold w-24">Price (Rs)</th>
            <th className="p-4 font-semibold w-24">Qty</th>
            <th className="p-4 font-semibold text-right">Total</th>
            <th className="p-4 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {cart.map((item) => (
            <tr key={item.plant_id} className="hover:bg-slate-800/30">
              <td className="p-4">
                <p className="text-white font-bold text-sm">{item.name}</p>
                <p className="text-xs text-slate-500">{item.pot_size || 'Standard'}</p>
              </td>
              <td className="p-4">
                <input 
                  type="number" 
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => onUpdate(item.plant_id, 'unit_price', e.target.value)}
                  className="w-full bg-[#0b0f15]/80 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500 text-sm"
                />
              </td>
              <td className="p-4">
                <input 
                  type="number" 
                  min="1"
                  max={item.max_stock}
                  value={item.quantity}
                  onChange={(e) => onUpdate(item.plant_id, 'quantity', e.target.value)}
                  className="w-full bg-[#0b0f15]/80 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500 text-sm"
                />
              </td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                Rs {(item.unit_price * item.quantity).toLocaleString()}
              </td>
              <td className="p-4 text-right">
                <button onClick={() => onRemove(item.plant_id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}