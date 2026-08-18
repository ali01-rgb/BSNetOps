import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { API_URL } from '@/api';

// Warna acak dinamis untuk Chart
const generateRandomColor = (index) => {
  const baseColors = ['#00664b', '#3B82F6', '#FFBF00', '#EC4899', '#8B5CF6', '#10B981', '#F97316', '#6366F1'];
  if (index < baseColors.length) return baseColors[index];
  
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const formatFullDate = (rawDate) => {
  if (!rawDate) return '-';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return '-';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; 
};

export default function AdminDashboard({ role = 'admin' }) {
  const [stats, setStats] = useState({
    totalBarang: 0,
    barangMasuk: 0,
    barangKeluar: 0,
  });
  const [activityLogs, setActivityLogs] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const headers = { "Authorization": `Bearer ${token}` };

        const [reqRes, assetsRes] = await Promise.all([
          fetch(`${API_URL}/inventory/admin/requests`, { headers }),
          fetch(`${API_URL}/inventory/assets`, { headers })
        ]);

        let requests = [];
        let assets = [];

        if (reqRes.ok) {
          const reqJson = await reqRes.json();
          requests = reqJson.data || reqJson || [];
        }

        if (assetsRes.ok) {
          const assetsJson = await assetsRes.json();
          assets = assetsJson.data || assetsJson || [];
        }

        const activeAssets = assets.filter(item => !item.deleted_at);

        // ----------------------------------------------------
        // 1. STATISTIK AKUMULASI
        // ----------------------------------------------------
        const totalTersedia = activeAssets.reduce((acc, item) => acc + (parseInt(item.stok) || parseInt(item.stock) || 0), 0);

        const approvedRequests = requests.filter(r => 
          ['APPROVED', 'SELESAI', 'DISETUJUI', 'DITERIMA', 'DISERAHKAN'].includes((r.status || '').toUpperCase())
        );
        const totalKeluar = approvedRequests.reduce((acc, curr) => acc + (parseInt(curr.jumlah_disetujui) || parseInt(curr.jumlah) || 0), 0);
        const totalMasuk = totalTersedia + totalKeluar;

        setStats({
          totalBarang: totalTersedia,
          barangMasuk: totalMasuk,
          barangKeluar: totalKeluar
        });

        // ----------------------------------------------------
        // 2. CHART KATEGORI
        // ----------------------------------------------------
        const categoryMap = {};
        activeAssets.forEach(asset => {
          let katName = 'Tanpa Kategori';
          
          if (asset.category && typeof asset.category.name === 'string') {
            katName = asset.category.name;
          } else if (typeof asset.category === 'string') {
            katName = asset.category;
          } else if (asset.categoryId) {
            katName = `Kategori ID: ${asset.categoryId}`; 
          }

          const stokNum = parseInt(asset.stok) || parseInt(asset.stock) || 0;
          categoryMap[katName] = (categoryMap[katName] || 0) + stokNum;
        });

        const formattedCategories = Object.keys(categoryMap).map((katName, idx) => ({
          name: katName,
          value: categoryMap[katName],
          color: generateRandomColor(idx)
        }));

        setCategoryData(formattedCategories.filter(c => c.value > 0));

        // ----------------------------------------------------
        // 3. AKTIVITAS TERAKHIR (HANYA MASUK & KELUAR RESMI)
        // ----------------------------------------------------
        // Request: HANYA yang sudah di-ACC Manager (Selesai/Disetujui)
        const requestLogs = approvedRequests.map(req => ({
          id: req.id,
          item: req.nama_aset || 'Barang Logistik',
          unit: req.user?.divisi || req.user?.fullName || req.unit || 'KC Semarang',
          type: 'Keluar',
          rawDate: new Date(req.createdAt || Date.now()),
          date: formatFullDate(req.createdAt || Date.now())
        }));

        // Asset: Barang masuk aktif
        const assetLogs = activeAssets.map(ast => ({
          id: ast.id || ast.kode_barang,
          item: ast.nama_barang || ast.nama_aset || 'Aset Baru',
          unit: 'Gudang Pusat',
          type: 'Masuk',
          rawDate: new Date(ast.createdAt || Date.now()),
          date: formatFullDate(ast.createdAt || Date.now())
        }));

        const combinedLogs = [...requestLogs, ...assetLogs]
          .sort((a, b) => b.rawDate - a.rawDate)
          .slice(0, 6);

        setActivityLogs(combinedLogs);

      } catch (err) {
        console.error("Gagal mengambil data dashboard admin:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">Admin Overview</h2>
          <p className="text-xs text-white/80 mt-0.5">Ringkasan Riwayat Stok dan Transaksi Real-Time Gudang</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md transition-all hover:scale-[1.01]">
          <h3 className="text-zinc-500 text-sm font-medium">Total Barang Tersedia</h3>
          <p className="text-3xl font-bold text-[#00664b] mt-2">
            {isLoading ? "..." : `${stats.totalBarang.toLocaleString('id-ID')} Unit`}
          </p>
        </div>
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md transition-all hover:scale-[1.01]">
          <h3 className="text-zinc-500 text-sm font-medium">Barang Masuk</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {isLoading ? "..." : `${stats.barangMasuk.toLocaleString('id-ID')} Unit`}
          </p>
        </div>
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md transition-all hover:scale-[1.01]">
          <h3 className="text-zinc-500 text-sm font-medium">Barang Keluar</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {isLoading ? "..." : `${stats.barangKeluar.toLocaleString('id-ID')} Unit`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART DONUT KATEGORI */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Distribusi Stok per Kategori</h2>
          
          <div className="h-64 w-full pt-2 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">Memuat chart...</div>
            ) : categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">Belum ada data stok barang aktif.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <Pie 
                    data={categoryData} 
                    startAngle={180} 
                    endAngle={0} 
                    innerRadius={65} 
                    outerRadius={95} 
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val} Unit`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {!isLoading && categoryData.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 pt-4 border-t border-zinc-100 mt-2">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center text-sm font-semibold text-zinc-700">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0 mr-2" 
                    style={{ backgroundColor: cat.color }}
                  ></span>
                  {cat.name}: <span className="font-bold text-zinc-900 ml-1">{cat.value} Unit</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TABEL AKTIVITAS TERAKHIR */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Aktivitas Terakhir</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <thead>
                <tr className="text-zinc-500 border-b bg-zinc-50/50 text-xs uppercase font-semibold">
                  <th className="pb-3 pt-2 px-2 w-[38%]">Barang</th>
                  <th className="pb-3 pt-2 px-2 w-[24%]">Unit</th>
                  <th className="pb-3 pt-2 px-2 w-[18%] text-center">Status</th>
                  <th className="pb-3 pt-2 px-2 w-[20%] text-center">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-6 text-center text-zinc-400 text-xs">Memuat data aktivitas...</td></tr>
                ) : activityLogs.length === 0 ? (
                  <tr><td colSpan="4" className="py-6 text-center text-zinc-400 text-xs">Belum ada aktivitas transaksi.</td></tr>
                ) : (
                  activityLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/40 transition-colors">
                      <td className="py-3 px-2 font-semibold text-zinc-800 truncate" title={log.item}>
                        {log.item}
                      </td>
                      <td className="py-3 px-2 text-[#00664b] font-bold text-xs truncate" title={log.unit}>
                        {log.unit}
                      </td> 
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${
                          log.type === 'Masuk'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-zinc-500 font-mono text-center">{log.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}