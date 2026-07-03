import { Calculator, CheckCircle, Truck } from 'lucide-react';

export default function CheckoutSidebar({ 
  cart, customers, selectedCustomer, onCustomerChange, 
  discount, setDiscount, extraCharges, setExtraCharges, 
  amountPaid, setAmountPaid, notes, setNotes, onCheckout 
}) {
  
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const total = (subtotal + parseFloat(extraCharges || 0)) - parseFloat(discount || 0);
  const udhaar = Math.max(total - parseFloat(amountPaid || 0), 0);

  const isWalkIn = selectedCustomer === '';

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2">
        <Calculator size={16} className="text-emerald-400" /> Checkout Details
      </h3>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Customer (Khata)</label>
          <select 
            value={selectedCustomer} 
            onChange={(e) => onCustomerChange(e.target.value)} // 🪄 Triggers Wholesale Switch
            className="w-full bg-[#0b0f15]/80 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 appearance-none"
          >
            <option value="">🛒 Walk-in Gahak (Retail Price / Cash Only)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.outstanding_balance > 0 ? `(Old Udhaar: Rs ${c.outstanding_balance})` : '(Wholesale Rate)'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discount (Rs)</label>
            <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)}
              className="w-full bg-[#0b0f15]/80 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-rose-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Truck size={12}/> Loading/Palledari
            </label>
            <input type="number" min="0" value={extraCharges} onChange={(e) => setExtraCharges(e.target.value)}
              className="w-full bg-[#0b0f15]/80 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500" />
          </div>
        </div>

        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-700/50">
            <span>Total Bill</span><span className="text-emerald-400">Rs {total.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Amount Paid Now (Rs)</label>
          <input type="number" min="0" max={total} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 text-emerald-400 font-bold text-xl outline-none focus:border-emerald-500 shadow-inner" />
          
          {isWalkIn && parseFloat(amountPaid || 0) < total && (
            <p className="text-rose-400 text-xs mt-2 font-medium">Walk-in customers cannot have Udhaar. Must pay full Rs {total}.</p>
          )}
        </div>

        {!isWalkIn && udhaar > 0 && (
          <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-900/50">
            <p className="text-xs text-amber-200 uppercase font-bold">New Udhaar Generated</p>
            <p className="text-lg font-bold text-amber-400">Rs {udhaar.toLocaleString()}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Notes (e.g. Driver Name)</label>
          <input type="text" placeholder="Driver: Asif, Mazda Truck" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#0b0f15]/80 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm" />
        </div>
      </div>

      <button 
        onClick={onCheckout}
        disabled={cart.length === 0}
        className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 text-lg"
      >
        <CheckCircle size={22} /> Complete Checkout
      </button>
    </div>
  );
}