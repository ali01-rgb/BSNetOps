import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, X, AlertCircle, X as CloseIcon, CheckSquare, MoreVertical, Download, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import TemplateDokumenA4 from '../../user/permintaan/TemplateDokumenA4'; 
import toast from 'react-hot-toast'; 
import { API_URL } from '@/api';

export default function ApprovalRequest() {
  const printRef = useRef();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('Menunggu Manager');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Semua Prioritas');
  const [selectedRows, setSelectedRows] = useState([]);

  // 🔥 STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(''); 
  const [confirmTargets, setConfirmTargets] = useState([]); 

  const [showBonPreview, setShowBonPreview] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchRequestsFromAPI();
  }, []);

  const fetchRequestsFromAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/inventory/manager/requests`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Gagal mengambil data permintaan");

      const resJson = await res.json();
      const rawRequests = resJson.data || resJson;

      if (Array.isArray(rawRequests)) {
        const bobotPrioritas = { 'Tinggi': 3, 'Sedang': 2, 'Rendah': 1 };

        const groupedData = rawRequests.reduce((acc, curr) => {
          let rawDate = new Date(curr.createdAt || curr.tanggal_dibutuhkan || Date.now());
          if (isNaN(rawDate.getTime())) rawDate = new Date();

          const tglStr = rawDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
          const pemohonName = curr.user?.fullName || curr.user?.username || 'Pemohon BSN';
          const divisiPemohon = curr.user?.divisi || 'KC Semarang';

          const groupKey = `${tglStr}-${curr.userId}`;

          const statusUpper = (curr.status || '').toUpperCase();
          let currentStatus = 'Menunggu Manager'; 

          if (['PENDING', 'DITERUSKAN', 'MENUNGGU'].includes(statusUpper)) {
            currentStatus = 'Menunggu Manager';
          } else if (['DISETUJUI', 'SELESAI', 'APPROVED'].includes(statusUpper)) {
            currentStatus = 'Selesai';
          } else if (['DITOLAK', 'REJECTED'].includes(statusUpper)) {
            currentStatus = 'Ditolak';
          }

          if (!acc[groupKey]) {
            const padId = String(Object.keys(acc).length + 1).padStart(3, '0');
            const tglFormatId = rawDate.toISOString().slice(0,10).replace(/-/g, '');
            const prettyId = `REQ-${tglFormatId}-${padId}`; 

            acc[groupKey] = {
              id: prettyId, 
              namaPemohon: pemohonName,
              unit: divisiPemohon,
              prioritas: curr.prioritas || 'Rendah',
              tanggal: tglStr,
              jam: rawDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              status: currentStatus,
              rawStatus: curr.status, 
              keperluan: curr.alasan || '-',
              adminName: curr.adminName || '',     
              managerName: curr.managerName || '', 
              items: []
            };
          } else {
            const currentGroupPriority = acc[groupKey].prioritas;
            const newItemPriority = curr.prioritas || 'Rendah';

            if ((bobotPrioritas[newItemPriority] || 1) > (bobotPrioritas[currentGroupPriority] || 1)) {
              acc[groupKey].prioritas = newItemPriority; 
            }
          }

          acc[groupKey].items.push({
            idItem: curr.id, 
            kodeBarang: curr.no_urut ? `RQ-${String(curr.no_urut).padStart(3,'0')}` : '-', 
            namaBarang: curr.nama_aset || 'Barang Logistik',
            jumlahDiminta: curr.jumlah || 1,
            jumlahDisetujui: curr.jumlah_disetujui ?? curr.jumlah ?? 1,
            prioritas: curr.prioritas || 'Rendah', 
            remark: curr.alasan || ''
          });

          return acc;
        }, {});

        const formattedList = Object.values(groupedData);
        formattedList.sort((a, b) => b.id.localeCompare(a.id));
        setRequests(formattedList);
      }
    } catch (error) {
      console.error('Gagal memuat data permintaan:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 RESET PAGINATION SAAT FILTER BERUBAH
  useEffect(() => {
    setSelectedRows([]);
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedPriority]);

  const filteredRequests = requests.filter(r => {
    const matchTab = activeTab === 'Semua' ? true : r.status?.toLowerCase() === activeTab.toLowerCase();
    const matchPriority = selectedPriority === 'Semua Prioritas' ? true : r.prioritas === selectedPriority;
    
    const matchSearch = 
      (r.namaPemohon || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some(item => (item.namaBarang || '').toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchTab && matchPriority && matchSearch;
  });

  // 🔥 LOGIKA PAGINATION
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Hanya item yang berstatus 'Menunggu Manager' yang dapat dipilih
  const selectableInPage = paginatedRequests.filter(r => r.status?.toLowerCase() === 'menunggu manager');
  const isAllSelected = selectableInPage.length > 0 && selectableInPage.every(r => selectedRows.includes(r.id));

  const handleSelectRow = (e, id) => {
    e.stopPropagation(); 
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(selectableInPage.map(r => r.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleOpenModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const triggerConfirmation = (type, targetIds) => {
    setConfirmType(type);
    setConfirmTargets(targetIds);
    setIsConfirmOpen(true);
  };

  const handleFinalAction = async () => {
    const loadingToast = toast.loading('Memproses persetujuan data...');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const targetItemIds = [];
      confirmTargets.forEach(prettyId => {
        const foundGroup = requests.find(r => r.id === prettyId);
        if (foundGroup) {
          foundGroup.items.forEach(item => targetItemIds.push(item.idItem));
        }
      });

      for (const reqId of targetItemIds) {
        const res = await fetch(`${API_URL}/inventory/admin/requests/${reqId}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: confirmType === 'Selesai' ? 'Disetujui' : 'Ditolak' })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Gagal memproses request ${reqId}`);
        }
      }

      toast.dismiss(loadingToast); 
      
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in fade-in slide-in-from-bottom-5' : 'animate-out fade-out slide-out-to-bottom-5'} max-w-sm w-full bg-white shadow-lg rounded-xl border border-zinc-100 p-4 flex items-center gap-3`}>
          <div className="w-8 h-8 rounded-full bg-[#00664b] flex items-center justify-center shrink-0">
            <Check size={18} className="text-white" strokeWidth={3} />
          </div>
          <p className="text-[13px] font-bold text-zinc-800 leading-tight">
            {confirmType === 'Selesai' ? 'Permintaan berhasil disetujui & stok berhasil dipotong' : 'Permintaan berhasil ditolak!'}
          </p>
        </div>
      ), { position: 'bottom-center', duration: 4000 });

      setSelectedRows([]);
      setIsConfirmOpen(false);
      setIsModalOpen(false);
      fetchRequestsFromAPI(); 

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Gagal memproses:', error.message);
      toast.error('Terjadi kesalahan saat memproses data ke database server.');
    }
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;
    setIsExporting(true);

    const opt = {
      margin:       0,
      filename:     `Bon_Barang_${activeDetail?.id || 'BSN'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsExporting(false);
      setIsMenuOpen(false);
    }).catch((err) => {
      console.error("Error:", err);
      setIsExporting(false);
      setIsMenuOpen(false);
    });
  };

  const activeDetail = requests.find(item => item.id === selectedId);

  const mappedFormData = activeDetail ? {
    divisi: activeDetail.unit,
    alasanDibutuhkan: activeDetail.keperluan,
    namaLengkap: activeDetail.namaPemohon,
    status: activeDetail.rawStatus || activeDetail.status, 
    adminName: activeDetail.adminName || 'Admin Gudang',
    managerName: activeDetail.status === 'Selesai' ? (activeDetail.managerName || 'Manager Operasional') : ''
  } : {};

  const mappedDaftarBarang = activeDetail ? activeDetail.items.map(item => ({
    namaAset: item.namaBarang,
    jumlahDiminta: item.jumlahDiminta,
    jumlahDisetujui: item.jumlahDisetujui,
    remark: item.remark
  })) : [];

  return (
    <div className="w-full relative animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-800">
      
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Final Approval Manager</h2>
          <p className="text-xs text-white font-medium mt-0.5">Tinjau permohonan yang telah diproses Admin dan berikan ACC Final.</p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-6 border-b border-[#00664b]/20 text-sm">
          {['Menunggu Manager', 'Selesai', 'Ditolak', 'Semua'].map((status) => (
            <button 
              key={status} 
              onClick={() => setActiveTab(status)}
              className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer text-white capitalize ${
                activeTab === status ? 'border-white font-bold' : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <span>{status === 'Menunggu Manager' ? 'Menunggu Persetujuan' : status}</span>
              <span className="bg-[#00664b] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {status === 'Semua' 
                  ? requests.length 
                  : requests.filter(r => r.status?.toLowerCase() === status.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Cari ID, pemohon, atau barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-[#00664b] transition-colors"
              />
            </div>
            <select 
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full sm:w-auto bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 focus:outline-none focus:border-[#00664b] cursor-pointer"
            >
              <option>Semua Prioritas</option>
              <option>Tinggi</option>
              <option>Sedang</option>
              <option>Rendah</option>
            </select>
          </div>

          <div 
            className={`transition-all duration-500 ease-out overflow-hidden flex items-center ${
              selectedRows.length > 0 
                ? 'opacity-100 translate-x-0 max-w-[500px] ml-4' 
                : 'opacity-0 translate-x-12 max-w-0 ml-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center w-max">
              <span className="text-xs font-bold text-zinc-500 mr-3 whitespace-nowrap">
                {selectedRows.length} Terpilih
              </span>
              <button 
                onClick={() => triggerConfirmation('Selesai', selectedRows)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00664b] hover:bg-[#00553e] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer mr-2 whitespace-nowrap"
              >
                <Check size={14} /> ACC Semua
              </button>
              <button 
                onClick={() => triggerConfirmation('Ditolak', selectedRows)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <X size={14} /> Tolak Semua
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Request */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-bold text-white uppercase bg-[#58a27d]">
                  <th className="py-3 px-4 w-12 text-center">
                    {/* Checkbox Header hanya muncul jika ada item 'Menunggu Manager' di halaman ini */}
                    {selectableInPage.length > 0 && (
                      <input 
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 rounded border-zinc-300 text-[#00664b] focus:ring-[#00664b] cursor-pointer accent-[#00664b]"
                      />
                    )}
                  </th>
                  <th className="py-3 px-2">ID Permintaan</th>
                  <th className="py-3 px-4">Pemohon</th>
                  <th className="py-3 px-4">Daftar Barang</th>
                  <th className="py-3 px-4 text-center">Prioritas Utama</th>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 font-medium text-xs">
                      Memuat data dari database...
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => handleOpenModal(item.id)}
                      className={`hover:bg-zinc-50/80 transition-colors cursor-pointer ${selectedRows.includes(item.id) ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="py-4 px-4 text-center">
                        {/* Checkbox baris hanya muncul jika status masih 'Menunggu Manager' */}
                        {item.status?.toLowerCase() === 'menunggu manager' && (
                          <input 
                            type="checkbox"
                            checked={selectedRows.includes(item.id)}
                            onChange={(e) => handleSelectRow(e, item.id)}
                            onClick={(e) => e.stopPropagation()} 
                            className="w-3.5 h-3.5 rounded border-zinc-300 text-[#00664b] focus:ring-[#00664b] cursor-pointer accent-[#00664b]"
                          />
                        )}
                      </td>
                      <td className="py-4 px-2 font-mono font-bold text-zinc-900">{item.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-800">{item.namaPemohon}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">{item.unit}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-zinc-700 block truncate max-w-[200px]">
                          {item.items.map(i => i.namaBarang).join(', ')}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">Total: {item.items.length} jenis barang</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black border ${
                          item.prioritas === 'Tinggi' ? 'bg-red-50 text-red-600 border-red-200' : 
                          item.prioritas === 'Sedang' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
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
                          item.status.toLowerCase() === 'menunggu manager' ? 'bg-amber-100/70 text-amber-600 border-amber-200/50' :
                          item.status.toLowerCase() === 'selesai' || item.status.toLowerCase() === 'disetujui' ? 'bg-emerald-100/70 text-emerald-600 border-emerald-200/50' : 'bg-red-100/70 text-red-600 border-red-200/50'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 font-medium text-xs">
                      Tidak ada data permintaan yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Controls Pagination (Ditempatkan di Paling Kanan) */}
          {!loading && filteredRequests.length > 0 && (
            <div className="flex items-center justify-end p-4 border-t border-zinc-100 bg-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[11px] font-bold text-zinc-700">Hal {currentPage} / {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Berkas */}
      {isModalOpen && activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]">
            
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

            <div className="p-6 space-y-6 text-xs font-medium text-zinc-700 overflow-y-auto">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nama Pemohon</span>
                  <span className="text-zinc-900 font-bold text-sm">{activeDetail.namaPemohon}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Unit / Cabang</span>
                  <span className="text-zinc-900 font-bold">{activeDetail.unit}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Tanggal Pengajuan</span>
                  <span>{activeDetail.tanggal} ({activeDetail.jam})</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Status Saat Ini</span>
                  <span className={`font-bold uppercase ${
                    activeDetail.status.toLowerCase() === 'selesai' ? 'text-emerald-600' :
                    activeDetail.status.toLowerCase() === 'ditolak' ? 'text-red-600' : 'text-[#00664b]'
                  }`}>{activeDetail.status}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 mb-3 flex items-center gap-2 text-sm">
                  <CheckSquare size={16} className="text-[#00664b]" /> Daftar Barang (Penyesuaian Admin)
                </h4>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-100 text-[10px] uppercase text-zinc-500 border-b border-zinc-200">
                      <tr>
                        <th className="p-3 w-10 text-center">No</th>
                        <th className="p-3">Nama Barang</th>
                        <th className="p-3 text-center">Prioritas Item</th>
                        <th className="p-3 text-center w-20">Diminta</th>
                        <th className="p-3 text-center w-24">Disetujui Admin</th>
                        <th className="p-3">Alasan / Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {activeDetail.items.map((item, index) => (
                        <tr key={index} className="hover:bg-zinc-50">
                          <td className="p-3 text-center text-zinc-400 font-mono">{index + 1}</td>
                          <td className="p-3 font-bold text-zinc-700">{item.namaBarang}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.prioritas === 'Tinggi' ? 'bg-red-50 text-red-600' :
                              item.prioritas === 'Sedang' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.prioritas}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-zinc-500">{item.jumlahDiminta}</td>
                          <td className="p-3 text-center font-bold text-[#00664b]">{item.jumlahDisetujui ?? item.jumlahDiminta} Unit</td>
                          <td className="p-3 text-zinc-500 italic">{item.remark || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-3 shrink-0">
              {activeDetail.status?.toLowerCase() === 'menunggu manager' ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowBonPreview(true)}
                    className="flex-1 py-2.5 border border-[#00664b] text-[#00664b] bg-white hover:bg-[#e7f0ec] text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Lihat Bon Sementara
                  </button>
                  <button 
                    onClick={() => triggerConfirmation('Selesai', [activeDetail.id])}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00664b] hover:bg-[#004d38] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Check size={16} /> ACC Final (Potong Stok)
                  </button>
                  <button 
                    onClick={() => triggerConfirmation('Ditolak', [activeDetail.id])}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <X size={16} /> Tolak
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-zinc-400 uppercase tracking-wider bg-zinc-200/50 px-3 py-1.5 rounded-lg border border-zinc-200">
                    Status: <span className={activeDetail.status?.toLowerCase() === 'selesai' ? 'text-emerald-600' : 'text-red-600'}>{activeDetail.status}</span>
                  </div>
                  <button 
                    onClick={() => setShowBonPreview(true)}
                    className="px-6 py-2.5 border border-[#00664b] text-[#00664b] bg-white hover:bg-[#e7f0ec] text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Lihat Bon Final
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi ACC/Tolak */}
      {isConfirmOpen && confirmTargets.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 space-y-5 animate-in zoom-in-95 duration-150 text-center relative">
            
            <div className={`mx-auto w-14 h-14 flex items-center justify-center rounded-full border-2 ${confirmType === 'Selesai' ? 'bg-emerald-50 border-[#00664b] text-[#00664b]' : 'bg-red-50 border-red-500 text-red-500'}`}>
              <AlertCircle size={28} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-black text-zinc-900">
                {confirmType === 'Selesai' ? 'Konfirmasi Persetujuan Final' : 'Konfirmasi Penolakan Final'}
              </h4>
              <p className="text-[13px] text-zinc-600 font-medium">
                Apakah anda yakin ingin <span className={`font-bold ${confirmType === 'Selesai' ? 'text-[#00664b]' : 'text-red-500'}`}>
                  {confirmType === 'Selesai' ? 'menyetujui' : 'menolak'}
                </span> <span className="font-bold text-zinc-900">{confirmTargets.length}</span> permintaan terpilih?
              </p>
            </div>

            {confirmType === 'Selesai' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3 text-left">
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                  Tindakan ini bersifat final. Stok barang akan otomatis dipotong dari gudang berdasarkan jumlah yang disetujui.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleFinalAction}
                className={`flex-1 py-2.5 text-white text-[13px] font-bold rounded-xl cursor-pointer shadow-md transition-colors ${
                  confirmType === 'Selesai' ? 'bg-[#00664b] hover:bg-[#004d38]' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Ya, Konfirmasi
              </button>
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-2.5 bg-white border border-zinc-300 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800 text-[13px] font-bold rounded-xl cursor-pointer transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Dokumen Bon */}
      {showBonPreview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-zinc-200 rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[95vh] overflow-hidden relative">
            
            <div className="px-6 py-4 bg-white border-b border-zinc-300 flex justify-between items-center z-20 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800">Preview Bon Barang</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer"><MoreVertical size={20} /></button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-30">
                      <button onClick={handleDownloadPDF} disabled={isExporting} className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-zinc-50 flex items-center gap-2 cursor-pointer">
                        <Download size={14} className="text-[#00664b]" /> {isExporting ? 'Mengunduh...' : 'Download PDF'}
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => { setShowBonPreview(false); setIsMenuOpen(false); }} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg cursor-pointer"><CloseIcon size={20} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-zinc-200">
              <div className="shadow-lg border border-zinc-300 bg-white">
                <TemplateDokumenA4 ref={printRef} formData={mappedFormData} daftarBarang={mappedDaftarBarang} />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}