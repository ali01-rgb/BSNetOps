import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList } from 'recharts';
import { ClipboardList, AlertTriangle, CheckSquare, ShieldAlert, Building2, Package } from 'lucide-react';

// 🔥 DATA BARU: Berdasarkan Unit, membandingkan Barang Diminta vs Barang Keluar
const unitData = [
  { name: 'KC Semarang', Diminta: 45, Keluar: 35 },
  { name: 'KCP Majapahit', Diminta: 25, Keluar: 20 },
  { name: 'KCP Ngaliyan', Diminta: 18, Keluar: 15 },
  { name: 'KCP Ungaran', Diminta: 30, Keluar: 28 },
  { name: 'KCP Kendal', Diminta: 15, Keluar: 10 },
  { name: 'KCP Kudus', Diminta: 20, Keluar: 18 },
  { name: 'KCP Magelang', Diminta: 12, Keluar: 12 },
];

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    //  AMBIL  KEY BARUDATA
    const dimintaVal = payload.find(p => p.dataKey === 'Diminta')?.value || 0;
    const keluarVal = payload.find(p => p.dataKey === 'Keluar')?.value || 0;

    return (
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] p-4 w-64 text-zinc-800 opacity-100 flex flex-col select-none pointer-events-none">
        
        {/* Header Judul Nama Unit + Ikon Gedung */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-100 w-full">
          <div className="w-7 h-7 rounded-lg bg-[#004d38] text-white flex items-center justify-center shadow-sm shrink-0">
            <Building2 size={15} />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 truncate">{label}</span>
        </div>

        {/* Isi Indikator Data */}
        <div className="mt-3 space-y-2.5 text-xs font-semibold w-full">
          
          {/* Baris Kategori: Barang Diminta (Biru) */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
              <span className="text-zinc-600 font-medium">Barang Diminta</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-md shrink-0">
              <span className="font-bold">{dimintaVal}</span>
              <ClipboardList size={11} className="opacity-80" />
            </div>
          </div>

          {/* Baris Kategori: Barang Keluar/Distribusi (Hijau) */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#58a27d' }}></span>
              <span className="text-zinc-600 font-medium">Telah Didistribusi</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-[#58a27d] border border-emerald-100/50 rounded-md shrink-0">
              <span className="font-bold">{keluarVal}</span>
              <Package size={11} className="opacity-80" />
            </div>
          </div>
          
        </div>

      </div>
    );
  }
  return null;
};

export default function ManagerDashboard() {
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
              <p className="text-3xl font-bold text-zinc-900 mt-2">2 Pengajuan</p>
              <p className="text-[11px] text-amber-600 mt-2 font-medium">Buka menu Approval Request untuk memproses</p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><ClipboardList size={20} /></div>
          </div>
        </div>

        {/* Barang Keluar Card (Menggantikan Aset Aktif Dipinjam) */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-2xl shadow-sm border-l-4 border-l-[#00664b] transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Barang Keluar</h3>
              <p className="text-3xl font-bold text-zinc-900 mt-2">92 Unit</p>
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
              <p className="text-3xl font-bold text-red-600 mt-2">4 Kategori</p>
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
            {/* Gunakan unitData yang baru */}
            <BarChart data={unitData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} dy={5} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} />

              {/* Tooltip dihapus/di-comment */}
              {/* <Tooltip ... /> */}
              
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