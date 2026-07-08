import React, { useState } from 'react';
import { Search, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';

const initialHistoryData = [
  { id: 'REQ-99201', requester: 'Chico Diar', itemName: 'MacBook Pro 14"', qty: 1, date: '2026-06-28', managerStatus: 'Approved', adminStatus: 'Selesai' },
  { id: 'REQ-99205', requester: 'Iwak Peyek', itemName: 'Kertas HVS A4 80gr', qty: 5, date: '2026-06-30', managerStatus: 'Pending', adminStatus: 'Menunggu ACC' },
  { id: 'REQ-99184', requester: 'Ahmad Subarjo', itemName: 'Kamera Sony Alpha A7 ii', qty: 1, date: '2026-06-25', managerStatus: 'Rejected', adminStatus: 'Ditolak' },
];

export default function HistoryPeminjaman() {
  const [history, setHistory] = useState(initialHistoryData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const filteredHistory = history
    .filter(item => (statusFilter === 'Semua' ? true : item.managerStatus === statusFilter))
    .filter(item =>
      item.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={12} /> Approved (Manajer)</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock size={12} /> Pending Manajer</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div>
        <h2 className="text-xl font-bold text-white">History Peminjaman</h2>
        <p className="text-xs text-white-500 mt-0.5">Pantau status validasi manajer dan kelola distribusi logistik fisik ke seluruh user</p>
      </div>

      {/* Filter Kontrol */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-md border border-zinc-200/80">
        <div className="flex-1 relative flex items-center">
          <Search size={18} className="absolute left-3 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan ID request, nama pemohon, atau nama barang..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white transition-colors"
          />
        </div>
        
        <div className="relative flex items-center bg-zinc-50 border border-zinc-200 rounded-lg px-3 hover:bg-zinc-100 transition-colors">
          <Filter size={16} className="text-zinc-500 mr-2" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-zinc-600 focus:outline-none cursor-pointer py-2 pr-2 font-medium"
          >
            <option value="Semua">Semua Status</option>
            <option value="Pending">Pending (Belum Di-ACC)</option>
            <option value="Approved">Approved (Sudah Di-ACC)</option>
            <option value="Rejected">Rejected (Ditolak)</option>
          </select>
        </div>
      </div>

      {/* Tabel Utama */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#58a27d] text-white text-xs uppercase font-semibold tracking-wider border-b border-[#478767]">
                <th className="p-4 rounded-tl-xl">ID Request</th>
                <th className="p-4">Nama Pemohon</th>
                <th className="p-4">Barang & Logistik</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Tanggal Ajuan</th>
                <th className="p-4 rounded-tr-xl">Status Manajer</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-400 font-medium bg-zinc-50/30">
                    Tidak ditemukan history log peminjaman yang cocok.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-zinc-900 bg-zinc-50/30">{item.id}</td>
                    <td className="p-4 font-semibold text-zinc-900">{item.requester}</td>
                    <td className="p-4 text-zinc-700 font-medium">{item.itemName}</td>
                    <td className="p-4 text-zinc-900 font-bold">{item.qty} Unit</td>
                    <td className="p-4 text-zinc-500 font-medium">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">{getStatusBadge(item.managerStatus)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}