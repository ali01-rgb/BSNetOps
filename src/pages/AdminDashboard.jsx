import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const data = [
  { name: 'Elektronik', value: 400 },
  { name: 'Alat Tulis', value: 300 },
  { name: 'Perabot', value: 300 },
  { name: 'Lainnya', value: 200 },
];

const COLORS = ['#00664b', '#3B82F6', '#F59E0B', '#EF4444'];

const activityLogs = [
  { id: 1, item: 'Laptop Dell', category: 'Elektronik', type: 'Keluar', date: '30/06/2026' },
  { id: 2, item: 'Kertas A4', category: 'ATK', type: 'Masuk', date: '30/06/2026' },
  { id: 3, item: 'Kursi Kantor', category: 'Perabot', type: 'Keluar', date: '29/06/2026' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-zinc-200 shadow-sm">
          <h3 className="text-zinc-500 text-sm">Total Barang</h3>
          <p className="text-3xl font-bold text-zinc-900 mt-2">1,284</p>
        </div>
        <div className="bg-white p-6 border border-zinc-200 shadow-sm">
          <h3 className="text-zinc-500 text-sm">Barang Keluar</h3>
          <p className="text-3xl font-bold text-zinc-900 mt-2">452</p>
        </div>
        <div className="bg-white p-6 border border-zinc-200 shadow-sm">
          <h3 className="text-zinc-500 text-sm">Stok Rendah</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">12</p>
        </div>
      </div>

      {/* Konten Utama: Chart (Kiri) & Tabel (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart Setengah Lingkaran */}
        <div className="bg-white p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Distribusi Stok Barang</h2>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <Pie 
                  data={data} 
                  startAngle={180} 
                  endAngle={0} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabel Aktivitas Terbaru */}
        <div className="bg-white p-6 border border-zinc-200 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Aktivitas Terakhir</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-zinc-500 border-b">
                <tr>
                  <th className="pb-3">Barang</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50">
                    <td className="py-4 font-medium">{log.item}</td>
                    <td className="py-4 text-zinc-600">{log.category}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.type === 'Masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-500">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}