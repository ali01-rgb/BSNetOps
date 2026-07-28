import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, XCircle, Activity, Package, Hash, Download, ArrowDownRight, ArrowUpRight, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ActivityLog() {
  // 🔥 PASTIKAN STATE AWALNYA [] (KOSONG), BUKAN INITIAL DATA DUMMY
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Filters bawaan UI lu
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');
  
  const [periodType, setPeriodType] = useState('Semua');
  const [selectedMonth, setSelectedMonth] = useState('07'); // Default ke bulan saat ini
  const [selectedYear, setSelectedYear] = useState('2026');

  // 🔥 FETCH DATA DARI NESTJS API
  useEffect(() => {
    fetchLogsFromAPI();
  }, []);

  const fetchLogsFromAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      // Karena NestJS lu gak punya tabel Log khusus, kita ambil history dari tabel Requests
      const res = await fetch("http://localhost:3000/inventory/admin/requests", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;

        if (Array.isArray(data)) {
          // Mapping data Prisma Request ke format UI LogAktifitas
          const formatted = data.map(req => ({
            id: req.no_urut ? `RQ-${String(req.no_urut).padStart(3, '0')}` : (req.id?.substring(0,8) || 'REQ-XXX'),
            requester: req.user?.fullName || req.user?.username || 'User BSN',
            itemName: req.nama_aset || 'Barang',
            qty: req.jumlah || 1,
            date: req.createdAt || req.tanggal_dibutuhkan || new Date().toISOString(),
            managerStatus: req.status || 'Pending',
            adminStatus: req.status || 'Pending',
            // Karena ini dari tabel request, otomatis kita anggap sbg barang 'Keluar'
            type: 'Keluar' 
          }));
          setHistory(formatted);
        }
      }
    } catch (error) {
      console.error('Gagal memuat log:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FILTERING JALAN DI CLIENT-SIDE
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
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleExport = () => {
    const dataToExport = filteredHistory.map(item => ({
      "ID Transaksi": item.id,
      "Tipe Transaksi": item.type,
      "Nama Pemohon": item.requester,
      "Nama Barang / Logistik": item.itemName,
      "Jumlah (Unit)": item.qty,
      "Tanggal Transaksi": new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      "Status Manajer": item.managerStatus,
      "Status Logistik": item.adminStatus
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const columnWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, 
      { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Logistik");
    XLSX.writeFile(workbook, "Laporan_Activity_Log_BSN.xlsx");
  };

  const getStatusBadge = (status) => {
    const statLower = String(status).toLowerCase();
    if (statLower === 'approved' || statLower === 'disetujui' || statLower === 'selesai') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={14} /> Approved</span>;
    } else if (statLower === 'rejected' || statLower === 'ditolak') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200"><XCircle size={14} /> Rejected</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock size={14} /> {status}</span>;
  };

  const getTypeIcon = (type) => {
    if (type === 'Masuk') {
      return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full ring-4 ring-white shadow-sm"><ArrowDownRight size={20} /></div>;
    }
    return <div className="p-2 bg-red-100 text-[#FF0000] rounded-full ring-4 ring-white shadow-sm"><ArrowUpRight size={20} /></div>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border border-zinc-200 text-[#00664b] rounded-xl shadow-md">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Activity Log & Laporan</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Pantau arus barang masuk/keluar dan rekapitulasi data logistik BSN</p>
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 bg-white text-[#00664b] border border-zinc-200 hover:bg-emerald-50 hover:border-emerald-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <Download size={16} /> Export Laporan
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md border border-zinc-200/80 space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative flex items-center">
            <Search size={18} className="absolute left-3 text-zinc-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID request, nama pemohon, atau nama barang..." 
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
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
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
                
                <div className="space-y-1">
                  <p className="text-sm text-zinc-700">
                    <span className="font-bold text-zinc-900">{item.requester}</span> 
                    {item.type === 'Masuk' ? ' mendaftarkan barang masuk/restock ke dalam inventaris berupa ' : ' mengajukan permohonan peminjaman inventaris berupa '}
                    <span className="font-semibold text-[#00664b]">{item.qty} Unit {item.itemName}</span>.
                  </p>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span><Hash size={12} className="inline mr-1" />{item.id}</span>
                    <span><Clock size={12} className="inline mr-1" />{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2 sm:self-start">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${
                    item.type === 'Masuk' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <Package size={14} /> {item.type}
                  </div>
                  {getStatusBadge(item.managerStatus)}
                </div>

              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}