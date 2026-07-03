import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, supplier, onSubmit }) {
  const [formData, setFormData] = useState({ amount_paid: '', payment_method: 'Cash', notes: '' });

  if (!isOpen || !supplier) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(formData.amount_paid) > parseFloat(supplier.payable_balance)) {
      alert("Payment amount cannot exceed your total outstanding Udhaar to this vendor.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0f15]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-rose-900/50 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(225,29,72,0.15)]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-rose-400" size={20} /> Pay Supplier
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">You owe {supplier.company_name || supplier.name}</p>
            <p className="text-3xl font-bold text-rose-400">Rs {parseFloat(supplier.payable_balance).toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount Paying Now (Rs) *</label>
            <input type="number" required min="1" max={supplier.payable_balance} step="0.01" value={formData.amount_paid} onChange={(e) => setFormData({...formData, amount_paid: e.target.value})} 
              className="w-full bg-[#0b0f15]/50 border border-rose-900/50 rounded-xl p-3 text-rose-400 text-lg font-bold outline-none focus:border-rose-500 shadow-inner" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
            <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} 
              className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-rose-500 appearance-none">
              <option value="Cash">💵 Cash</option>
              <option value="Bank Transfer">🏦 Bank Transfer</option>
              <option value="EasyPaisa / JazzCash">📱 EasyPaisa / JazzCash</option>
              <option value="Cheque">🧾 Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes / Reference (Optional)</label>
            <input type="text" placeholder="e.g. Cleared August Bhal debt" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              className="w-full bg-[#0b0f15]/50 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-rose-500" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800">Cancel</button>
            <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-900/20">
              Confirm Payment Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}