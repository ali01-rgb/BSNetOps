import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Fungsi generator warna acak dinamis untuk tiap kategori
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

        // 1. Fetch paralel data Request dan Aset Gudang murni dari API
        const [reqRes, assetsRes] = await Promise.all([
          fetch("http://localhost:3000/inventory/admin/requests", { headers }),
          fetch("http://localhost:3000/inventory/assets", { headers })
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

        // ----------------------------------------------------
        // 2. HITUNG SESUAI RUMUS DATABASE
        // ----------------------------------------------------
        // Total Barang Masuk = Total stok fisik aset di database
        const totalMasuk = assets.reduce((acc, item) => acc + (parseInt(item.stok) || 0), 0);

        // Barang Keluar = Permintaan user yang sudah disetujui / diteruskan / diserahkan
        const approvedRequests = requests.filter(r => 
          ['APPROVED', 'DISERAHKAN', 'RECEIVED', 'DITERUSKAN', 'DISETUJUI'].includes((r.status || '').toUpperCase())
        );
        const totalKeluar = approvedRequests.reduce((acc, curr) => acc + (parseInt(curr.jumlah) || 0), 0);

        // Total Barang (Tersedia Sisa) = Barang Masuk - Barang Keluar
        const totalTersedia = Math.max(0, totalMasuk - totalKeluar);

        setStats({
          totalBarang: totalTersedia,
          barangMasuk: totalMasuk,
          barangKeluar: totalKeluar
        });

        // ----------------------------------------------------
        // 3. CHART KATEGORI (LENGKAP DENGAN KETERANGAN JUMLAH)
        // ----------------------------------------------------
        const categoryMap = {};
        assets.forEach(asset => {
          const katName = asset.kategori?.name || asset.kategori || asset.category || 'Lainnya';
          const stokNum = parseInt(asset.stok) || 0;
          categoryMap[katName] = (categoryMap[katName] || 0) + stokNum;
        });

        const formattedCategories = Object.keys(categoryMap).map((katName, idx) => ({
          name: katName,
          value: categoryMap[katName],
          color: generateRandomColor(idx)
        }));

        setCategoryData(formattedCategories.length > 0 ? formattedCategories : [{ name: 'Belum Ada Aset', value: 0, color: '#CBD5E1' }]);

        // ----------------------------------------------------
        // 4. LOG AKTIVITAS (GABUNGAN BARANG MASUK & KELUAR)
        // ----------------------------------------------------
        // A. Log Barang Keluar (Permintaan)
        const requestLogs = requests.map(req => ({
          id: req.id,
          item: req.nama_aset || 'Barang Logistik',
          unit: req.user?.divisi || req.user?.fullName || 'User BSN',
          type: ['APPROVED', 'DISERAHKAN', 'RECEIVED', 'DITERUSKAN', 'DISETUJUI'].includes((req.status || '').toUpperCase()) ? 'Keluar' : 'Pending',
          rawDate: new Date(req.createdAt || Date.now()),
          date: new Date(req.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        }));

        // B. Log Barang Masuk (Aset baru diinput)
        const assetLogs = assets.map(ast => ({
          id: ast.id || ast.kode_barang,
          item: ast.nama_barang || 'Aset Baru',
          unit: 'Gudang Utama',
          type: 'Masuk',
          rawDate: new Date(ast.createdAt || Date.now()),
          date: new Date(ast.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        }));

        // Combine dan urutkan dari yang paling baru
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

  // Custom Formatter untuk Legend Recharts biar menampilkan Jumlah Unit
  const renderCustomLegendText = (value, entry) => {
    const { payload } = entry;
    return (
      <span className="text-xs font-semibold text-zinc-700 ml-1">
        {value} <span className="text-zinc-500 font-normal">({payload.value} Unit)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Utama */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">Admin Overview</h2>
          <p className="text-xs text-white/80 mt-0.5">Ringkasan Riwayat Stok dan Transaksi Real-Time Gudang</p>
        </div>
      </div>

      {/* Ringkasan Statistik Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md transition-all hover:scale-[1.01]">
          <h3 className="text-zinc-500 text-sm font-medium">Total Barang Tersedia (Sisa)</h3>
          <p className="text-3xl font-bold text-[#00664b] mt-2">
            {isLoading ? "..." : `${stats.totalBarang.toLocaleString('id-ID')} Unit`}
          </p>
        </div>
        
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md transition-all hover:scale-[1.01]">
          <h3 className="text-zinc-500 text-sm font-medium">Barang Masuk (Stok Aset)</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {isLoading ? "..." : `${stats.barangMasuk.toLocaleString('id-ID')} Unit`}
          </p>
        </div>
        
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md transition-all hover:scale-[1.01]">
          <h3 className="text-zinc-500 text-sm font-medium">Barang Keluar (Approved)</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {isLoading ? "..." : `${stats.barangKeluar.toLocaleString('id-ID')} Unit`}
          </p>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart Distribusi Kategori Dinamis dengan Keterangan Jumlah */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Distribusi Stok per Kategori</h2>
          <div className="h-72 w-full pt-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">Memuat chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <Pie 
                    data={categoryData} 
                    startAngle={180} 
                    endAngle={0} 
                    innerRadius={60} 
                    outerRadius={85} 
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${val} Unit`} />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle" 
                    formatter={renderCustomLegendText}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tabel Aktivitas Terakhir (Barang Masuk & Keluar) */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Aktivitas Terbaru (Masuk & Keluar)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-zinc-500 border-b bg-zinc-50/50 text-xs uppercase font-semibold">
                  <th className="pb-3 pt-2 px-2">Barang</th>
                  <th className="pb-3 pt-2 px-2">Unit / Divisi</th>
                  <th className="pb-3 pt-2 px-2">Tipe</th>
                  <th className="pb-3 pt-2 px-2">Tanggal</th>
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
                      <td className="py-3 px-2 font-semibold text-zinc-800">{log.item}</td>
                      <td className="py-3 px-2 text-zinc-600 text-xs">{log.unit}</td> 
                      <td className="py-3 px-2">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${
                          log.type === 'Masuk'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : log.type === 'Keluar'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-zinc-400 font-mono">{log.date}</td>
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