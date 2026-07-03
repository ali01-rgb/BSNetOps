import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Check, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ApprovalRequest() {
  // State untuk Tab Filter Status Aktif
  const [activeTab, setActiveTab] = useState('menunggu');
  
  // State Input Pencarian dan Filter Dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedPriority, setSelectedPriority] = useState('Semua Prioritas');

  // Mock Data Permintaan Aset sesuai gambar mockup BSN Inventory
  const [requests, setRequests] = useState([
    {
      id: 'AST-2026-0001',
      pemohon: 'Chico Diar',
      divisi: 'IT Development',
      aset: 'Laptop Dell Latitude 5430',
      jumlah: '1 Unit',
      prioritas: 'Tinggi',
      tanggalPengajuan: '01 Juli 2026',
      jamPengajuan: '10:30',
      tanggalDibutuhkan: '10 Juli 2026',
      status: 'menunggu',
      alasan: 'Laptop diperlukan untuk pengembangan aplikasi internal perusahaan serta analisis data pada divisi IT.'
    },
    {
      id: 'AST-2026-0002',
      pemohon: 'Rina Amelia',
      divisi: 'Finance',
      aset: 'Printer Canon LBP 2900',
      jumlah: '1 Unit',
      prioritas: 'Sedang',
      tanggalPengajuan: '01 Juli 2026',
      jamPengajuan: '09:15',
      tanggalDibutuhkan: '12 Juli 2026',
      status: 'menunggu',
      alasan: 'Printer digunakan untuk mencetak laporan keuangan bulanan dan dokumen perpajakan fisik kantor.'
    },
    {
      id: 'AST-2026-0003',
      pemohon: 'Fahri Husein',
      divisi: 'Logistik',
      aset: 'Barcode Scanner Zebra',
      jumlah: '2 Unit',
      prioritas: 'Tinggi',
      tanggalPengajuan: '30 Juni 2026',
      jamPengajuan: '14:20',
      tanggalDibutuhkan: '05 Juli 2026',
      status: 'disetujui',
      alasan: 'Alat scanner tambahan untuk mempercepat proses in-out stock opname gudang utama.'
    }
  ]);

  // State pencatat ID data yang sedang dipilih untuk dimunculkan ke panel kanan
  const [selectedId, setSelectedId] = useState('AST-2026-0001');

  // Mengambil data detail objek berdasarkan item baris aktif yang dipilih
  const activeDetail = requests.find(item => item.id === selectedId) || requests[0];

  // Fungsi pengubah status persetujuan (Setujui / Tolak)
  const handleApproval = (id, newStatus) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
    alert(`Permintaan ${id} berhasil di-${newStatus}!`);
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-800">
      
      {/* ================= SISI KIRI: TABEL PERMINTAAN (KOLOM 1 & 2) ================= */}
      <div className="xl:col-span-2 space-y-5">
        {/* Judul & Deskripsi Sub-Header - FIX: Judul Bold Kembali */}
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Pengajuan Permintaan</h2>
          <p className="text-xs text-white-700 font-medium mt-0.5">Kelola dan tinjau berkas pengajuan persetujuan aset masuk dari karyawan.</p>
        </div>

        {/* Kelompok Tab Navigasi Filter Status - FIX: Semua Teks Hijau Permanen */}
        <div className="flex items-center gap-6 border-b border-[#00664b]/20 text-sm">
          {/* Tab Menunggu Persetujuan */}
          <button 
            onClick={() => setActiveTab('menunggu')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer text-white ${
              activeTab === 'menunggu' ? 'border-white font-bold' : 'border-transparent opacity-75'
            }`}
          >
            <span>Menunggu Persetujuan</span>
            <span className="bg-[#00664b] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {requests.filter(r => r.status === 'menunggu').length}
            </span>
          </button>
          
          {/* Tab Disetujui */}
          <button 
            onClick={() => setActiveTab('disetujui')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer text-white ${
              activeTab === 'disetujui' ? 'border-white font-bold' : 'border-transparent opacity-75'
            }`}
          >
            Disetujui
          </button>

          {/* Tab Ditolak */}
          <button 
            onClick={() => setActiveTab('ditolak')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer text-white ${
              activeTab === 'ditolak' ? 'border-white font-bold' : 'border-transparent opacity-75'
            }`}
          >
            Ditolak
          </button>
        </div>

        {/* Filter Bar & Kotak Pencarian */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Kolom Input Cari */}
          <div className="relative flex-1 w-full flex items-center">
            <Search size={16} className="absolute left-3 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Cari permintaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-[#00664b] shadow-sm"
            />
          </div>

          {/* Filter Kategori */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none focus:border-[#00664b] cursor-pointer shadow-sm"
          >
            <option>Semua Kategori</option>
            <option>Elektronik</option>
            <option>Alat Kantor</option>
          </select>

          {/* Filter Prioritas */}
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full sm:w-auto bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none focus:border-[#00664b] cursor-pointer shadow-sm"
          >
            <option>Semua Prioritas</option>
            <option>Tinggi</option>
            <option>Sedang</option>
            <option>Rendah</option>
          </select>

          {/* Tombol Ekstra Filter */}
          <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#00664b]/30 text-[#00664b] hover:bg-emerald-50 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm">
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Kontainer Utama Tabel */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase bg-zinc-50/50">
                  <th className="py-3 px-4 w-12 text-center"></th>
                  <th className="py-3 px-2">No. Permintaan</th>
                  <th className="py-3 px-4">Pemohon</th>
                  <th className="py-3 px-4">Aset</th>
                  <th className="py-3 px-4 text-center">Prioritas</th>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                {requests
                  .filter(r => r.status === activeTab)
                  .filter(r => r.pemohon.toLowerCase().includes(searchQuery.toLowerCase()) || r.aset.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`hover:bg-zinc-50/80 transition-colors cursor-pointer ${selectedId === item.id ? 'bg-emerald-50/40' : ''}`}
                    >
                      {/* Checkbox Kolom */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedId === item.id}
                          onChange={() => setSelectedId(item.id)}
                          className="w-4 h-4 rounded text-[#00664b] focus:ring-[#00664b] border-zinc-300 cursor-pointer accent-[#00664b]"
                        />
                      </td>
                      {/* ID Kode No. Permintaan */}
                      <td className="py-4 px-2 font-mono font-bold text-zinc-900">{item.id}</td>
                      {/* Identitas Karyawan Pemohon */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-800">{item.pemohon}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">{item.divisi}</span>
                        </div>
                      </td>
                      {/* Deskripsi Aset Kantor */}
                      <td className="py-4 px-4 max-w-[150px] truncate font-semibold text-zinc-700">
                        {item.aset}
                      </td>
                      {/* Tingkat Prioritas Penggunaan */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.prioritas === 'Tinggi' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.prioritas === 'Tinggi' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                          {item.prioritas}
                        </span>
                      </td>
                      {/* Waktu Masuk Dokumen */}
                      <td className="py-4 px-4 text-zinc-500 font-medium">
                        <div className="flex flex-col">
                          <span>{item.tanggalPengajuan}</span>
                          <span className="text-[10px] text-zinc-400">{item.jamPengajuan}</span>
                        </div>
                      </td>
                      {/* Tag Badge Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${
                          item.status === 'menunggu' ? 'bg-amber-100/70 text-amber-600 border-amber-200/50' :
                          item.status === 'disetujui' ? 'bg-emerald-100/70 text-emerald-600 border-emerald-200/50' : 'bg-red-100/70 text-red-600 border-red-200/50'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      {/* Menu Tindakan Lain */}
                      <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 hover:bg-zinc-200/60 rounded-md text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                ))}
                {requests.filter(r => r.status === activeTab).length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400 font-medium text-xs">
                      Tidak ada data permintaan pada tab ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-zinc-400">
            <span>Menampilkan 1 - {requests.filter(r => r.status === activeTab).length} data</span>
            <div className="flex items-center gap-1.5">
              <button className="p-1 border border-zinc-200 rounded-md bg-white text-zinc-400 hover:text-zinc-600 cursor-pointer shadow-sm">
                <ChevronLeft size={14} />
              </button>
              <button className="w-5 h-5 bg-[#00664b] text-white flex items-center justify-center rounded-md font-bold shadow-sm">
                1
              </button>
              <button className="p-1 border border-zinc-200 rounded-md bg-white text-zinc-400 hover:text-zinc-600 cursor-pointer shadow-sm">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SISI KANAN: DETAIL PANEL AKTIF (KOLOM 3) ================= */}
      <div className="space-y-4 xl:mt-14">
        {activeDetail ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-md p-5 space-y-6 sticky top-6">
            
            {/* Header Panel Detail */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-black text-zinc-900 tracking-tight">Detail Permintaan</h3>
              <span className="bg-emerald-50 border border-emerald-100 font-mono font-bold text-[#00664b] text-[10px] px-2 py-0.5 rounded-md tracking-wider">
                {activeDetail.id}
              </span>
            </div>

            {/* List Lembar Baris Informasi Dokumen */}
            <div className="text-xs space-y-3.5 font-medium">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Pemohon</span>
                <span className="col-span-2 text-zinc-800 font-bold">: {activeDetail.pemohon}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Divisi</span>
                <span className="col-span-2 text-zinc-700">: {activeDetail.divisi}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Aset</span>
                <span className="col-span-2 text-zinc-800 font-bold">: {activeDetail.aset}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Jumlah</span>
                <span className="col-span-2 text-zinc-700">: {activeDetail.jumlah}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-zinc-400 font-bold">Prioritas</span>
                <div className="col-span-2 flex items-center gap-1 text-zinc-800 font-bold">
                  <span>:</span>
                  <span className={`w-2 h-2 rounded-full inline-block ml-0.5 ${activeDetail.prioritas === 'Tinggi' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                  <span>{activeDetail.prioritas}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Tanggal Butuh</span>
                <span className="col-span-2 text-zinc-700 font-bold">: {activeDetail.tanggalDibutuhkan}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold leading-relaxed">Alasan</span>
                <span className="col-span-2 text-zinc-600 leading-relaxed text-justify">
                  : {activeDetail.alasan}
                </span>
              </div>
            </div>

            {/* Tombol Eksekusi Tindakan */}
            <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row xl:flex-col items-center gap-2.5">
              <div className="flex items-center gap-2 w-full">
                {/* Tombol Setujui */}
                <button 
                  disabled={activeDetail.status !== 'menunggu'}
                  onClick={() => handleApproval(activeDetail.id, 'disetujui')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00664b] hover:bg-[#004d38] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
                >
                  <Check size={14} /> Setujui
                </button>
                {/* Tombol Tolak */}
                <button 
                  disabled={activeDetail.status !== 'menunggu'}
                  onClick={() => handleApproval(activeDetail.id, 'ditolak')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-red-900/10 transition-all cursor-pointer"
                >
                  <X size={14} /> Tolak
                </button>
              </div>

              {/* Tombol Cetak / Tinjau File Dokumen PDF */}
              <button 
                onClick={() => alert(`Mengunduh berkas fisik PDF untuk data ${activeDetail.id}`)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <FileText size={14} className="text-zinc-400" /> Lihat PDF
              </button>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center text-zinc-400 font-medium text-xs">
            Pilih salah satu baris di tabel untuk melihat ringkasan detail dokumen.
          </div>
        )}
      </div>

    </div>
  );
}