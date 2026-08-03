import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, XCircle, Package, Hash, Download, ArrowDownRight, ArrowUpRight, Calendar, MapPin, Trash2, AlertTriangle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { API_URL } from '@/api';

export default function ActivityLogManager() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');
  
  const [periodType, setPeriodType] = useState('Semua');
  const [selectedMonth, setSelectedMonth] = useState('08'); 
  const [selectedYear, setSelectedYear] = useState('2026');

  // Tracking Download & Modal
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setHasDownloaded(false);
  }, [searchQuery, statusFilter, typeFilter, periodType, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchLogsFromAPI();
  }, []);

  const fetchLogsFromAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const res = await fetch(`${API_URL}/inventory/manager/requests`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;

        if (Array.isArray(data)) {
          const formatted = data.map(req => ({
            id: req.no_urut ? `REQ-${new Date(req.createdAt || Date.now()).toISOString().slice(0,10).replace(/-/g, '')}-${String(req.no_urut).padStart(3, '0')}` : (req.id?.substring(0,8) || 'REQ-XXX'),
            originalId: req.id, // 🔥 ID ASLI DARI DATABASE (UUID)
            requester: req.user?.fullName || req.user?.username || 'user',
            unit: req.user?.divisi || req.unit || 'KC Semarang',
            itemName: req.nama_aset || 'Barang',
            qty: req.jumlah || 1,
            date: req.createdAt || req.tanggal_dibutuhkan || new Date().toISOString(),
            managerStatus: req.status || 'Pending',
            adminStatus: req.status || 'Pending',
            type: 'Keluar' 
          }));
          setHistory(formatted);
        }
      }
    } catch (error) {
      console.error('Gagal memuat log manager:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history
    .filter(item => (statusFilter === 'Semua' ? true : item.managerStatus.toLowerCase() === statusFilter.toLowerCase()))
    .filter(item => (typeFilter === 'Semua' ? true : item.type === typeFilter))
    .filter(item => {
      if (periodType === 'Semua') return true;
      
      const itemDate = new Date(item.date);
      const itemMonth = String(itemDate.getMonth() + 1).padStart(2, '0');
      const itemYear = String(itemDate.getFullYear());

      if (periodType === 'Bulan') {
        return itemMonth === selectedMonth && itemYear === selectedYear;
      } else if (periodType === 'Tahun') {
        return itemYear === selectedYear;
      }
      return true;
    })
    .filter(item =>
      item.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleExport = () => {
    if (filteredHistory.length === 0) {
      toast.error("Tidak ada data untuk di-export!");
      return;
    }

    const dataToExport = filteredHistory.map(item => ({
      "ID Transaksi": item.id,
      "Tipe Transaksi": item.type,
      "Nama Pemohon": item.requester,
      "Unit / KC": item.unit,
      "Nama Barang / Logistik": item.itemName,
      "Jumlah (Unit)": item.qty,
      "Tanggal Transaksi": new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      "Status Manajer": item.managerStatus,
      "Status Logistik": item.adminStatus
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const columnWidths = [
      { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 30 }, 
      { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Logistik");
    XLSX.writeFile(workbook, "Laporan_Activity_Log_BSN.xlsx");

    setHasDownloaded(true);
    toast.success("Laporan berhasil diunduh. Fitur hapus riwayat terbuka.");
  };

  // 🔥 EKSEKUSI HAPUS REAL DI DATABASE NESTJS (PRISMA)
  const handleDeleteHistory = async () => {
    if (filteredHistory.length === 0) {
      toast.error("Tidak ada data untuk dihapus!");
      return;
    }

    const loadingToast = toast.loading("Menghapus riwayat dari database...");

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const idsToDelete = filteredHistory.map(item => item.originalId);

      const res = await fetch(`${API_URL}/inventory/requests/bulk-delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ids: idsToDelete })
      });

      const resJson = await res.json();

      if (res.ok) {
        setHistory(prev => prev.filter(item => !idsToDelete.includes(item.originalId)));
        
        toast.dismiss(loadingToast);
        toast.success(`${filteredHistory.length} data riwayat berhasil dihapus permanen dari database!`);
        
        setIsDeleteModalOpen(false);
        setHasDownloaded(false);
      } else {
        throw new Error(resJson.message || "Gagal menghapus data dari server");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error bulk delete:', error.message);
      toast.error("Gagal menghapus riwayat dari database: " + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statLower = String(status).toLowerCase();
    if (statLower === 'approved' || statLower === 'disetujui' || statLower === 'selesai') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#e7f0ec] text-[#00664b] border border-[#00664b]/20"><CheckCircle2 size={13} /> Selesai</span>;
    } else if (statLower === 'rejected' || statLower === 'ditolak') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-200"><XCircle size={13} /> Ditolak</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200"><Clock size={13} /> {status}</span>;
  };

  const getTypeIcon = (type) => {
    if (type === 'Masuk') {
      return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full ring-4 ring-white shadow-sm"><ArrowDownRight size={20} /></div>;
    }
    return <div className="p-2 bg-red-100 text-red-600 rounded-full ring-4 ring-white shadow-sm"><ArrowUpRight size={20} /></div>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Activity Log & Laporan</h2>
          <p className="text-xs text-white mt-0.5">Pantau arus barang masuk/keluar dan rekapitulasi data logistik BSN</p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 size={16} /> Hapus Riwayat
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-white text-[#00664b] border border-zinc-200 hover:bg-emerald-50 hover:border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download size={16} /> Export Laporan
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md border border-zinc-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative flex items-center">
            <Search size={18} className="absolute left-3 text-zinc-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID request, pemohon, unit KC, atau nama barang..." 
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 text-sm text-zinc-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#00664b] cursor-pointer font-medium"
            >
              <option value="Semua">Semua Transaksi</option>
              <option value="Masuk">Barang Masuk</option>
              <option value="Keluar">Barang Keluar</option>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 text-sm text-zinc-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#00664b] cursor-pointer font-medium"
            >
              <option value="Semua">Semua Status</option>
              <option value="Approved">Approved / Selesai</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected / Ditolak</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-600">
            <Calendar size={16} /> Filter Periode:
          </div>
          
          <select 
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 text-sm text-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00664b] cursor-pointer"
          >
            <option value="Semua">Semua Waktu</option>
            <option value="Bulan">Berdasarkan Bulan</option>
            <option value="Tahun">Berdasarkan Tahun</option>
          </select>

          {periodType === 'Bulan' && (
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00664b] cursor-pointer font-medium"
            >
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          )}

          {(periodType === 'Bulan' || periodType === 'Tahun') && (
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00664b] cursor-pointer font-medium"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400 bg-white rounded-xl shadow-sm border border-zinc-200">
          Memuat data log dari database...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-400 bg-white rounded-xl shadow-sm border border-zinc-200">
          Tidak ditemukan riwayat yang sesuai dengan filter.
        </div>
      ) : (
        filteredHistory.map((item) => (
          <div key={item.id} className="relative mb-4 pl-14 group">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-110 z-10">
              {getTypeIcon(item.type)}
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-all shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-sm text-zinc-700">
                    <span className="font-bold text-zinc-900">{item.requester}</span> 
                    {item.type === 'Masuk' 
                      ? ' mendaftarkan barang masuk/restock berupa ' 
                      : ' melakukan pengambilan barang untuk dikirim ke '}
                    {item.type !== 'Masuk' && (
                      <span className="font-bold text-zinc-900 underline decoration-zinc-300 underline-offset-2 mr-1">
                        {item.unit}
                      </span>
                    )}
                    berupa <span className="font-bold text-[#00664b]">{item.qty} Unit {item.itemName}</span>.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-medium pt-1">
                    <span><Hash size={12} className="inline mr-1 opacity-70" />{item.id}</span>
                    <span><Clock size={12} className="inline mr-1 opacity-70" />{new Date(item.date).toISOString().slice(0,10)}</span>
                    <span className="text-[#00664b] font-bold flex items-center gap-1 bg-[#e7f0ec] px-2 py-0.5 rounded-md">
                      <MapPin size={12} /> {item.unit}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2 sm:self-start shrink-0">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                    item.type === 'Masuk' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    <Package size={13} /> {item.type}
                  </div>
                  {getStatusBadge(item.managerStatus)}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* MODAL KONFIRMASI HAPUS RIWAYAT */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 p-8 text-center animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsDeleteModalOpen(false)} 
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-red-500 rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${!hasDownloaded ? 'bg-amber-100' : 'bg-red-100'}`}>
              <AlertTriangle className={`w-8 h-8 ${!hasDownloaded ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
            
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              {!hasDownloaded ? 'Peringatan Keamanan' : 'Hapus Permanen Riwayat?'}
            </h3>
            
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              {!hasDownloaded ? (
                <>Anda <b>wajib mengunduh (Export Laporan)</b> data ini ke format Excel (XLSX) terlebih dahulu sebelum sistem mengizinkan penghapusan riwayat untuk keperluan audit.</>
              ) : (
                <>Apakah Anda yakin ingin menghapus <b>{filteredHistory.length} riwayat</b> dari database untuk periode {periodType === 'Semua' ? 'Semua Waktu' : periodType === 'Bulan' ? `Bulan ${selectedMonth}-${selectedYear}` : `Tahun ${selectedYear}`}?</>
              )}
            </p>
            
            <div className="flex justify-center gap-3">
              {!hasDownloaded ? (
                <button 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="w-full px-6 py-2.5 text-sm font-semibold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Kembali & Unduh Laporan
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)} 
                    className="flex-1 px-6 py-2.5 text-sm font-semibold text-zinc-600 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleDeleteHistory} 
                    className="flex-1 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Ya, Hapus
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}