import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid, LabelList } from 'recharts';
import { ClipboardList, AlertTriangle, CheckSquare, ShieldAlert, Building2, Package } from 'lucide-react';
import { API_URL } from '@/api';

const CustomLegend = (props) => {
  const { payload } = props;

  return (
    <div className="flex items-center justify-center gap-6 mb-6 select-none">
      {payload.map((entry, index) => {
        const isKeluar = entry.dataKey === 'Keluar';
        const baseColor = isKeluar ? '#58a27d' : '#3b82f6';
        const borderColor = isKeluar ? 'rgba(88, 162, 125, 0.4)' : 'rgba(59, 130, 246, 0.4)';

        return (
          <div key={`item-${index}`} className="flex items-center gap-3 text-sm font-semibold">
            {/* Efek Double Border: Pembungkus Luar */}
            <div 
              className="w-6 h-6 rounded-[6px] border flex items-center justify-center p-[2px] shrink-0"
              style={{ borderColor: borderColor }}
            >
              {/* Kotak Warna Dalam */}
              <div 
                className="w-4 h-4 rounded-[4px]"
                style={{ backgroundColor: baseColor }}
              />
            </div>
            {/* Teks Label Legend */}
            <span style={{ color: isKeluar ? '#1f2937' : '#1e3a8a' }}>
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ManagerDashboard() {
  // 🔥 DAFTAR TEMPLATE UNIT Tetap Sama Seperti UI Asli
  const [unitData, setUnitData] = useState([
    { name: 'KC Semarang', Diminta: 0, Keluar: 0 },
    { name: 'KCP Majapahit', Diminta: 0, Keluar: 0 },
    { name: 'KCP Ngaliyan', Diminta: 0, Keluar: 0 },
    { name: 'KCP Ungaran', Diminta: 0, Keluar: 0 },
    { name: 'KCP Kendal', Diminta: 0, Keluar: 0 },
    { name: 'KCP Kudus', Diminta: 0, Keluar: 0 },
    { name: 'KCP Magelang', Diminta: 0, Keluar: 0 },
  ]);

  const [stats, setStats] = useState({
    antreanApproval: 0,
    barangKeluar: 0,
    restockSegera: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

// 🔥 AMBIL DATA DARI BACKEND DENGAN TRACKING PER KC/UNIT
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const headers = { "Authorization": `Bearer ${token}` };

      const [reqRes, assetsRes] = await Promise.all([
        // Gunakan endpoint admin agar bisa menarik semua data untuk analitik chart
        fetch(`${API_URL}/inventory/admin/requests`, { headers }),
        fetch(`${API_URL}/inventory/assets`, { headers })
      ]);

      let rawRequests = [];
      let rawAssets = [];

      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        rawRequests = reqJson.data || reqJson || [];
      }

      if (assetsRes.ok) {
        const assetsJson = await assetsRes.json();
        rawAssets = assetsJson.data || assetsJson || [];
      }

      // ==========================================
      // 1. HITUNG STATISTIK 3 CARD ATAS (REVISI)
      // ==========================================
      
      // A. Antrean Approval: Hanya cari barang yang 'DITERUSKAN' oleh Admin ke Manager
      const pendingItemsForManager = rawRequests.filter(r => 
        ['DITERUSKAN', 'DITERUSKAN KE MANAGER'].includes((r.status || '').toUpperCase())
      );
      
      // Mengelompokkan barang menjadi 1 "Surat Laporan" berdasarkan Tanggal & ID Pemohon
      const uniquePendingReports = new Set(
        pendingItemsForManager.map(r => {
          const rawDate = new Date(r.createdAt || Date.now());
          const tglStr = rawDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
          return `${tglStr}-${r.userId}`;
        })
      );
      const antreanApprovalCount = uniquePendingReports.size; // Hasilnya akan akurat (misal: 2 Pengajuan)

      // B. Barang Keluar: HANYA yang sudah ACC Final (Disetujui/Selesai/Diterima)
      const approvedRequests = rawRequests.filter(r => 
        ['DISETUJUI', 'SELESAI', 'APPROVED', 'DISERAHKAN', 'DITERIMA'].includes((r.status || '').toUpperCase())
      );
      const totalBarangKeluar = approvedRequests.reduce((acc, curr) => acc + (parseInt(curr.jumlah) || 0), 0);

      // C. Restock Segera: Stok barang yang tersisa <= 3
      const restockCount = rawAssets.filter(a => (parseInt(a.stok) || parseInt(a.stock) || 0) <= 3).length;

      setStats({
        antreanApproval: antreanApprovalCount,
        barangKeluar: totalBarangKeluar,
        restockSegera: restockCount
      });

      // ==========================================
      // 2. LOGIKA GRAFIK DISTRIBUSI (REVISI)
      // ==========================================
      const baseUnits = [
        { name: 'KC Semarang', Diminta: 0, Keluar: 0 },
        { name: 'KCP Majapahit', Diminta: 0, Keluar: 0 },
        { name: 'KCP Ngaliyan', Diminta: 0, Keluar: 0 },
        { name: 'KCP Ungaran', Diminta: 0, Keluar: 0 },
        { name: 'KCP Kendal', Diminta: 0, Keluar: 0 },
        { name: 'KCP Kudus', Diminta: 0, Keluar: 0 },
        { name: 'KCP Magelang', Diminta: 0, Keluar: 0 },
      ];

      rawRequests.forEach(req => {
        const userDivisi = (req.user?.divisi || req.unit || 'KC Semarang').trim();
        const jumlahBarang = parseInt(req.jumlah) || 0;
        const statusUpper = (req.status || '').toUpperCase();

        let targetUnit = baseUnits.find(u => u.name.toLowerCase() === userDivisi.toLowerCase());

        if (!targetUnit) {
          targetUnit = { name: userDivisi, Diminta: 0, Keluar: 0 };
          baseUnits.push(targetUnit);
        }

        // Semua request dihitung ke "Diminta" (Termasuk yang ditolak)
        targetUnit.Diminta += jumlahBarang;

        // "Keluar" hanya dihitung kalau barang benar-benar sudah ACC Final & Diambil
        if (['DISETUJUI', 'SELESAI', 'APPROVED', 'DISERAHKAN', 'DITERIMA'].includes(statusUpper)) {
          targetUnit.Keluar += jumlahBarang;
        }
      });

      setUnitData(baseUnits);

    } catch (error) {
      console.error("Gagal menyambungkan data Manager Dashboard:", error);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-800">
      
      {/* 1. Header Halaman */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Manager Oversight Dashboard</h2>
        <p className="text-xs text-white font-normal mt-0.5">Ringkasan Analitik Distribusi Unit dan Status Urgensi Inventaris Global</p>
      </div>

      {/* 2. Ringkasan Eksekutif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Antrean Approval Card */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-2xl shadow-sm border-l-4 border-l-amber-500 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Antrean Approval</h3>
              <p className="text-3xl font-bold text-zinc-900 mt-2">{stats.antreanApproval} Pengajuan</p>
              <p className="text-[11px] text-amber-600 mt-2 font-medium">Buka menu Approval Request untuk memproses</p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><ClipboardList size={20} /></div>
          </div>
        </div>

        {/* Barang Keluar Card */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-2xl shadow-sm border-l-4 border-l-[#00664b] transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Barang Keluar</h3>
              <p className="text-3xl font-bold text-zinc-900 mt-2">{stats.barangKeluar} Unit</p>
              <p className="text-[11px] text-zinc-400 mt-2">Total barang yang telah disetujui & didistribusikan</p>
            </div>
            <div className="p-2.5 bg-green-50 text-[#00664b] rounded-lg"><CheckSquare size={20} /></div>
          </div>
        </div>

        {/* Restock Segera Card */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-2xl shadow-sm border-l-4 border-l-red-500 transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Restock Segera</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.restockSegera} Kategori</p>
              <p className="text-[11px] text-red-500 mt-2 font-medium">Stok kritis di bawah batas minimum</p>
            </div>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
          </div>
        </div>
      </div>

      {/* 3. Visual Analitik Konten: Grafik Batang Distribusi */}
      <div className="bg-white p-6 border border-zinc-200/80 rounded-2xl shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-zinc-900 text-base">Statistik Permintaan vs Distribusi per Unit</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Memantau rasio perbandingan jumlah barang yang diminta dengan barang yang telah didistribusikan</p>
        </div>
        <div className="h-90 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={unitData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} dy={5} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} />

              <Legend verticalAlign="top" content={<CustomLegend />} />
              
              <Bar dataKey="Diminta" fill="#3b82f6" name="Barang Diminta" radius={[12, 12, 0, 0]}>
                <LabelList dataKey="Diminta" position="top" fontSize={15} fill="#3b82f6" fontWeight="bold" />
              </Bar>
              
              <Bar dataKey="Keluar" fill="#58a27d" name="Barang Keluar" radius={[12, 12, 0, 0]}>
                <LabelList dataKey="Keluar" position="top" fontSize={15} fill="#58a27d" fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Catatan Otoritas Tambahan */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-zinc-200/60 text-zinc-600 rounded-md shrink-0"><ShieldAlert size={18} /></div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          <strong>Mode Akun: Manager (Read-Only Data Analitik).</strong> Anda tidak memiliki hak akses untuk memanipulasi, menambah, atau menghapus entri barang fisik di dalam sistem inventaris gudang. Otoritas penuh mutasi aset dipegang oleh Admin Gudang.
        </p>
      </div>

    </div>
  );
}