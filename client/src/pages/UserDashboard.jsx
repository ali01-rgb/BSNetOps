import React, { useState, useEffect } from 'react';
import { PlusCircle, Hourglass, Package, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export default function UserDashboard({ setCurrentView }) {
  const [lastRequest, setLastRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 TARIK DATA REQUEST TERAKHIR DARI DATABASE
  useEffect(() => {
    const fetchLastRequest = async () => {
      try {
        // Ambil token pintar (dukung token atau access_token)
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const res = await fetch("http://localhost:3000/inventory/my-requests", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const resJson = await res.json();
          // FIX: Ambil array dari dalam properti 'data' kiriman NestJS
          const dataList = resJson.data || resJson; 

          if (Array.isArray(dataList) && dataList.length > 0) {
            // Ambil index ke 0 (paling atas/terbaru)
            const terbaru = dataList[0]; 
            
            // FIX: Sesuaikan dengan schema Prisma (langsung baca nama_aset)
            const namaItem = terbaru.nama_aset || "Permintaan Barang";

            // Konversi status Database ke angka Step (1, 2, atau 3)
            let step = 1; // Default: PENDING / Diajukan
            const statusUpper = (terbaru.status || '').toUpperCase();
            if (statusUpper === 'APPROVED') step = 2;
            if (statusUpper === 'READY' || statusUpper === 'RECEIVED') step = 3; 

            setLastRequest({
              item: namaItem,
              category: 'Permintaan Inventaris',
              date: new Date(terbaru.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
              currentStep: step,
              steps: [
                { id: 1, name: 'Permintaan Diajukan' },
                { id: 2, name: 'Persetujuan Manajer' },
                { id: 3, name: 'Barang Selesai' }
              ]
            });
          }
        }
      } catch (err) {
        console.error("Gagal mengambil dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastRequest();
  }, []);

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

      {/* LACAK PROSES TERAKHIR */}
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
            <div className="mb-6 p-4 bg-zinc-50 border border-zinc-150 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{lastRequest.item}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Kategori: {lastRequest.category}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md">
                Dalam Proses
              </span>
            </div>

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 pt-2">
              {lastRequest.steps.map((step, index) => {
                const isCompleted = step.id < lastRequest.currentStep;
                const isCurrent = step.id === lastRequest.currentStep;
                return (
                  <div key={step.id} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 w-full relative">
                    {index < lastRequest.steps.length - 1 && (
                      <div className="hidden md:block absolute top-4 left-[60%] w-[80%] h-0.5 bg-zinc-200 z-0">
                        <div className={`h-full bg-[#00664b] transition-all duration-500 ${step.id < lastRequest.currentStep ? 'w-full' : 'w-0'}`} />
                      </div>
                    )}
                    <div className="z-10 shrink-0">
                      {isCompleted ? <CheckCircle2 className="text-[#00664b] bg-white rounded-full" size={26} />
                        : isCurrent ? <div className="w-6 h-6 rounded-full border-4 border-[#00664b] bg-white animate-pulse" />
                        : <Circle className="text-zinc-300 bg-white rounded-full" size={24} />}
                    </div>
                    <div className="text-left md:text-center">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-[#00664b] font-semibold' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>{step.name}</p>
                      {isCurrent && <p className="text-[10px] text-zinc-500 md:mt-0.5">Sedang direview</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-sm text-center text-zinc-500 py-6">Belum ada riwayat permintaan barang.</p>
        )}
      </div>
    </div>
  );
}