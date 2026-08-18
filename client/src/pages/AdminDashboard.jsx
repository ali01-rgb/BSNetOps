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

        // 🔥 PERBAIKAN 1: Filter aset agar yang di-TRASH (deleted_at) tidak ikut terhitung!
        const activeAssets = assets.filter(item => !item.deleted_at);

        // ----------------------------------------------------
        // 2. HITUNG STATISTIK (Hukum Kekekalan Stok)
        // ----------------------------------------------------
        
        // A. Total Tersedia (Sisa Gudang Asli)
        const totalTersedia = activeAssets.reduce((acc, item) => acc + (parseInt(item.stok) || parseInt(item.stock) || 0), 0);

        // B. Total Keluar (Hanya yang berstatus SELESAI / APPROVED)
        const approvedRequests = requests.filter(r => 
          ['APPROVED', 'SELESAI', 'DISETUJUI', 'DITERIMA', 'DISERAHKAN'].includes((r.status || '').toUpperCase())
        );
        // Penting: Gunakan jumlah_disetujui jika ada, jika tidak gunakan jumlah
        const totalKeluar = approvedRequests.reduce((acc, curr) => acc + (parseInt(curr.jumlah_disetujui) || parseInt(curr.jumlah) || 0), 0);
        
        // C. Total Masuk (Barang Sisa + Barang Keluar)
        const totalMasuk = totalTersedia + totalKeluar;

        setStats({
          totalBarang: totalTersedia,
          barangMasuk: totalMasuk,
          barangKeluar: totalKeluar
        });

        // ----------------------------------------------------
        // 3. CHART KATEGORI (Hanya dari activeAssets)
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

        // Filter untuk membuang kategori yang stoknya 0 (opsional tapi lebih rapi)
        setCategoryData(formattedCategories.filter(c => c.value > 0));

        // ----------------------------------------------------
        // 4. LOG AKTIVITAS 
        // ----------------------------------------------------
        const requestLogs = requests
          .filter(req => !['DITOLAK', 'REJECTED'].includes((req.status || '').toUpperCase())) // Jangan tampilkan yang ditolak
          .map(req => {
            const isDone = ['APPROVED', 'SELESAI', 'DISETUJUI', 'DITERIMA', 'DISERAHKAN'].includes((req.status || '').toUpperCase());
            return {
              id: req.id,
              item: req.nama_aset || 'Barang Logistik',
              unit: req.user?.divisi || req.user?.fullName || 'User BSN',
              type: isDone ? 'Keluar' : 'Keluar', // Semua request adalah niat keluar
              status: isDone ? 'Selesai' : 'Pending', // Status asli di log mini
              rawDate: new Date(req.createdAt || Date.now()),
              date: formatFullDate(req.createdAt || Date.now())
            };
          });

        const assetLogs = activeAssets.map(ast => ({
          id: ast.id || ast.kode_barang,
          item: ast.nama_barang || 'Aset Baru',
          unit: 'Gudang Utama',
          type: 'Masuk',
          status: 'Selesai', // Barang masuk otomatis selesai
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
        
        {/* CHART DONUT */}
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

        {/* Tabel Aktivitas Terakhir */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Aktivitas Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-fixed">
              <thead>
                <tr className="text-zinc-500 border-b bg-zinc-50/50 text-xs uppercase font-semibold">
                  <th className="pb-3 pt-2 px-2 w-[40%]">Barang</th>
                  <th className="pb-3 pt-2 px-2 w-[22%]">Unit</th>
                  <th className="pb-3 pt-2 px-2 w-[18%]">Status</th>
                  <th className="pb-3 pt-2 px-2 w-[20%]">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-6 text-center text-zinc-400 text-xs">Memuat data aktivitas...</td></tr>
                ) : activityLogs.length === 0 ? (
                  <tr><td colSpan="4" className="py-6 text-center text-zinc-400 text-xs">Belum ada aktivitas.</td></tr>
                ) : (
                  activityLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/40 transition-colors">
                      <td className="py-3 px-2 font-semibold text-zinc-800 truncate" title={log.item}>
                        {log.item}
                      </td>
                      <td className="py-3 px-2 text-[#00664b] font-bold text-xs truncate" title={log.unit}>
                        {log.unit}
                      </td> 
                      <td className="py-3 px-2">
                        {/* Menyesuaikan badge agar konsisten dengan warna status */}
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${
                          log.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {log.status === 'Selesai' && log.type === 'Masuk' ? 'Masuk' : log.status === 'Selesai' ? 'Selesai' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-zinc-500 font-mono">{log.date}</td>
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