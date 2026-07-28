import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Calendar, Package, X, Check, ShoppingCart, Loader2 } from 'lucide-react';

export default function Aset({ setCurrentView }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  
  // STATE DARI DATABASE
  const [katalogAset, setKatalogAset] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE KERANJANG (MULTI-ITEMS)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('selectedAssetData');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // STATE FILTER
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Semua'); 
  const [filterType, setFilterType] = useState('Default'); 
  
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

  // Sinkronisasi Cart ke LocalStorage
  useEffect(() => {
    localStorage.setItem('selectedAssetData', JSON.stringify(cart));
  }, [cart]);

  // 🔥 FUNGSI TARIK DATA DENGAN MAPPING KOLOM SUPABASE YANG AKURAT
  useEffect(() => {
    const fetchAset = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        
        const res = await fetch("http://localhost:3000/inventory/assets", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const response = await res.json();
          const assets = response.data || []; 
          
          if (Array.isArray(assets)) {
            // 🔥 MAPPING KOLOM: nama_barang, kode_barang, stok, image_url
            const formattedAset = assets.map(item => ({
              id: item.id,
              nama: item.nama_barang || item.name || 'Tanpa Nama', 
              kode: item.kode_barang || item.kode || 'N/A',
              kategori: item.category || item.kategori || 'Umum',
              stok: `${item.stok ?? item.stock ?? 0} Pcs`, 
              tglUpdate: item.createdAt 
                ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Terbaru',
              // FIX: image_url dari Supabase
              gambar: item.image_url || item.imageUrl || 'https://via.placeholder.com/150?text=No+Image' 
            }));
            setKatalogAset(formattedAset);
          }
        } else {
          console.error("Gagal ambil data aset. HTTP Status:", res.status);
          if (res.status === 401) {
            alert("Sesi Anda telah berakhir atau Token tidak valid. Silakan relogin.");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAset();
  }, []);

  // LOGIKA FILTERING
  const filteredAset = katalogAset.filter(aset => {
    const matchesSearch = aset.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          aset.kode.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'Default') {
      return matchesSearch;
    } else {
      return matchesSearch && (activeCategory === 'Semua' || aset.kategori === activeCategory);
    }
  });

  const uniqueCategories = [...new Set(katalogAset.map(item => item.kategori))];

  const handleOpenModal = (aset) => {
    setSelectedAsset(aset);
  };

  const handleAddToCart = () => {
    if (selectedAsset) {
      const isExist = cart.some(item => item.kodeAset === selectedAsset.kode);
      
      if (!isExist) {
        const updatedCart = [...cart, {
          namaAset: selectedAsset.nama,
          kodeAset: selectedAsset.kode,
          jumlah: 1
        }];
        setCart(updatedCart);
      }
      setSelectedAsset(null);
    }
  };

  const handleRemoveFromCart = (kodeAset) => {
    const updatedCart = cart.filter(item => item.kodeAset !== kodeAset);
    setCart(updatedCart);
  };

  const handleRedirectToForm = () => {
    if (cart.length > 0) {
      setCurrentView('ajukan-permintaan');
    } else {
      alert("Keranjang belanja Anda masih kosong. Silakan pilih aset terlebih dahulu!");
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-400 min-h-screen text-zinc-800 pb-12">
      
      {/* SEKSI NOTIFIKASI LAYOUT KERANJANG ATAS */}
      {cart.length > 0 && (
        <div className="w-full bg-emerald-50 border border-emerald-600/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00664b] text-white rounded-xl">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#00664b]">Barang Permintaan ({cart.length} Item)</h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {cart.map((item) => (
                  <span key={item.kodeAset} className="inline-flex items-center gap-1 bg-white border border-zinc-200 text-zinc-700 font-medium text-[10px] px-2 py-0.5 rounded-full capitalize">
                    {item.namaAset}
                    <button onClick={() => handleRemoveFromCart(item.kodeAset)} className="text-red-500 hover:text-red-700 ml-0.5 font-bold cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={handleRedirectToForm}
            className="w-full sm:w-auto px-5 py-2 bg-[#005c42] hover:bg-[#00422f] text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer text-center"
          >
            Lanjutkan Permintaan ({cart.length})
          </button>
        </div>
      )}

      {/* KONTROL ATAS: Search Bar & Filter */}
      <div className="flex items-center justify-between gap-4 w-full pt-2">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input 
            type="text"
            placeholder="Cari barang atau kode..."
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
                  Default
                </span>
                {filterType === 'Default' && <Check size={14} className="text-[#00664b]" />}
              </button>

              <hr className="border-zinc-100 my-1.5" />

              <div className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Kategori
                </div>
                
                {uniqueCategories.map((kat) => (
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

      {/* AREA GRID KATALOG / LOADING / EMPTY STATE */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Loader2 className="animate-spin mb-2" size={24} />
          <p className="text-sm font-medium">Memuat katalog aset dari database...</p>
        </div>
      ) : filteredAset.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-sm">
          Tidak ada barang yang ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredAset.map((aset) => {
            const isAddedInCart = cart.some(item => item.kodeAset === aset.kode);
            return (
              <div 
                key={aset.id}
                onClick={() => handleOpenModal(aset)}
                className={`bg-white border rounded-3xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.01] select-none relative overflow-hidden ${
                  isAddedInCart ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-zinc-200/80'
                }`}
              >
                {isAddedInCart && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white pl-3 pr-2 py-1 rounded-bl-xl text-[9px] font-bold flex items-center gap-1 shadow-sm">
                    <Check size={10} strokeWidth={3} /> DIPILIH
                  </div>
                )}

                <div className="w-28 h-28 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                  <img src={aset.gambar} alt={aset.nama} className="w-full h-full object-contain mix-blend-multiply" />
                </div>

                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <h3 className="font-bold text-sm capitalize text-zinc-700 border-b border-zinc-900 pb-1 tracking-tight pr-14">
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
            );
          })}
        </div>
      )}

      {/* MODAL DETAIL POP-UP */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/30 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-xl w-full p-6 relative flex gap-6 animate-in zoom-in-95 duration-200">
            
            <button onClick={() => setSelectedAsset(null)} className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 cursor-pointer">
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
                    Masukkan aset inventaris ini ke list item permintaan untuk pengajuan bon barang sekaligus.
                  </p>

                  <div className="space-y-2 pt-6">
                    {cart.some(item => item.kodeAset === selectedAsset.kode) ? (
                      <button 
                        type="button" 
                        onClick={() => {
                          handleRemoveFromCart(selectedAsset.kode);
                          setSelectedAsset(null);
                        }} 
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full cursor-pointer transition-colors text-center block flex items-center justify-center gap-2"
                      >
                        Hapus dari Permintaan
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleAddToCart} 
                        className="w-full py-2.5 bg-[#005c42] hover:bg-[#00422f] text-white font-bold text-xs rounded-full cursor-pointer transition-colors text-center block flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} /> Masukkan ke Permintaan
                      </button>
                    )}
                    <button type="button" onClick={() => setSelectedAsset(null)} className="w-full py-2.5 bg-white border border-zinc-300 text-zinc-600 font-bold text-xs rounded-full hover:bg-zinc-50 cursor-pointer transition-colors">
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