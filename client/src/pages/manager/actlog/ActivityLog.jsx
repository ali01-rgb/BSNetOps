import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, Package, Hash, Download, ArrowDownRight, ArrowUpRight, Calendar, MapPin, Trash2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/api';

// 🔥 IMPORT HELPER EXCELJS
import { generateLaporanActivityLog } from '@/Laporan/ExportLaporan';
import { exportLaporanOpnameStyled } from '@/Laporan/LaporanOpname';

export default function ActivityLogManager() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inisialisasi Tanggal & Tahun Dinamis
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  // Definisi Array Bulan & Tahun
  const yearRange = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
    { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  // State Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');
  
  const [periodType, setPeriodType] = useState('Semua');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); 
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // Tracking Download & Modal Hapus
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Reset status download jika filter diubah
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
      
      const [reqRes, assetsRes] = await Promise.all([
        fetch(`${API_URL}/inventory/manager/requests`, { headers: { "Authorization": `Bearer ${token}` } })
          .then(res => res.ok ? res : fetch(`${API_URL}/inventory/admin/requests`, { headers: { "Authorization": `Bearer ${token}` } })),
        fetch(`${API_URL}/inventory/assets`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      let combinedLogs = [];

      // 1. FORMAT DATA REQUESTS (BARANG KELUAR)
      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        const reqData = reqJson.data || reqJson;

        if (Array.isArray(reqData)) {
          reqData.forEach((req, index) => {
            const stat = (req.status || '').toUpperCase();
            if (['DITOLAK', 'REJECTED'].includes(stat)) return;

            let rawDate = new Date(req.createdAt || req.tanggal_dibutuhkan || Date.now());
            if (isNaN(rawDate.getTime())) rawDate = new Date();

            let currentStatus = 'Menunggu';
            if (['DISETUJUI', 'SELESAI', 'APPROVED', 'DITERIMA'].includes(stat)) {
              currentStatus = 'Selesai';
            }

            const padId = String(req.no_urut || index + 1).padStart(3, '0');
            const tglFormatId = rawDate.toISOString().slice(0,10).replace(/-/g, '');
            const prettyId = `REQ-${tglFormatId}-${padId}`;

            combinedLogs.push({
              id: prettyId,
              originalId: req.id, 
              requester: req.user?.fullName || req.user?.username || 'Pemohon',
              unit: req.user?.divisi || req.unit || 'KC Semarang',
              itemName: req.nama_aset || 'Barang',
              qty: req.jumlah || 1,
              date: rawDate.toISOString(),
              managerStatus: currentStatus,
              adminStatus: currentStatus,
              type: 'Keluar' 
            });
          });
        }
      }

      // 2. FORMAT DATA ASSETS (BARANG MASUK)
      if (assetsRes.ok) {
        const astJson = await assetsRes.json();
        const astData = astJson.data || astJson;

        if (Array.isArray(astData)) {
          astData.forEach((ast) => {
            let rawDate = new Date(ast.createdAt || ast.updatedAt || Date.now());
            if (isNaN(rawDate.getTime())) rawDate = new Date();

            combinedLogs.push({
              id: ast.kode_barang || ast.id || 'AST-NEW',
              originalId: ast.id,
              requester: 'Admin Gudang',
              unit: 'Gudang Utama',
              itemName: ast.nama_barang || ast.nama_aset || 'Barang Baru',
              qty: ast.stok ?? ast.stock ?? 0,
              date: rawDate.toISOString(),
              managerStatus: 'Selesai', 
              adminStatus: 'Selesai',
              type: 'Masuk'
            });
          });
        }
      }

      combinedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(combinedLogs);

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
      if (isNaN(itemDate.getTime())) return true;

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
      (item.requester || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.unit || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemName || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.id || '').toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

  // 🔥 1. EXPORT LAPORAN ACTIVITY LOG
  const handleExport = async () => {
    if (filteredHistory.length === 0) {
      toast.error("Tidak ada data untuk di-export!");
      return;
    }

    const toastId = toast.loading("Menyiapkan Laporan Log Aktivitas...");

    const dataToExport = filteredHistory.map(item => ({
      "ID Transaksi": item.id,
      "Tipe Transaksi": item.type,
      "Nama Pemohon": item.requester,
      "Unit / KC": item.unit,
      "Nama Barang / Logistik": item.itemName,
      "Jumlah (Unit)": item.qty,
      "Tanggal Transaksi": new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      "Status": item.managerStatus
    }));

    let namaPeriode = 'Semua_Waktu';
    if (periodType === 'Bulan') {
      namaPeriode = `Bulan_${selectedMonth}_${selectedYear}`;
    } else if (periodType === 'Tahun') {
      namaPeriode = `Tahun_${selectedYear}`;
    }

    try {
      await generateLaporanActivityLog(dataToExport, namaPeriode, toastId);
      setHasDownloaded(true);
    } catch (error) {
      console.error(error);
      setHasDownloaded(false);
    }
  };

  // 🔥 2. EXPORT LAPORAN OPNAME (REAL-TIME HITUNG MUTASI BARANG KELUAR)
  const handleExportOpname = async () => {
    const loadingToast = toast.loading("Menghitung data mutasi stok & menyiapkan Laporan Opname...");
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      // Ambil data aset & data request secara bersamaan
      const [assetsRes, reqRes] = await Promise.all([
        fetch(`${API_URL}/inventory/assets`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/inventory/manager/requests`, { headers: { "Authorization": `Bearer ${token}` } })
          .then(res => res.ok ? res : fetch(`${API_URL}/inventory/admin/requests`, { headers: { "Authorization": `Bearer ${token}` } }))
      ]);

      if (!assetsRes.ok) throw new Error("Gagal mengambil data aset/stok");

      const assetsJson = await assetsRes.json();
      const rawAssets = assetsJson.data || assetsJson || [];

      let rawRequests = [];
      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        rawRequests = reqJson.data || reqJson || [];
      }

      // Filter request yang sudah disetujui pada periode yang dipilih
      const approvedRequestsInPeriod = rawRequests.filter(req => {
        const stat = (req.status || '').toUpperCase();
        const isApproved = ['DISETUJUI', 'SELESAI', 'APPROVED', 'DITERIMA'].includes(stat);
        if (!isApproved) return false;

        if (periodType === 'Semua') return true;

        const reqDate = new Date(req.createdAt || req.tanggal_dibutuhkan || Date.now());
        if (isNaN(reqDate.getTime())) return true;

        const reqMonth = String(reqDate.getMonth() + 1).padStart(2, '0');
        const reqYear = String(reqDate.getFullYear());

        if (periodType === 'Bulan') {
          return reqMonth === selectedMonth && reqYear === selectedYear;
        } else if (periodType === 'Tahun') {
          return reqYear === selectedYear;
        }
        return true;
      });

      // Akumulasi total barang keluar berdasarkan nama barang
      const barangKeluarMap = {};
      approvedRequestsInPeriod.forEach(req => {
        const nama = (req.nama_aset || req.nama_barang || '').trim().toLowerCase();
        const qty = Number(req.jumlah_disetujui ?? req.jumlah ?? 0) || 0;
        barangKeluarMap[nama] = (barangKeluarMap[nama] || 0) + qty;
      });

      // Filter master aset berdasarkan query pencarian
      let filteredAssets = rawAssets.filter(item => !item.deleted_at).filter(item => {
        const name = item.nama_barang || item.nama_aset || item.name || '';
        const kode = item.kode_barang || item.id || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               kode.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });

      if (filteredAssets.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Tidak ada data stok yang sesuai dengan pencarian.");
        return;
      }

      // Hitung: Stok Awal = Stok Akhir + Barang Keluar - Barang Masuk
      const dataToExport = filteredAssets.map(item => {
        const namaBarang = item.nama_barang || item.nama_aset || item.name || '-';
        const namaKey = namaBarang.trim().toLowerCase();

        const stokAkhirSaatIni = Number(item.stok ?? item.stock ?? 0) || 0;
        const totalKeluar = barangKeluarMap[namaKey] || 0;
        const totalMasuk = 0; 
        const stokAwal = stokAkhirSaatIni + totalKeluar - totalMasuk;

        return {
          kodeBarang: item.kode_barang || '-',
          namaBarang: namaBarang,
          kategori: item.category?.name || item.kategori || '-',
          stokAwal: stokAwal,
          barangMasuk: totalMasuk,
          barangKeluar: totalKeluar,
          stokAkhir: stokAkhirSaatIni
        };
      });

      let namaPeriode = 'Semua_Waktu';
      if (periodType === 'Bulan') {
        namaPeriode = `Bulan_${selectedMonth}_${selectedYear}`;
      } else if (periodType === 'Tahun') {
        namaPeriode = `Tahun_${selectedYear}`;
      }

      const fileName = `Laporan_Opname_Stok_${namaPeriode}.xlsx`;
      
      await exportLaporanOpnameStyled(dataToExport, fileName);
      toast.dismiss(loadingToast);
      toast.success("Laporan Opname berhasil diunduh.");

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Gagal mengunduh Laporan Opname: " + error.message);
      console.error(error);
    }
  };

  // 🔥 3. HAPUS RIWAYAT (HANYA MENGHAPUS LOG TRANSAKSI REQUEST)
  const handleDeleteHistory = async () => {
    if (filteredHistory.length === 0) {
      toast.error("Tidak ada data untuk dihapus!");
      return;
    }

    const loadingToast = toast.loading("Menghapus riwayat dari database...");

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      // Hanya menghapus ID request (barang keluar), master aset aman
      const idsToDelete = filteredHistory
        .filter(item => item.type === 'Keluar')
        .map(item => item.originalId);

      if (idsToDelete.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Tidak ada riwayat transaksi pengeluaran yang dapat dihapus.");
        return;
      }

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
        toast.success(`${idsToDelete.length} data riwayat berhasil dihapus permanen dari database!`);
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
    if (statLower === 'selesai' || statLower === 'approved' || statLower === 'disetujui') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#e7f0ec] text-[#00664b] border border-[#00664b]/20"><CheckCircle2 size={13} /> Selesai</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200"><Clock size={13} /> Menunggu</span>;
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
            title="Hapus Riwayat"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center justify-center p-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 size={20} />
          </button>
          <button 
            onClick={handleExportOpname}
            className="flex items-center justify-center gap-2 bg-white text-zinc-700 border border-zinc-200 hover:bg-emerald-50 hover:text-[#00664b] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download size={16} /> Laporan Opname
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-white text-[#00664b] border border-zinc-200 hover:bg-emerald-50 hover:border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download size={16} /> Export Laporan
          </button>
        </div>
      </div>

      {/* FILTER BOX */}
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
              <option value="Selesai">Selesai</option>
              <option value="Menunggu">Menunggu</option>
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

          {/* DROPDOWN BULAN */}
          {periodType === 'Bulan' && (
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00664b] cursor-pointer font-medium"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}

          {/* DROPDOWN TAHUN */}
          {(periodType === 'Bulan' || periodType === 'Tahun') && (
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00664b] cursor-pointer font-medium"
            >
              {yearRange.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* LIST DATA */}
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
                <div className="space-y-1.5 min-w-0">
                  <p className="text-sm text-zinc-700 leading-relaxed break-words">
                    <span className="font-bold text-zinc-900">{item.requester}</span> 
                    {item.type === 'Masuk' 
                      ? ' mendaftarkan barang masuk/restock berupa ' 
                      : ' melakukan pengambilan barang untuk dikirim ke '}
                    {item.type !== 'Masuk' && (
                      <span className="font-bold text-zinc-900 mr-1">
                        {item.unit}
                      </span>
                    )}
                    berupa <span className="font-bold text-[#00664b] break-all">{item.qty} Unit {item.itemName}</span>.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-medium pt-1">
                    <span><Hash size={12} className="inline mr-1 opacity-70" />{item.id}</span>
                    <span><Clock size={12} className="inline mr-1 opacity-70" />{new Date(item.date).toISOString().slice(0,10)}</span>
                    <span className="text-zinc-500 font-medium flex items-center gap-1">
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
                <>Anda <b>wajib mengunduh (Export Laporan & Laporan Opname)</b> data ini ke format Excel (XLSX) terlebih dahulu sebelum sistem mengizinkan penghapusan riwayat untuk keperluan audit.</>
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