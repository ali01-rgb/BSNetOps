import React, { useState, useEffect } from 'react';
import { PlusCircle, Hourglass, Package, CheckCircle2, Circle, ArrowRight, XCircle } from 'lucide-react';
import { API_URL } from '@/api';

export default function UserDashboard({ setCurrentView }) {
  const [lastRequest, setLastRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 TARIK DATA REQUEST TERAKHIR & ASET DARI DATABASE
  useEffect(() => {
    const fetchLastRequest = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        
        // Fetch dua endpoint sekaligus untuk cross-check Kategori
        const [reqRes, assetsRes] = await Promise.all([
          fetch(`${API_URL}/inventory/my-requests`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${API_URL}/inventory/assets`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (reqRes.ok && assetsRes.ok) {
          const resJson = await reqRes.json();
          const dataList = resJson.data || resJson; 
          
          const assetsJson = await assetsRes.json();
          const masterAssets = assetsJson.data || assetsJson || [];

          if (Array.isArray(dataList) && dataList.length > 0) {
            // 🔥 GROUPING DATA (Menyatukan item dalam 1 ID Laporan)
            const groupedRequests = dataList.reduce((acc, curr) => {
              const rawDate = new Date(curr.createdAt || Date.now());
              const tglStr = rawDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
              const jamMenit = rawDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              const groupKey = `${tglStr}-${jamMenit}`; 
              
              if (!acc[groupKey]) {
                const padId = String(Object.keys(acc).length + 1).padStart(3, '0');
                const tglFormatId = rawDate.toISOString().slice(0,10).replace(/-/g, '');
                
                // 1. KATEGORI DINAMIS: Cek ke Master Assets (Apakah masuk Trash/Soft-delete)
                let namaKategori = curr.categoryName || curr.category?.name || curr.category || 'Inventaris Umum';
                const matchedAsset = masterAssets.find(a => a.nama_barang?.toLowerCase() === (curr.nama_aset || '').toLowerCase());
                
                if (matchedAsset && matchedAsset.category) {
                  if (matchedAsset.category.deleted_at || matchedAsset.category.deletedAt) {
                    namaKategori = '-'; 
                  } else {
                    namaKategori = matchedAsset.category.name;
                  }
                }

                acc[groupKey] = {
                  id: `REQ-${tglFormatId}-${padId}`, 
                  category: namaKategori, // Mengambil kategori dari barang pertama yang masuk array
                  createdAt: curr.createdAt || curr.created_at || Date.now(),
                  items: []
                };
              }

              acc[groupKey].items.push({
                nama: curr.nama_aset,
                status: curr.status
              });

              return acc;
            }, {});

            // Ambil laporan yang paling baru
            const formattedList = Object.values(groupedRequests);
            formattedList.sort((a, b) => b.id.localeCompare(a.id));
            const terbaru = formattedList[0];

            // 🔥 LOGIKA FORMAT NAMA ITEM (Hanya menyimpan nilai barangnya saja)
            const firstItemName = terbaru.items[0]?.nama || 'Barang';
            const sisaBarang = terbaru.items.length - 1;
            
            let barangValue = firstItemName;
            if (sisaBarang > 0) {
              barangValue += `, ${sisaBarang} lainnya`;
            }

            // 2. STATUS STEP MAPPING (Mengecek keseluruhan item)
            const anyRejected = terbaru.items.some(i => i.status?.toUpperCase() === 'DITOLAK' || i.status?.toUpperCase() === 'REJECTED');
            const allApproved = terbaru.items.every(i => ['SELESAI', 'DISETUJUI', 'APPROVED', 'DITERIMA'].includes(i.status?.toUpperCase()));
            const anyForwarded = terbaru.items.some(i => ['DITERUSKAN', 'FORWARDED', 'IN_REVIEW', 'PROCESS'].includes(i.status?.toUpperCase()));
            
            let step = 1; 
            if (anyRejected) {
              step = -1;
            } else if (allApproved) {
              step = 3;
            } else if (anyForwarded) {
              step = 2;
            }

            // Set Label Status
            let statusText = 'Pending';
            if (step === -1) statusText = 'Ditolak';
            else if (step === 3) statusText = 'Selesai';
            else if (step === 2) statusText = 'Menunggu Manager';

            setLastRequest({
              id: terbaru.id,
              barangValue: barangValue, // Menyimpan nilai barang
              category: terbaru.category,
              statusText: statusText,
              date: new Date(terbaru.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
              currentStep: step,
              steps: [
                { id: 1, name: 'Permintaan Diajukan', sub: 'Menunggu Validasi Admin' },
                { id: 2, name: 'Persetujuan Manajer', sub: 'Proses Review Manager' },
                { id: 3, name: 'Barang Selesai', sub: 'Siap Digunakan / Diambil' }
              ]
            });
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastRequest();
  }, []);

  const renderStatusBadge = (step, statusText) => {
    if (step === -1) {
      return <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-800 rounded-md">Ditolak</span>;
    }
    if (step === 3) {
      return <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md">Disetujui / Selesai</span>;
    }
    if (step === 2) {
      return <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md">Diteruskan Ke Manager</span>;
    }
    return <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md">Dalam Proses (Pending)</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#00664b] to-[#004d38] p-6 text-white rounded-xl shadow-md border border-[#00553e] transition-all hover:scale-[1.005]">
        <h2 className="text-2xl font-bold">
          Halo, {JSON.parse(localStorage.getItem('userProfile'))?.namaLengkap?.split(" ")[0] || "User"} 👋
        </h2>
        <p className="text-green-100 text-sm mt-1">Mau ambil atau cek inventaris barang apa hari ini? Semangat ya!</p>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3 text-sm tracking-wide uppercase">Aksi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => setCurrentView && setCurrentView('ajukan-permintaan')} className="flex items-center justify-between p-5 bg-white border border-zinc-200 rounded-xl shadow-md hover:border-[#00664b] hover:shadow-lg transition-all group text-left w-full hover:scale-[1.01] cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-[#00664b] group-hover:bg-[#00664b] group-hover:text-white transition-colors rounded-lg"><PlusCircle size={24} /></div>
              <div><p className="font-semibold text-zinc-900">Request Barang</p><p className="text-xs text-zinc-500 mt-0.5">Buat formulir Permintaan baru</p></div>
            </div>
            <ArrowRight size={16} className="text-zinc-400 group-hover:text-[#00664b] group-hover:translate-x-1 transition-all" />
          </button>
          
          <button onClick={() => setCurrentView && setCurrentView('riwayat-permintaan')} className="flex items-center justify-between p-5 bg-white border border-zinc-200 rounded-xl shadow-md hover:border-blue-500 hover:shadow-lg transition-all group text-left w-full hover:scale-[1.01] cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors rounded-lg"><Hourglass size={24} /></div>
              <div><p className="font-semibold text-zinc-900">Progres Request</p><p className="text-xs text-zinc-500 mt-0.5">Pantau persetujuan barang</p></div>
            </div>
            <ArrowRight size={16} className="text-zinc-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </button>

          <button onClick={() => setCurrentView && setCurrentView('aset')} className="flex items-center justify-between p-5 bg-white border border-zinc-200 rounded-xl shadow-md hover:border-amber-500 hover:shadow-lg transition-all group text-left w-full hover:scale-[1.01] cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors rounded-lg"><Package size={24} /></div>
              <div><p className="font-semibold text-zinc-900">Lihat Inventory</p><p className="text-xs text-zinc-500 mt-0.5">Cek ketersediaan semua barang</p></div>
            </div>
            <ArrowRight size={16} className="text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      <div className="bg-white p-6 border border-zinc-200 rounded-xl shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h3 className="font-bold text-zinc-900 text-lg">Permintaan Terakhir Anda</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Memonitor logistik barang secara real-time</p>
          </div>
          {lastRequest && (
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 font-medium rounded-md">
              {lastRequest.date}
            </span>
          )}
        </div>

        {isLoading ? (
          <p className="text-sm text-center text-zinc-500 py-6">⏳ Memuat data...</p>
        ) : lastRequest ? (
          <>
            {/* 🔥 CONTAINER DIKUNCI AGAR TIDAK MELAR KE SAMPING */}
            <div className="mb-6 p-4 bg-zinc-50 border border-zinc-150 rounded-lg flex justify-between items-start md:items-center gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-[17px] font-bold text-zinc-900 leading-tight tracking-tight mb-1 truncate">{lastRequest.id}</p>
                
                {/* 🔥 TEKS BARANG DIBATASI AGAR OTOMATIS JADI (...) JIKA TERLALU PANJANG */}
                <p className="text-[14px] flex items-baseline min-w-0">
                  <span className="text-zinc-500 shrink-0 mr-1.5">Barang :</span>
                  <span className="font-medium text-zinc-700 truncate block" title={lastRequest.barangValue}>
                    {lastRequest.barangValue}
                  </span>
                </p>
                
                <p className="text-[14px] flex items-baseline min-w-0">
                  <span className="text-zinc-500 shrink-0 mr-1.5">Kategori :</span>
                  <span className="font-medium text-zinc-700 truncate block" title={lastRequest.category}>
                    {lastRequest.category}
                  </span>
                </p>
              </div>
              <div className="mt-2 md:mt-0 shrink-0">
                {renderStatusBadge(lastRequest.currentStep, lastRequest.statusText)}
              </div>
            </div>

            {lastRequest.currentStep === -1 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 text-sm flex items-center justify-center gap-2">
                <XCircle size={18} />
                Permintaan ini telah ditolak oleh Admin/Manager. Silakan hubungi admin atau ajukan ulang.
              </div>
            ) : (
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 pt-2">
                {lastRequest.steps.map((step, index) => {
                  const isCompleted = step.id < lastRequest.currentStep || (lastRequest.currentStep === 3 && step.id === 3);
                  const isCurrent = step.id === lastRequest.currentStep && lastRequest.currentStep !== 3;

                  return (
                    <div key={step.id} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 w-full relative">
                      {index < lastRequest.steps.length - 1 && (
                        <div className="hidden md:block absolute top-4 left-[60%] w-[80%] h-0.5 bg-zinc-200 z-0">
                          <div className={`h-full bg-[#00664b] transition-all duration-500 ${step.id < lastRequest.currentStep ? 'w-full' : 'w-0'}`} />
                        </div>
                      )}

                      <div className="z-10 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="text-[#00664b] bg-white rounded-full" size={26} />
                        ) : isCurrent ? (
                          <div className="w-6 h-6 rounded-full border-4 border-[#00664b] bg-white animate-pulse" />
                        ) : (
                          <Circle className="text-zinc-300 bg-white rounded-full" size={24} />
                        )}
                      </div>

                      <div className="text-left md:text-center">
                        <p className={`text-sm font-medium ${isCurrent ? 'text-[#00664b] font-semibold' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>
                          {step.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 md:mt-0.5">
                          {isCurrent ? step.sub : isCompleted ? 'Selesai' : 'Belum'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-center text-zinc-500 py-6">Belum ada riwayat permintaan barang.</p>
        )}
      </div>
    </div>
  );
}