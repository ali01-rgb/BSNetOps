import html2pdf from 'html2pdf.js';
import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckSquare, X, Check, MoreVertical, Download } from 'lucide-react';
import TemplateDokumenA4 from '../../user/permintaan/TemplateDokumenA4';
import toast from 'react-hot-toast';
import { API_URL } from '@/api';

export default function PenyetujuanBarang() {
  const printRef = useRef();
  const [isExporting, setIsExporting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBonPreview, setShowBonPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequestsFromAPI();
  }, []);

  const getStatusInfo = (status) => {
    const s = (status || '').toUpperCase();
    if (['DISETUJUI', 'SELESAI', 'APPROVED'].includes(s)) {
      return { label: 'Selesai', color: 'bg-emerald-50 text-[#00664b] border-emerald-200' };
    }
    if (['DITOLAK', 'REJECTED'].includes(s)) {
      return { label: 'Ditolak', color: 'bg-red-50 text-red-600 border-red-200' };
    }
    if (['DITERUSKAN', 'FORWARDED', 'MENUNGGU MANAGER'].includes(s)) {
      return { label: 'Menunggu Manager', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Menunggu', color: 'bg-orange-50 text-orange-600 border-orange-200' };
  };

  const fetchRequestsFromAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const [reqRes, assetsRes] = await Promise.all([
        fetch(`${API_URL}/inventory/admin/requests`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/inventory/assets`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!reqRes.ok) throw new Error("Gagal mengambil data permintaan dari server");

      const reqJson = await reqRes.json();
      const assetsJson = await assetsRes.json();

      const rawRequests = reqJson.data || reqJson;
      const allMasterItems = assetsJson.data || assetsJson || [];

      if (Array.isArray(rawRequests)) {
        const groupedData = rawRequests.reduce((acc, curr) => {
          let rawDate = new Date(curr.createdAt || curr.tanggal_dibutuhkan || Date.now());
          if (isNaN(rawDate.getTime())) rawDate = new Date();

          const tglStr = rawDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
          const pemohonName = curr.user?.fullName || curr.user?.username || 'Pemohon BSN';
          const divisiPemohon = curr.user?.divisi || 'KC Semarang';

          const groupKey = `${tglStr}-${curr.userId}`;

          const statusUpper = (curr.status || '').toUpperCase();
          let currentStatus = 'Menunggu';
          if (['DISETUJUI', 'SELESAI', 'APPROVED'].includes(statusUpper)) {
            currentStatus = 'Selesai';
          } else if (['DITOLAK', 'REJECTED'].includes(statusUpper)) {
            currentStatus = 'Ditolak';
          } else if (['DITERUSKAN', 'FORWARDED', 'MENUNGGU MANAGER'].includes(statusUpper)) {
            currentStatus = 'Menunggu Manager';
          } else {
            currentStatus = 'Menunggu';
          }

          if (!acc[groupKey]) {
            const padId = String(Object.keys(acc).length + 1).padStart(3, '0');
            const tglFormatId = rawDate.toISOString().slice(0,10).replace(/-/g, '');
            const prettyId = `REQ-${tglFormatId}-${padId}`;

            acc[groupKey] = {
              id: prettyId,
              pemohon: pemohonName,
              unit: divisiPemohon,
              tanggal: tglStr,
              status: currentStatus,
              rawStatus: curr.status,
              isDiserahkan: currentStatus === 'Menunggu Manager' || currentStatus === 'Selesai',
              tanggalDiserahkan: tglStr,
              keteranganPemohon: curr.alasan || '',
              adminName: curr.adminName || '',
              managerName: curr.managerName || '',
              items: []
            };
          }

          let latestStock = 0;
          if (Array.isArray(allMasterItems)) {
            const matched = allMasterItems.find(a => 
              a.nama_barang && curr.nama_aset &&
              String(a.nama_barang).trim().toLowerCase() === String(curr.nama_aset).trim().toLowerCase()
            );
            if (matched) latestStock = matched.stok || 0;
          }

          const initialDiminta = curr.jumlah || 1;
          const initialDisetujui = Math.min(initialDiminta, latestStock);

          acc[groupKey].items.push({
            idItem: curr.id,
            namaBarang: curr.nama_aset || 'Barang Logistik',
            kodeBarang: curr.no_urut ? `RQ-${String(curr.no_urut).padStart(3,'0')}` : '-',
            stokGudang: latestStock,
            jmlDiminta: initialDiminta,
            jmlDisetujui: curr.jumlah_disetujui ?? initialDisetujui, 
            remark: curr.catatan_admin || curr.alasan || '' 
          });

          return acc;
        }, {});

        const formattedList = Object.values(groupedData);
        formattedList.sort((a, b) => b.id.localeCompare(a.id));
        setRequests(formattedList);
      }
    } catch (error) {
      console.error('Gagal memproses data Admin API:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req =>
    (req.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.pemohon || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.unit || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReview = (req) => {
    setSelectedRequest(JSON.parse(JSON.stringify(req)));
    setIsModalOpen(true);
  };

  const handleQtyChange = (idItem, newQty) => {
    setSelectedRequest((prev) => {
      const updatedItems = prev.items.map(item => {
        if (item.idItem === idItem) {
          let inputVal = parseInt(newQty) || 0;
          const maxAllowed = Math.min(item.jmlDiminta, item.stokGudang);

          if (inputVal > maxAllowed) {
            inputVal = maxAllowed; 
          }

          return { ...item, jmlDisetujui: inputVal };
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
  };

  const handleRemarkChange = (idItem, newRemark) => {
    setSelectedRequest((prev) => {
      const updatedItems = prev.items.map(item => 
        item.idItem === idItem ? { ...item, remark: newRemark } : item
      );
      return { ...prev, items: updatedItems };
    });
  };

  const handleApproveAndHandover = async () => {
    const isInvalid = selectedRequest.items.some(
      item => item.jmlDisetujui > item.stokGudang || item.jmlDisetujui > item.jmlDiminta
    );

    if (isInvalid) {
      toast.error("Gagal: Jumlah yang disetujui tidak boleh melebihi jumlah yang diminta atau stok gudang!");
      return;
    }

    const loadingToast = toast.loading('Menyimpan persetujuan...');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      let hasError = false;

      for (const item of selectedRequest.items) {
        const res = await fetch(`${API_URL}/inventory/admin/requests/${item.idItem}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            status: 'Diteruskan',
            jumlah_disetujui: item.jmlDisetujui,
            catatan_admin: item.remark 
          })
        });

        if (!res.ok) {
          hasError = true;
          const errData = await res.json().catch(() => ({}));
          console.error(`Gagal update item ${item.idItem}:`, errData.message || res.status);
        }
      }

      toast.dismiss(loadingToast);

      if (hasError) {
        toast.error('Sebagian data gagal disimpan ke server. Cek console untuk detail.');
      } else {
        toast.success(`Permintaan ${selectedRequest.id} berhasil disetujui dan diteruskan ke Manager.`);
      }
      
      setIsModalOpen(false);
      setSelectedRequest(null);
      fetchRequestsFromAPI(); 

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Gagal memperbarui status penyerahan:', error.message);
      toast.error('Terjadi kesalahan saat menyimpan ke database.');
    }
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;
    setIsExporting(true);

    const opt = {
      margin:       0,
      filename:     `Bon_Barang_${selectedRequest?.id || 'BSN'}.pdf`,
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

  const loggedInProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  
  const mappedFormData = selectedRequest ? {
    divisi: selectedRequest.unit,
    alasanDibutuhkan: selectedRequest.keteranganPemohon,
    namaLengkap: selectedRequest.pemohon,
    status: selectedRequest.status,
    adminName: selectedRequest.adminName || loggedInProfile.fullName || 'Admin Gudang',
    managerName: selectedRequest.managerName || 'Manager Operasional'
  } : {};

  const mappedDaftarBarang = selectedRequest ? selectedRequest.items.map(item => ({
    namaAset: item.namaBarang,
    jumlahDiminta: item.jmlDiminta,
    jumlahDisetujui: item.jmlDisetujui,
    remark: item.remark
  })) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Penyetujuan & Penyerahan Barang</h2>
          <p className="text-xs text-white/80 mt-0.5">Kelola permintaan masuk, cek ketersediaan stok, dan konfirmasi penyerahan aset.</p>
        </div>
      </div>

      <div className="flex bg-white p-4 rounded-xl shadow-md border border-zinc-200/80">
        <div className="flex-1 relative flex items-center">
          <Search size={18} className="absolute left-3 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID, Pemohon, atau Unit..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b]"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm text-left table-fixed">
          <thead className="bg-[#58a27d] text-white text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 w-[18%]">ID Permintaan</th>
              <th className="p-4 w-[22%]">Pemohon</th>
              <th className="p-4 w-[18%]">Unit</th>
              <th className="p-4 w-[16%]">Tgl Dibutuhkan</th>
              <th className="p-4 w-[14%] text-center">Status</th>
              <th className="p-4 w-[12%] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-zinc-400 text-sm">Memuat data dari database...</td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-zinc-500 text-sm">Tidak ada data permintaan ditemukan</td></tr>
            ) : (
              filteredRequests.map((req) => {
                const statusData = getStatusInfo(req.status);
                return (
                  <tr key={req.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-zinc-900 truncate" title={req.id}>{req.id}</td>
                    <td className="p-4 font-bold text-zinc-800 truncate" title={req.pemohon}>{req.pemohon}</td>
                    <td className="p-4 text-zinc-600 truncate" title={req.unit}>{req.unit}</td>
                    <td className="p-4 text-zinc-600 truncate">{req.tanggal}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider border ${statusData.color}`}>
                        {statusData.label}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center">
                      <button 
                        onClick={() => handleReview(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00664b] text-white hover:bg-[#00553e] rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
                      >
                        <CheckSquare size={14} /> Review / Bon
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Proses Penyetujuan & Penyerahan Barang</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">ID: {selectedRequest.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/50">
              
              <div className="mb-6 bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-zinc-100 pb-2">Informasi Pemohon</h3>
                  <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-y-2 text-sm text-gray-700">
                    <span className="font-medium text-zinc-500">Nama Lengkap</span><span className="font-bold text-zinc-900">: {selectedRequest.pemohon}</span>
                    <span className="font-medium text-zinc-500">Unit / Cabang</span><span>: {selectedRequest.unit}</span>
                    
                    {/* STATUS AKSI: TANPA HIGHLIGHT, WARNA #013F27, TITLE CASE */}
                    <span className="font-medium text-zinc-500">Status Aksi</span>
                    <span>: <span className="ml-1 font-bold text-[#013F27]">{getStatusInfo(selectedRequest.status).label}</span></span>
                    
                    <span className="font-medium text-zinc-500">Keterangan</span><span className="italic text-zinc-600">: {selectedRequest.keteranganPemohon || '-'}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 min-w-[130px]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`Requested by ${selectedRequest.pemohon}`)}`} 
                    alt="QR Pemohon" 
                    className="w-16 h-16 mix-blend-multiply opacity-90"
                  />
                  <span className="text-[10px] text-zinc-700 font-mono mt-1 font-bold truncate max-w-full" title={selectedRequest.pemohon}>
                    {selectedRequest.pemohon}
                  </span>
                </div>

                {selectedRequest.status !== 'Menunggu' && selectedRequest.status !== 'Pending' ? (
                  <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg min-w-[130px] border-emerald-300 bg-emerald-50/50">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`Approved & Handed over by ${mappedFormData.adminName}`)}`} 
                      alt="QR Admin" 
                      className="w-16 h-16 mix-blend-multiply opacity-90"
                    />
                    <span className="text-[10px] text-zinc-700 font-mono mt-1 font-bold">{mappedFormData.adminName}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg min-w-[130px] border-zinc-200 bg-zinc-50/50">
                    <span className="text-[10px] text-zinc-400 font-bold italic">Belum di-ACC Admin</span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-800 mb-3 text-sm">Penyesuaian Barang (Adjustment & Cek Stok Real-Time)</h3>
              
              <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm border-collapse table-fixed">
                  <thead className="bg-[#58a27d] text-white text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-3 w-[30%]">Nama Barang</th>
                      <th className="p-3 w-[15%] text-center">Stok Gudang</th>
                      <th className="p-3 w-[12%] text-center">Diminta</th>
                      <th className="p-3 w-[18%] text-center">Disetujui</th>
                      <th className="p-3 w-[25%]">Catatan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {selectedRequest.items.map((item) => {
                      const isProcessed = selectedRequest.status !== 'Menunggu';
                      return (
                        <tr key={item.idItem} className="hover:bg-zinc-50/40">
                          <td className="p-3 min-w-0">
                            <div className="font-bold text-zinc-800 capitalize truncate cursor-pointer" title={item.namaBarang}>
                              {item.namaBarang}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate" title={item.kodeBarang}>
                              {item.kodeBarang}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md text-xs font-bold border ${item.stokGudang > 0 ? 'bg-[#e7f0ec] text-[#00664b] border-[#00664b]/20' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              {item.stokGudang}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-zinc-600">{item.jmlDiminta}</td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              min="0"
                              max={Math.min(item.jmlDiminta, item.stokGudang)}
                              value={item.jmlDisetujui}
                              disabled={isProcessed}
                              onChange={(e) => handleQtyChange(item.idItem, e.target.value)}
                              className={`w-full px-3 py-1.5 border border-zinc-300 rounded-lg text-sm text-center bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00664b]/40 font-bold text-[#00664b] ${isProcessed ? 'cursor-not-allowed opacity-75' : ''}`}
                            />
                          </td>
                          <td className="p-3">
                            <input 
                              type="text" 
                              placeholder="Alasan penyesuaian..."
                              value={item.remark}
                              disabled={isProcessed}
                              onChange={(e) => handleRemarkChange(item.idItem, e.target.value)}
                              className={`w-full px-3 py-1.5 border border-zinc-300 rounded-lg text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00664b]/40 ${isProcessed ? 'cursor-not-allowed opacity-75' : ''}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 bg-white flex justify-start items-center rounded-b-2xl gap-3">
              <button 
                onClick={() => setShowBonPreview(true)}
                className="px-5 py-2 border border-[#00664b] text-[#00664b] bg-white hover:bg-[#e7f0ec] font-semibold rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
              >
                Lihat Bon Permintaan
              </button>

              {selectedRequest.status === 'Menunggu' && (
                <button 
                  onClick={handleApproveAndHandover}
                  className="px-5 py-2 bg-[#00664b] hover:bg-[#00553e] text-white font-semibold rounded-lg text-sm transition-colors shadow-md flex items-center justify-center cursor-pointer"
                >
                  Setujui & Teruskan ke Manager
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {showBonPreview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-zinc-200 rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[95vh] overflow-hidden relative">
            
            <div className="px-6 py-4 bg-white border-b border-zinc-300 flex justify-between items-center z-20 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800">Preview Bon Barang</h2>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="p-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <button 
                        onClick={handleDownloadPDF} 
                        disabled={isExporting} 
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Download size={14} className="text-[#00664b]" />
                        <span>{isExporting ? 'Mengunduh...' : 'Download PDF'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => { setShowBonPreview(false); setIsMenuOpen(false); }} 
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-zinc-200">
              <div className="shadow-lg border border-zinc-300 bg-white">
                <TemplateDokumenA4 
                  ref={printRef} 
                  formData={mappedFormData} 
                  daftarBarang={mappedDaftarBarang} 
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}