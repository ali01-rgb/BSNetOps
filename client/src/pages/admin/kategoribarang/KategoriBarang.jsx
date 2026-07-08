import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import TambahKategori from './TambahKategori';
import EditKategori from './EditKategori.jsx';

// Data Dummy Kategori dengan Flag Soft Delete (deleted_at)
const initialCategoriesData = [
  { id: 'KAT-001', name: 'Elektronik', description: 'Peralatan elektronik, komputer, kamera, dan aksesori pendukung operasional kantor.', deleted_at: null },
  { id: 'KAT-002', name: 'ATK', description: 'Alat tulis kantor, kertas, pulpen, buku catatan, dan bahan habis pakai logistik.', deleted_at: null },
];

export default function KategoriBarang() {
  const [categories, setCategories] = useState(initialCategoriesData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false); // Mode tampilan: false = Aktif, true = Trash

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  // 1. FUNGSI SOFT DELETE (Pindahkan ke Trash)
  const handleSoftDeleteCategory = (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin memindahkan kategori "${name}" (${id}) ke Trash?`)) {
      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, deleted_at: new Date().toISOString() } : cat
      ));
    }
  };

  // 2. FUNGSI RESTORE (Kembalikan dari Trash)
  const handleRestoreCategory = (id) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, deleted_at: null } : cat
    ));
  };

  // LOGIKA FILTERING: Tampilkan data berdasarkan status Trash & Search Query
  const filteredCategories = categories
    .filter(cat => (showTrash ? cat.deleted_at !== null : cat.deleted_at === null))
    .filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {showTrash && (
            <button 
              onClick={() => setShowTrash(false)}
              className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl shadow-md text-[#00805e] hover:bg-emerald-50 hover:text-[#00664b] hover:border-emerald-200 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
              title="Kembali ke Kategori Aktif"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">Kategori Barang Inventaris</h2>
            <p className="text-xs text-white-500 mt-0.5">
              {showTrash ? 'Daftar arsip kategori yang dihapus sementara (Trash)' : 'Kelola kelompok klasifikasi aset dan pengelompokan logistik BSN'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {!showTrash ? (
            <>
              {/* Tombol Buka Trash */}
              <button 
                onClick={() => setShowTrash(true)}
                className="p-2.5 bg-white text-zinc-700 border border-zinc-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl shadow-xs transition-all cursor-pointer group flex items-center justify-center"
                title="Lihat Trash Kategori"
              >
                <Trash2 size={18} className="text-zinc-500 group-hover:text-red-600 transition-colors" />
              </button>

              {/* Tombol Tambah Kategori Baru */}
              <button 
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 bg-[#00664b] hover:bg-[#00553e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Plus size={16} /> Tambah Kategori
              </button>
            </>
          ) : (
            <span className="text-xs text-amber-300 font-semibold bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-500/30">
              Mode Trash Kategori
            </span>
          )}
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="flex bg-white p-4 rounded-xl shadow-md border border-zinc-200/80">
        <div className="flex-1 relative flex items-center">
          <Search size={18} className="absolute left-3 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan kode atau nama kategori..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Tabel Utama Kategori */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#58a27d] text-white text-xs uppercase font-semibold tracking-wider border-b border-[#58a27d]">
                <th className="p-4 rounded-tl-xl w-32">Kode</th>
                <th className="p-4 w-48">Nama Kategori</th>
                <th className="p-4">Deskripsi Ruang Lingkup</th>
                <th className="p-4 text-right rounded-tr-xl w-32">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-zinc-400 font-medium bg-zinc-50/30">
                    {showTrash ? 'Tidak ada kategori di dalam Trash.' : 'Tidak ditemukan data kategori yang cocok.'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-zinc-900 bg-zinc-50/30">{cat.id}</td>
                    <td className="p-4 font-bold text-zinc-900">{cat.name}</td>
                    <td className="p-4 text-zinc-600 leading-relaxed">{cat.description}</td>
                    <td className="p-4 text-right space-x-1">
                      {showTrash ? (
                        /* Tombol Restore jika sedang di Trash */
                        <button 
                          onClick={() => handleRestoreCategory(cat.id)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all inline-flex items-center gap-1 text-xs font-semibold border border-amber-200 cursor-pointer"
                        >
                          <RefreshCw size={14} /> Restore
                        </button>
                      ) : (
                        /* Tombol Edit & Soft Delete jika di Tampilan Aktif */
                        <>
                          <button 
                            onClick={() => handleEditClick(cat)}
                            className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-flex items-center cursor-pointer"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleSoftDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all inline-flex items-center cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && <TambahKategori onClose={() => setIsAddOpen(false)} />}
      {isEditOpen && <EditKategori categoryData={selectedCategory} onClose={() => setIsEditOpen(false)} />}

    </div>
  );
}