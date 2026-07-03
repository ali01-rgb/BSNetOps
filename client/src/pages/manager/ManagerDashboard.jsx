import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ClipboardList, AlertTriangle, Users2, ShieldAlert, Building2, Package } from 'lucide-react';

// Data Dummy untuk grafik utilisasi barang per divisi kerja
const divisionData = [
  { name: 'IT Ops', Pinjam: 45, Tersedia: 20 },
  { name: 'HRD', Pinjam: 12, Tersedia: 15 },
  { name: 'Finance', Pinjam: 8, Tersedia: 10 },
  { name: 'PR / Humas', Pinjam: 25, Tersedia: 5 },
];

// ================= CUSTOM LEGEND DENGAN DOUBLE BORDER (Sesuai image_6178c6.png) =================
const CustomLegend = (props) => {
  const { payload } = props;

  return (
    <div className="flex items-center justify-center gap-6 mb-6 select-none">
      {payload.map((entry, index) => {
        // Ambil warna asli dari entry Recharts
        const isPinjam = entry.dataKey === 'Pinjam';
        const baseColor = isPinjam ? '#58a27d' : '#3b82f6';
        const borderColor = isPinjam ? 'rgba(88, 162, 125, 0.4)' : 'rgba(59, 130, 246, 0.4)';

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
            <span style={{ color: isPinjam ? '#1f2937' : '#1e3a8a' }}>
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ================= CUSTOM TOOLTIP FIXED FULL WHITE SOLID =================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const pinjamVal = payload.find(p => p.dataKey === 'Pinjam')?.value || 0;
    const tersediaVal = payload.find(p => p.dataKey === 'Tersedia')?.value || 0;

    return (
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] p-4 w-64 text-zinc-800 opacity-100 flex flex-col select-none pointer-events-none">
        
        {/* Header Judul Nama Divisi + Ikon Gedung */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-100 w-full">
          <div className="w-7 h-7 rounded-lg bg-[#004d38] text-white flex items-center justify-center shadow-sm shrink-0">
            <Building2 size={15} />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 truncate">{label}</span>
        </div>

        {/* Isi Indikator Data */}
        <div className="mt-3 space-y-2.5 text-xs font-semibold w-full">
          {/* Baris Kategori: Sedang Dipinjam */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#58a27d' }}></span>
              <span className="text-zinc-600 font-medium">Sedang Dipinjam</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-[#58a27d] border border-emerald-100/50 rounded-md shrink-0">
              <span className="font-bold">{pinjamVal}</span>
              <ClipboardList size={11} className="opacity-80" />
            </div>
          </div>

          {/* Baris Kategori: Tersedia di Gudang */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
              <span className="text-zinc-600 font-medium">Tersedia di Gudang</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-md shrink-0">
              <span className="font-bold">{tersediaVal}</span>
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
        <h2 className="text-xl font-bold text-[#00664b] tracking-tight">Manager Oversight Dashboard</h2>
        <p className="text-xs text-zinc-700 font-normal mt-0.5">Ringkasan Analitik Distribusi Divisi dan Status Urgensi Inventaris Global</p>
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

        {/* Aset Aktif Card */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-2xl shadow-sm border-l-4 border-l-[#00664b] transition-all hover:scale-[1.01]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Aset Aktif Dipinjam</h3>
              <p className="text-3xl font-bold text-zinc-900 mt-2">92 Unit</p>
              <p className="text-[11px] text-zinc-400 mt-2">Sedang digunakan oleh staf operasional</p>
            </div>
            <div className="p-2.5 bg-green-50 text-[#00664b] rounded-lg"><Users2 size={20} /></div>
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
          <h3 className="font-bold text-zinc-900 text-base">Statistik Distribusi Barang per Divisi</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Memantau rasio perbandingan barang yang terpakai vs cadangan stok siap pakai</p>
        </div>
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={divisionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: '#f4f4f5', opacity: 0.6 }}
                position={({ x, y }) => {
                  const targetX = x > 250 ? x - 275 : x + 20;
                  return { x: targetX, y: y - 40 };
                }}
              />
              
              {/* FIX TOTAL: Menyuntikkan komponen CustomLegend ganti bentuk bawaan */}
              <Legend verticalAlign="top" content={<CustomLegend />} />
              
              <Bar dataKey="Pinjam" fill="#58a27d" name="Sedang Dipinjam" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Tersedia" fill="#3b82f6" name="Tersedia di Gudang" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Catatan Otoritas Tambahan */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-zinc-200/60 text-zinc-600 rounded-md shrink-0"><ShieldAlert size={18} /></div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          <strong>Mode Akun: Manager (Read-Only Data Analitik).</strong> Anda tidak memiliki hak akses untuk memanipulasi, menambah, atau menghapus entri barang fisik di dalam sistem inventaris gudang. Otoritas penuh mutasi aset dipegang oleh Admin.
        </p>
      </div>

    </div>
  );
}