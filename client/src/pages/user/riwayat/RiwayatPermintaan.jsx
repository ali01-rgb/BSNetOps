import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, XCircle, PackageCheck, Eye, ArrowLeft, FileText, Download, MoreVertical, X as CloseIcon } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import TemplateDokumenA4 from '../permintaan/TemplateDokumenA4'; 
import toast from 'react-hot-toast'; // 🔥 IMPORT TOASTER

export default function RiwayatPermintaan() {
  const printRef = useRef();
  const [laporanRiwayat, setLaporanRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLaporanId, setSelectedLaporanId] = useState(null);

  const [showBonPreview, setShowBonPreview] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch("http://localhost:3000/inventory/my-requests", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Gagal mengambil data riwayat dari server");

      const resJson = await res.json();
      const data = resJson.data || resJson;

      if (Array.isArray(data)) {
        const bobotPrioritas = { 'Tinggi': 3, 'Sedang': 2, 'Rendah': 1 };

        const groupedRequests = data.reduce((acc, curr) => {
          const rawDate = new Date(curr.createdAt || Date.now());
          const tglStr = rawDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
          const jamMenit = rawDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          
          const groupKey = `${tglStr}-${jamMenit}`; 
          
          if (!acc[groupKey]) {
            const padId = String(Object.keys(acc).length + 1).padStart(3, '0');
            const tglFormatId = rawDate.toISOString().slice(0,10).replace(/-/g, '');
            
            acc[groupKey] = {
              id: `REQ-${tglFormatId}-${padId}`, 
              originalId: curr.id,
              tgl: tglStr,
              jam: jamMenit,
              pemohon: 'Anda', 
              unit: '-', 
              statusDb: curr.status,
              isDiserahkan: ['Diserahkan', 'Disetujui', 'Selesai'].includes(curr.status),
              tanggalDiserahkan: '',
              keperluan: curr.alasan || '-',
              prioritasUtama: curr.prioritas || 'Rendah',
              adminName: curr.adminName || '',     
              managerName: curr.managerName || '', 
              items: []
            };
          } else {
            const currentGroupPriority = acc[groupKey].prioritasUtama;
            const newItemPriority = curr.prioritas || 'Rendah';
            if ((bobotPrioritas[newItemPriority] || 1) > (bobotPrioritas[currentGroupPriority] || 1)) {
              acc[groupKey].prioritasUtama = newItemPriority; 
            }
          }

          acc[groupKey].items.push({
            idItem: curr.id,
            barang: curr.nama_aset,
            jumlahDiminta: curr.jumlah,
            jumlahDisetujui: curr.jumlah, 
            prioritasItem: curr.prioritas || 'Rendah',
            statusItem: curr.status,
            remark: curr.alasan || ''
          });

          return acc;
        }, {});

        const formatted = Object.values(groupedRequests).map(group => {
          const allItems = group.items;
          const anyRejected = allItems.some(i => i.statusItem?.toUpperCase() === 'DITOLAK' || i.statusItem?.toUpperCase() === 'REJECTED');
          const allApproved = allItems.every(i => ['SELESAI', 'DISETUJUI', 'APPROVED', 'DITERIMA'].includes(i.statusItem?.toUpperCase()));
          const allReceived = allItems.every(i => i.statusItem?.toUpperCase() === 'DITERIMA');

          let currentStatus = 'Pending';
          if (anyRejected) currentStatus = 'Rejected';
          else if (allReceived) currentStatus = 'Completed';
          else if (allApproved) currentStatus = 'Approved'; 

          return {
            ...group,
            status: currentStatus, 
          };
        });

        formatted.sort((a, b) => b.id.localeCompare(a.id));
        setLaporanRiwayat(formatted);
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat dari database:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTerimaBarang = async (laporanId, itemId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      await fetch(`http://localhost:3000/inventory/requests/${itemId}/receive`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      toast.success('Penerimaan barang berhasil dikonfirmasi!'); // 🔥 TAMBAHAN UX MANIS

      setLaporanRiwayat(prevLaporan =>
        prevLaporan.map(laporan => {
          if (laporan.id === laporanId) {
            const updatedItems = laporan.items.map(item =>
              item.idItem === itemId ? { ...item, statusItem: 'Diterima' } : item
            );
            
            const allDone = updatedItems.every(i => i.statusItem === 'Diterima' || i.statusItem === 'Ditolak');
            
            return {
              ...laporan,
              items: updatedItems,
              status: allDone ? 'Completed' : laporan.status 
            };
          }
          return laporan;
        })
      );
    } catch (error) {
      console.error("Gagal konfirmasi terima barang:", error.message);
      toast.error("Terjadi kesalahan saat mengkonfirmasi penerimaan barang."); // 🔥 GANTI ALERT
    }
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;
    setIsExporting(true);

    const opt = {
      margin:       0,
      filename:     `Bon_Barang_${activeLaporan?.id || 'BSN'}.pdf`,
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

  const activeLaporan = laporanRiwayat.find(l => l.id === selectedLaporanId);

  const mappedFormData = activeLaporan ? {
    divisi: activeLaporan.unit,
    alasanDibutuhkan: activeLaporan.keperluan,
    namaLengkap: activeLaporan.pemohon,
    status: activeLaporan.statusDb,
    adminName: activeLaporan.adminName || 'Admin Gudang',
    managerName: activeLaporan.managerName || 'Manager Operasional',
  } : {};

  const mappedDaftarBarang = activeLaporan ? activeLaporan.items.map(item => ({
    namaAset: item.barang,
    jumlahDiminta: item.jumlahDiminta,
    jumlahDisetujui: item.jumlahDisetujui,
    remark: item.remark
  })) : [];

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-800">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Riwayat Log Permintaan</h2>
        <p className="text-xs text-white font-normal mt-1">
          Pantau status persetujuan berkas permohonan inventaris Anda secara real-time.
        </p>
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {!selectedLaporanId ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-[#58a27d] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">ID Permintaan</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-center">Total Barang</th>
                  <th className="py-3 px-4 text-center">Prioritas</th>
                  <th className="py-3 px-4 text-center">Status Laporan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-zinc-700 divide-y divide-zinc-100">
                {loading ? (
                  <tr><td colSpan="6" className="py-12 text-center text-zinc-400">Memuat riwayat dari database...</td></tr>
                ) : laporanRiwayat.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center text-zinc-400">Belum ada riwayat permintaan ditemukan di database.</td></tr>
                ) : (
                  laporanRiwayat.map((laporan) => (
                    <tr key={laporan.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#00664b] font-mono">{laporan.id}</td>
                      <td className="py-3.5 px-4 text-zinc-600 font-normal">{laporan.tgl}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{laporan.items.length} Item</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          laporan.prioritasUtama === 'Tinggi' ? 'bg-red-50 text-red-600 border-red-200' :
                          laporan.prioritasUtama === 'Sedang' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {laporan.prioritasUtama}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center">
                          {laporan.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                              <Clock size={12} /> Menunggu Proses
                            </span>
                          )}
                          {laporan.status === 'Approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                              <CheckCircle2 size={12} /> ACC Final (Siap Diambil)
                            </span>
                          )}
                          {laporan.status === 'Completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00664b] border border-emerald-100">
                              <PackageCheck size={12} /> Selesai
                            </span>
                          )}
                          {laporan.status === 'Rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                              <XCircle size={12} /> Ditolak
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedLaporanId(laporan.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00664b] text-white hover:bg-[#004d38] text-[10px] font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full bg-white">
            
            <div className="bg-[#58a27d] p-5 rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedLaporanId(null)}
                  className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors cursor-pointer border border-white/10"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2 tracking-wide">
                    <FileText size={18} className="text-white" /> {activeLaporan.id}
                  </h3>
                  <p className="text-xs text-white/80 font-medium mt-0.5">{activeLaporan.tgl} • Permintaan Inventaris</p>
                </div>
              </div>

              <button 
                onClick={() => setShowBonPreview(true)}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 border border-white/20 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2 w-max"
              >
                <FileText size={14} /> Lihat Bon Permintaan
              </button>
            </div>

            <div className="overflow-x-auto p-6 flex-1">
              <h4 className="text-xs font-bold text-zinc-700 mb-4 uppercase tracking-wider">Rincian Barang yang Diajukan</h4>
              <table className="w-full text-left border border-zinc-200 rounded-xl overflow-hidden border-collapse">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-600 text-[11px] font-bold">
                    <th className="py-3 px-4 w-12 text-center border-b border-zinc-200">NO</th>
                    <th className="py-3 px-4 border-b border-zinc-200">NAMA BARANG</th>
                    <th className="py-3 px-4 text-center border-b border-zinc-200">PRIORITAS</th>
                    <th className="py-3 px-4 text-center border-b border-zinc-200">JUMLAH</th>
                    <th className="py-3 px-4 text-center border-b border-zinc-200">STATUS ITEM</th>
                    <th className="py-3 px-4 text-center border-b border-zinc-200">AKSI PENERIMAAN</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-zinc-700 divide-y divide-zinc-100">
                  {activeLaporan.items.map((item, index) => (
                    <tr key={item.idItem} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-4 px-4 text-center text-zinc-400 font-mono">{index + 1}</td>
                      <td className="py-4 px-4 text-zinc-900 capitalize">{item.barang}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                          item.prioritasItem === 'Tinggi' ? 'bg-red-50 text-red-600 border-red-100' :
                          item.prioritasItem === 'Sedang' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {item.prioritasItem}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-[#00664b]">{item.jumlahDiminta} Unit</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          {(item.statusItem === 'Pending' || item.statusItem?.toLowerCase() === 'menunggu manager') && <span className="text-amber-600 font-bold flex items-center gap-1"><Clock size={12}/> Menunggu ACC</span>}
                          {(item.statusItem === 'Approved' || item.statusItem?.toLowerCase() === 'disetujui' || item.statusItem?.toLowerCase() === 'selesai') && <span className="text-blue-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Siap Diambil</span>}
                          {item.statusItem === 'Diterima' && <span className="text-emerald-600 font-bold flex items-center gap-1"><PackageCheck size={12}/> Diterima</span>}
                          {item.statusItem === 'Ditolak' && <span className="text-red-600 font-bold flex items-center gap-1"><XCircle size={12}/> Ditolak</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {(item.statusItem === 'Pending' || item.statusItem?.toLowerCase() === 'menunggu manager') && <span className="text-zinc-400 text-[10px] italic">Menunggu ACC...</span>}
                        {item.statusItem === 'Ditolak' && <span className="text-zinc-400 text-[10px] italic">-</span>}
                        {item.statusItem === 'Diterima' && <span className="text-[#00664b] text-[10px] font-bold">Terverifikasi ✓</span>}
                        {(item.statusItem === 'Approved' || item.statusItem?.toLowerCase() === 'disetujui' || item.statusItem?.toLowerCase() === 'selesai') && (
                          <button
                            onClick={() => handleTerimaBarang(activeLaporan.id, item.idItem)}
                            className="px-3 py-1.5 bg-[#58a27d] hover:bg-[#4a8a69] text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm active:scale-95 cursor-pointer"
                          >
                            Konfirmasi Terima
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showBonPreview && activeLaporan && (
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
                  <CloseIcon size={20} />
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