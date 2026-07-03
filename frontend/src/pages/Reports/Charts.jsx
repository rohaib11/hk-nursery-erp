import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Charts({ charts }) {
  const { salesTrend, topPlants } = charts;

  // Format date for the X-Axis
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-xl">
          <p className="text-slate-300 text-xs font-bold mb-2">{new Date(label).toDateString()}</p>
          <p className="text-emerald-400 font-bold text-lg">
            Rs {Number(payload[0].value).toLocaleString("en-PK")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      
      {/* REVENUE TREND CHART */}
      <div className="bg-[#111827]/60 border border-slate-700/50 p-6 rounded-2xl shadow-lg">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">30-Day Revenue Trend</h3>
        <div className="h-[300px] w-full">
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tickFormatter={formatXAxis} tick={{fontSize: 12}} dy={10} />
                <YAxis stroke="#64748b" tickFormatter={(value) => `Rs ${value/1000}k`} tick={{fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="daily_revenue" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: '#34d399', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">Not enough data to display trend.</div>
          )}
        </div>
      </div>

      {/* TOP SELLING PLANTS CHART */}
      <div className="bg-[#111827]/60 border border-slate-700/50 p-6 rounded-2xl shadow-lg">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">Top Moving Inventory (Volume)</h3>
        <div className="h-[300px] w-full">
          {topPlants.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPlants} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis dataKey="name" type="category" stroke="#e2e8f0" tick={{fontSize: 12, fill: '#94a3b8'}} width={100} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} 
                />
                <Bar dataKey="total_sold" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">No sales data available yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}