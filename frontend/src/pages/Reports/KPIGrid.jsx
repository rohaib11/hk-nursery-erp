import { Wallet, ArrowDownRight, ArrowUpRight, Package, Landmark, LineChart } from 'lucide-react';

export default function KPIGrid({ kpis }) {
  const money = (n) => new Intl.NumberFormat("en-PK").format(Number(n) || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      
      {/* CASH FLOW */}
      <div className="bg-[#111827]/60 border border-slate-700/50 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={80} /></div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Net Cash In Hand</p>
        <h3 className={`text-4xl font-black mb-4 ${kpis.cashInHand >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          Rs {money(kpis.cashInHand)}
        </h3>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="flex items-center gap-1 text-emerald-400"><ArrowDownRight size={16}/> In: {money(kpis.totalCashIn)}</span>
          <span className="flex items-center gap-1 text-rose-400"><ArrowUpRight size={16}/> Out: {money(kpis.totalCashOut)}</span>
        </div>
      </div>

      {/* MARKET DEBT (UDHAAR) */}
      <div className="bg-[#111827]/60 border border-slate-700/50 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Landmark size={80} /></div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Market Debt (Udhaar)</p>
        <div className="space-y-4 mt-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-emerald-400 font-medium">People Owe You (Receivables)</span>
              <span className="text-white font-bold">Rs {money(kpis.totalReceivables)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-400 h-1.5 rounded-full" style={{width: '70%'}}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-rose-400 font-medium">You Owe Vendors (Payables)</span>
              <span className="text-white font-bold">Rs {money(kpis.totalPayables)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-rose-400 h-1.5 rounded-full" style={{width: '30%'}}></div></div>
          </div>
        </div>
      </div>

      {/* INVENTORY VALUATION */}
      <div className="bg-[#111827]/60 border border-slate-700/50 p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Package size={80} /></div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Live Inventory Value</p>
        <h3 className="text-4xl font-black text-indigo-400 mb-4">Rs {money(kpis.potentialRevenue)}</h3>
        <p className="text-slate-400 text-sm font-medium">
          Total Investment Cost: <span className="text-white">Rs {money(kpis.inventoryValue)}</span>
        </p>
      </div>

    </div>
  );
}