import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ClipboardList, AlertTriangle, Users2, ShieldAlert } from 'lucide-react';

// Data Dummy untuk grafik utilisasi barang per divisi kerja
const divisionData = [
  { name: 'IT Ops', Pinjam: 45, Tersedia: 20 },
  { name: 'HRD', Pinjam: 12, Tersedia: 15 },
  { name: 'Finance', Pinjam: 8, HandsOn: 10 },
  { name: 'PR / Humas', Pinjam: 25, Tersedia: 5 },
];

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      
      {/* 1. Header Khusus Manager */}
      <div>
        <h2 className="text-xl font-bold text-white/900">Manager Oversight Dashboard</h2>
        <p className="text-s text-grey/100 mt-0.5">Ringkasan Analitik Distribusi Divisi dan Status Urgensi Inventaris Global</p>
      </div>

      {/* 2. Ringkasan Eksekutif (Kotak Data dengan Lengkungan & Shadow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Antrean Approval Card */}
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md border-l-4 border-l-amber-500 transition-all hover:scale-[1.01]">
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
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md border-l-4 border-l-[#00664b] transition-all hover:scale-[1.01]">
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
        <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md border-l-4 border-l-red-500 transition-all hover:scale-[1.01]">
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

      {/* 3. Visual Analitik Konten: Grafik Batang Distribusi (Ikut Dibuat Rounded) */}
      <div className="bg-white p-6 border border-zinc-200/80 rounded-xl shadow-md">
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
              <Tooltip />
              <Legend verticalAlign="top" height={36} iconType="rect" />
              <Bar dataKey="Pinjam" fill="#00664b" name="Sedang Dipinjam" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tersedia" fill="#3B82F6" name="Tersedia di Gudang" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Catatan Otoritas Tambahan */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex items-center gap-3">
        <div className="p-2 bg-zinc-200/60 text-zinc-600 rounded-md"><ShieldAlert size={18} /></div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          <strong>Mode Akun: Manager (Read-Only Data Analitik).</strong> Anda tidak memiliki hak akses untuk memanipulasi, menambah, atau menghapus entri barang fisik di dalam sistem inventaris gudang. Otoritas penuh mutasi aset dipegang oleh Admin.
        </p>
      </div>

    </div>
  );
}