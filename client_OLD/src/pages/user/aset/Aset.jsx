import React, { useState } from 'react';
import { Search, Filter, Calendar, Package, X, CalendarDays } from 'lucide-react';

export default function Aset() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [requestForm, setRequestForm] = useState({ tanggal: '', jumlah: '' });

  // Data Dummy Katalog Aset (Sesuai kode B501 kertas hvs a4 di mockup kamu)
  const katalogAset = [
    { 
      id: 1, 
      nama: 'kertas hvs a4', 
      kode: 'B501', 
      stok: '30 Box', 
      tglUpdate: '1 juli 2026',
      gambar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrgzTKV1WSHGEP44GQCR1AE5UpfIgY43Fw_kvJeRCnyg&s=10'
    },
    { 
      id: 2, 
      nama: 'ballpoint hitam gell', 
      kode: 'B502', 
      stok: '120 Pcs', 
      tglUpdate: '2 juli 2026',
      gambar: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=400&auto=format&fit=crop'
    },
    { 
      id: 3, 
      nama: 'stapler besar', 
      kode: 'B503', 
      stok: '15 Unit', 
      tglUpdate: '1 juli 2026',
      gambar: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400&auto=format&fit=crop'
    }
  ];

  const filteredAset = katalogAset.filter(aset =>
    aset.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (aset) => {
    setSelectedAsset(aset);
    setRequestForm({ tanggal: '', jumlah: '' });
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    alert(`Permintaan ${selectedAsset.nama} sejumlah ${requestForm.jumlah} berhasil diajukan!`);
    setSelectedAsset(null);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-400 min-h-screen text-zinc-800 pb-12">
      
      {/* KONTROL ATAS: Search Bar & Filter */}
      <div className="flex items-center justify-between gap-4 w-full pt-2">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-zinc-300 rounded-full focus:outline-none focus:border-[#00664b] transition-all"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 shadow-sm transition-all">
          <span>Filter</span>
          <Filter size={14} className="opacity-70" />
        </button>
      </div>

      {/* AREA GRID KATALOG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredAset.map((aset) => (
          <div 
            key={aset.id}
            onClick={() => handleOpenModal(aset)}
            className="bg-white border border-zinc-200/80 rounded-3xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.01] select-none"
          >
            {/* Kiri: Gambar */}
            <div className="w-28 h-28 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center p-2 shrink-0 overflow-hidden">
              <img src={aset.gambar} alt={aset.nama} className="w-full h-full object-contain mix-blend-multiply" />
            </div>

            {/* Kanan: Info metadata */}
            <div className="flex flex-col justify-between flex-1 py-1">
              <div>
                <h3 className="font-extrabold text-sm capitalize text-zinc-900 border-b border-zinc-900 pb-1 tracking-tight">
                  {aset.nama}
                </h3>
                <div className="mt-2.5 space-y-1.5 text-[11px] font-bold text-zinc-700">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={13} className="text-zinc-500" />
                    <span className="text-zinc-400 font-normal">|</span>
                    <span>{aset.tglUpdate}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Package size={13} className="text-zinc-500" />
                    <span className="text-zinc-400 font-normal">|</span>
                    <span>{aset.stok}</span>
                  </div>
                </div>
              </div>
              <div className="inline-block self-start text-[11px] font-bold px-3 py-0.5 border border-emerald-600/40 text-[#00664b] bg-emerald-50/30 rounded-full mt-2">
                {aset.kode}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL POP-UP DETAIL DENGAN EFFEK BACKDROP BLUR */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/30 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-xl w-full p-6 relative flex gap-6 animate-in zoom-in-95 duration-200">
            
            <button onClick={() => setSelectedAsset(null)} className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 text-zinc-700">
              <X size={16} />
            </button>

            {/* Kiri Modal: Display Gambar & Kode */}
            <div className="w-44 flex flex-col items-center justify-center gap-4 shrink-0">
              <div className="w-full h-40 rounded-2xl bg-zinc-50/50 border border-zinc-100 flex items-center justify-center p-3">
                <img src={selectedAsset.gambar} alt={selectedAsset.nama} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="w-full text-center py-1 border border-emerald-600/40 text-[#00664b] font-bold text-xs bg-white rounded-full">
                {selectedAsset.kode}
              </div>
            </div>

            {/* Kanan Modal: Form Request */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 className="font-extrabold text-xl capitalize text-zinc-900 border-b border-zinc-900 pb-1.5 tracking-tight">
                  {selectedAsset.nama}
                </h3>

                <form onSubmit={handleSubmitRequest} className="mt-5 space-y-3">
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-zinc-600 z-10"><CalendarDays size={16} /></div>
                    <input 
                      type="date"
                      required
                      value={requestForm.tanggal}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, tanggal: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 text-xs font-semibold bg-zinc-200/60 border border-transparent rounded-none text-zinc-700 focus:outline-none"
                    />
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-zinc-600 z-10"><Package size={16} /></div>
                    <input 
                      type="number"
                      min="1"
                      required
                      placeholder="Jumlah Stok"
                      value={requestForm.jumlah}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, jumlah: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 text-xs font-semibold bg-zinc-200/60 border border-transparent rounded-none text-zinc-700 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 pt-4">
                    <button type="submit" className="w-full py-2.5 bg-[#005c42] hover:bg-[#00422f] text-white font-bold text-xs rounded-full cursor-pointer">
                      Ajukan Permintaan
                    </button>
                    <button type="button" onClick={() => setSelectedAsset(null)} className="w-full py-2.5 bg-white border border-red-400 text-red-500 font-bold text-xs rounded-full hover:bg-red-50 cursor-pointer">
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}