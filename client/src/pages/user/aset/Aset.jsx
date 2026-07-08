import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Calendar, Package, X, Check } from 'lucide-react';

// REVISI: Menerima setCurrentView dari props App.jsx
export default function Aset({ setCurrentView }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // STATE FILTER
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua'); 
  const [filterType, setFilterType] = useState('Default'); // 'Default' atau 'Kategori'
  
  const filterMenuRef = useRef(null);

  // Auto close dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Data Dummy Katalog Aset
  const katalogAset = [
    { 
      id: 1, 
      nama: 'kertas hvs a4', 
      kode: 'B501', 
      kategori: 'ATK',
      stok: '30 Box', 
      tglUpdate: '1 juli 2026',
      gambar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrgzTKV1WSHGEP44GQCR1AE5UpfIgY43Fw_kvJeRCnyg&s=10'
    },
    { 
      id: 2, 
      nama: 'ballpoint hitam gell', 
      kode: 'B502', 
      kategori: 'ATK',
      stok: '120 Pcs', 
      tglUpdate: '2 juli 2026',
      gambar: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=400&auto=format&fit=crop'
    },
    { 
      id: 3, 
      nama: 'proyektor epsom', 
      kode: 'E101', 
      kategori: 'Elektronik',
      stok: '5 Unit', 
      tglUpdate: '3 juli 2026',
      gambar: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=400&auto=format&fit=crop'
    }
  ];

  // LOGIKA FILTERING
  const filteredAset = katalogAset.filter(aset => {
    const matchesSearch = aset.nama.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'Default') {
      return matchesSearch;
    } else {
      return matchesSearch && (activeCategory === 'Semua' || aset.kategori === activeCategory);
    }
  });

  const handleOpenModal = (aset) => {
    setSelectedAsset(aset);
  };

  // REVISI: Mengubah view dashboard dan menyimpan data sementara ke localStorage
  const handleRedirectToForm = () => {
    if (selectedAsset) {
      localStorage.setItem('selectedAssetData', JSON.stringify({
        namaAset: selectedAsset.nama,
        kodeAset: selectedAsset.kode
      }));

      // Arahkan view dashboard internal ke halaman form
      setCurrentView('ajukan-permintaan');
    }
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

        <div className="relative" ref={filterMenuRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              isFilterOpen || filterType !== 'Default' 
                ? 'bg-emerald-50 border-[#00664b] text-[#00664b]' 
                : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <span>Filter{filterType !== 'Default' ? `: ${activeCategory}` : ''}</span>
            <Filter size={14} className="opacity-70" />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl z-30 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 mb-1.5">
                Opsi Filter
              </div>

              <button
                onClick={() => {
                  setFilterType('Default');
                  setActiveCategory('Semua');
                  setIsFilterOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 text-left text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <span className={filterType === 'Default' ? 'text-[#00664b]' : 'text-zinc-700'}>
                  By Default (Semua)
                </span>
                {filterType === 'Default' && <Check size={14} className="text-[#00664b]" />}
              </button>

              <hr className="border-zinc-100 my-1.5" />

              <div className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  By Kategori
                </div>
                
                {['ATK', 'Elektronik'].map((kat) => (
                  <button
                    key={kat}
                    onClick={() => {
                      setFilterType('Kategori');
                      setActiveCategory(kat);
                      setIsFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between pl-4 pr-2.5 py-1.5 text-left text-xs font-medium rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
                  >
                    <span className={filterType === 'Kategori' && activeCategory === kat ? 'text-[#00664b] font-bold' : ''}>
                      {kat}
                    </span>
                    {filterType === 'Kategori' && activeCategory === kat && (
                      <Check size={12} className="text-[#00664b]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AREA GRID KATALOG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredAset.map((aset) => (
          <div 
            key={aset.id}
            onClick={() => handleOpenModal(aset)}
            className="bg-white border border-zinc-200/80 rounded-3xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.01] select-none"
          >
            <div className="w-28 h-28 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center p-2 shrink-0 overflow-hidden">
              <img src={aset.gambar} alt={aset.nama} className="w-full h-full object-contain mix-blend-multiply" />
            </div>

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

      {/* MODAL DETAIL POP-UP */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/30 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-xl w-full p-6 relative flex gap-6 animate-in zoom-in-95 duration-200">
            
            <button onClick={() => setSelectedAsset(null)} className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100">
              <X size={16} />
            </button>

            <div className="w-44 flex flex-col items-center justify-center gap-4 shrink-0">
              <div className="w-full h-40 rounded-2xl bg-zinc-50/50 border border-zinc-100 flex items-center justify-center p-3">
                <img src={selectedAsset.gambar} alt={selectedAsset.nama} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="w-full text-center py-1 border border-emerald-600/40 text-[#00664b] font-bold text-xs bg-white rounded-full">
                {selectedAsset.kode}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 className="font-extrabold text-xl capitalize text-zinc-900 border-b border-zinc-900 pb-1.5 tracking-tight">
                  {selectedAsset.nama}
                </h3>

                <div className="mt-6 space-y-3">
                  <p className="text-xs text-zinc-500 font-medium">
                    Apakah Anda ingin mengajukan pinjaman keperluan untuk aset inventaris ini?
                  </p>

                  <div className="space-y-2 pt-6">
                    <button 
                      type="button" 
                      onClick={handleRedirectToForm} 
                      className="w-full py-2.5 bg-[#005c42] hover:bg-[#00422f] text-white font-bold text-xs rounded-full cursor-pointer transition-colors text-center block"
                    >
                      Ajukan Permintaan
                    </button>
                    <button type="button" onClick={() => setSelectedAsset(null)} className="w-full py-2.5 bg-white border border-red-400 text-red-500 font-bold text-xs rounded-full hover:bg-red-50 cursor-pointer transition-colors">
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}