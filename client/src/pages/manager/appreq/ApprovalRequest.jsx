import React, { useState } from 'react';
import { Search, Check, X, ChevronLeft, ChevronRight, AlertCircle, X as CloseIcon } from 'lucide-react';

export default function ApprovalRequest() {
  // State untuk Tab Filter Status Aktif ('menunggu', 'disetujui', 'ditolak')
  const [activeTab, setActiveTab] = useState('menunggu');
  
  // State Input Pencarian dan Dropdown Filter Kategori/Prioritas
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedPriority, setSelectedPriority] = useState('Semua Prioritas');

  // State untuk Pop-up Utama (Detail)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [givenAmount, setGivenAmount] = useState('');

  // State untuk Pop-up Kedua (Konfirmasi Setuju/Tolak)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(''); // 'disetujui' atau 'ditolak'

  // Mock Data Permintaan Aset (Sudah disesuaikan dengan field yang kamu minta)
  const [requests, setRequests] = useState([
    {
      id: 'AST-2026-0001',
      namaPemohon: 'Chico Diar',
      unit: 'KC Semarang',
      namaBarang: 'Laptop Dell Latitude 5430',
      jumlahDiminta: 5,
      jumlahDiberikan: 0,
      prioritas: 'Tinggi',
      tanggal: '01 Juli 2026',
      jam: '10:30',
      status: 'menunggu',
      keperluan: 'Laptop diperlukan untuk pengembangan aplikasi internal perusahaan serta analisis data pada unit.'
    },
    {
      id: 'AST-2026-0002',
      namaPemohon: 'Rina Amelia',
      unit: 'KCP Majapahit',
      namaBarang: 'Printer Canon LBP 2900',
      jumlahDiminta: 2,
      jumlahDiberikan: 0,
      prioritas: 'Sedang',
      tanggal: '01 Juli 2026',
      jam: '09:15',
      status: 'menunggu',
      keperluan: 'Printer digunakan untuk mencetak laporan keuangan bulanan dan dokumen perpajakan fisik kantor.'
    },
    {
      id: 'AST-2026-0003',
      namaPemohon: 'Fahri Husein',
      unit: 'KCP Ungaran',
      namaBarang: 'Barcode Scanner Zebra',
      jumlahDiminta: 3,
      jumlahDiberikan: 3,
      prioritas: 'Tinggi',
      tanggal: '30 Juni 2026',
      jam: '14:20',
      status: 'disetujui',
      keperluan: 'Alat scanner tambahan untuk mempercepat proses in-out stock opname gudang utama.'
    }
  ]);

  // Mengambil data detail objek berdasarkan item baris aktif yang dipilih
  const activeDetail = requests.find(item => item.id === selectedId);

  // Fungsi membuka Pop-up detail utama
  const handleOpenModal = (item) => {
    setSelectedId(item.id);
    setGivenAmount(item.status === 'menunggu' ? item.jumlahDiminta : item.jumlahDiberikan);
    setIsModalOpen(true);
  };

  // Fungsi memicu Pop-up konfirmasi (Setujui / Tolak)
  const triggerConfirmation = (type) => {
    setConfirmType(type);
    setIsConfirmOpen(true);
  };

  // Fungsi Final saat Manager klik "Yakin" di Pop-up Konfirmasi
  const handleFinalApproval = () => {
    setRequests(prev => prev.map(req => 
      req.id === selectedId 
        ? { ...req, status: confirmType, jumlahDiberikan: confirmType === 'disetujui' ? givenAmount : 0 } 
        : req
    ));
    setIsConfirmOpen(false);
    setIsModalOpen(false); // Tutup semua pop-up setelah sukses
  };

  return (
    <div className="w-full relative animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-800">
      
      <div className="space-y-5">
        {/* Judul & Deskripsi Sub-Header */}
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Pengajuan Permintaan</h2>
          <p className="text-xs text-white font-medium mt-0.5">Kelola dan tinjau berkas pengajuan persetujuan aset masuk dari karyawan.</p>
        </div>

        {/* Kelompok Tab Navigasi Filter Status */}
        <div className="flex items-center gap-6 border-b border-[#00664b]/20 text-sm">
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
          
          <button 
            onClick={() => setActiveTab('disetujui')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer text-white ${
              activeTab === 'disetujui' ? 'border-white font-bold' : 'border-transparent opacity-75'
            }`}
          >
            Disetujui
          </button>

          <button 
            onClick={() => setActiveTab('ditolak')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer text-white ${
              activeTab === 'ditolak' ? 'border-white font-bold' : 'border-transparent opacity-75'
            }`}
          >
            Ditolak
          </button>
        </div>

        {/* Bar Pencarian + Dropdown Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
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
        </div>

        {/* Kontainer Utama Tabel */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-bold text-white uppercase bg-[#58a27d]">
                  <th className="py-3 px-4 w-12 text-center"></th>
                  <th className="py-3 px-2">No. Permintaan</th>
                  <th className="py-3 px-4">Pemohon</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4 text-center">Prioritas</th>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                {requests
                  .filter(r => r.status === activeTab)
                  .filter(r => selectedPriority === 'Semua Prioritas' ? true : r.prioritas === selectedPriority)
                  .filter(r => 
                    r.namaPemohon.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    r.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    r.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => handleOpenModal(item)}
                      className="hover:bg-zinc-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4 text-center">
                        <div className="w-4 h-4 rounded border border-zinc-300 mx-auto"></div>
                      </td>
                      <td className="py-4 px-2 font-mono font-bold text-zinc-900">{item.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-800">{item.namaPemohon}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">{item.unit}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-[150px] truncate font-semibold text-zinc-700">
                        {item.namaBarang}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.prioritas === 'Tinggi' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.prioritas === 'Tinggi' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                          {item.prioritas}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-500 font-medium">
                        <div className="flex flex-col">
                          <span>{item.tanggal}</span>
                          <span className="text-[10px] text-zinc-400">{item.jam}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${
                          item.status === 'menunggu' ? 'bg-amber-100/70 text-amber-600 border-amber-200/50' :
                          item.status === 'disetujui' ? 'bg-emerald-100/70 text-emerald-600 border-emerald-200/50' : 'bg-red-100/70 text-red-600 border-red-200/50'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                {requests.filter(r => r.status === activeTab).length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 font-medium text-xs">
                      Tidak ada data permintaan pada tab ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-end text-[11px] font-bold text-zinc-400">
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

      {/* ================= POP-UP LEVEL 1: DETAIL PERMINTAAN ================= */}
      {isModalOpen && activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative">
            
            {/* Header Pop-up */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100 bg-zinc-50/50">
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-tight">Detail Berkas Permintaan</h3>
                <p className="text-[10px] font-mono font-bold text-[#00664b] mt-0.5 tracking-wider">{activeDetail.id}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Isi Pop-up (Menampilkan seluruh field yang kamu minta) */}
            <div className="p-6 space-y-4 text-xs font-medium text-zinc-700">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Nama Pemohon</span>
                <span className="col-span-2 text-zinc-900 font-bold">: {activeDetail.namaPemohon}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Unit</span>
                <span className="col-span-2 text-zinc-900 font-semibold">: {activeDetail.unit}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Nama Barang</span>
                <span className="col-span-2 text-zinc-900 font-bold text-sm">: {activeDetail.namaBarang}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Jumlah Diminta</span>
                <span className="col-span-2 text-zinc-900 font-semibold">: {activeDetail.jumlahDiminta} Unit</span>
              </div>
              
              {/* Field: Jumlah Diberikan (Bisa diketik manual jika statusnya masih menunggu) */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-[#00664b] font-bold">Jumlah Diberikan</span>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-bold">:</span>
                  {activeDetail.status === 'menunggu' ? (
                    <input 
                      type="number" 
                      min="0"
                      max={activeDetail.jumlahDiminta}
                      value={givenAmount}
                      onChange={(e) => setGivenAmount(e.target.value)}
                      className="w-20 px-2 py-1 text-center font-bold text-[#00664b] bg-emerald-50/50 border border-emerald-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00664b]"
                    />
                  ) : (
                    <span className="font-bold text-[#00664b]">{activeDetail.jumlahDiberikan} Unit</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-zinc-400 font-bold">Prioritas</span>
                <div className="col-span-2 flex items-center gap-1 font-bold">
                  <span>:</span>
                  <span className={`w-2 h-2 rounded-full inline-block mx-1 ${activeDetail.prioritas === 'Tinggi' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                  <span className={activeDetail.prioritas === 'Tinggi' ? 'text-red-600' : 'text-amber-600'}>{activeDetail.prioritas}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-zinc-400 font-bold">Tanggal</span>
                <span className="col-span-2 text-zinc-900 font-semibold">: {activeDetail.tanggal} ({activeDetail.jam})</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100">
                <span className="text-zinc-400 font-bold leading-relaxed">Keperluan</span>
                <span className="col-span-2 text-zinc-600 leading-relaxed text-justify">
                  : {activeDetail.keperluan}
                </span>
              </div>
            </div>

            {/* Tombol Aksi di bagian bawah pop-up */}
            {activeDetail.status === 'menunggu' && (
              <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex items-center gap-3">
                <button 
                  onClick={() => triggerConfirmation('disetujui')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00664b] hover:bg-[#004d38] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Check size={16} /> Setujui
                </button>
                <button 
                  onClick={() => triggerConfirmation('ditolak')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <X size={16} /> Tolak
                </button>
              </div>
            )}
            
            {activeDetail.status !== 'menunggu' && (
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 text-center font-bold text-xs text-zinc-400 uppercase tracking-wider">
                Permintaan ini telah {activeDetail.status}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= POP-UP LEVEL 2: KONFIRMASI AKSI (ALERT DIALOG) ================= */}
      {isConfirmOpen && activeDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="mx-auto w-12 h-12 bg-zinc-50 border border-zinc-100 flex items-center justify-center rounded-full text-zinc-700 shadow-sm">
              <AlertCircle size={24} className={confirmType === 'disetujui' ? 'text-[#00664b]' : 'text-red-500'} />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-black text-zinc-900">Konfirmasi Tindakan</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Apakah Anda yakin ingin <span className={`font-bold ${confirmType === 'disetujui' ? 'text-[#00664b]' : 'text-red-500'}`}>{confirmType}</span> permintaan dari <span className="font-bold text-zinc-800">{activeDetail.namaPemohon}</span>?
              </p>
              {confirmType === 'disetujui' && (
                <p className="text-[11px] bg-emerald-50 text-[#00664b] font-bold p-1.5 rounded-md mt-2">
                  Jumlah yang akan diberikan: {givenAmount} Unit
                </p>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={handleFinalApproval}
                className={`flex-1 py-2 text-white text-xs font-bold rounded-lg cursor-pointer shadow-md transition-colors ${
                  confirmType === 'disetujui' ? 'bg-[#00664b] hover:bg-[#004d38]' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Ya, Saya Yakin
              </button>
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-2 bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}