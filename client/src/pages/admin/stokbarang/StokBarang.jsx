import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Filter, ArrowUpDown, RefreshCw, ArrowLeft } from 'lucide-react';
import TambahItem from './TambahItem';
import EditItem from './EditItem';

// Data Dummy Inventaris Bersih (Hanya Elektronik & ATK)
const initialItemsData = [
  { id: 'BRG-001', name: 'MacBook Pro 14"', category: 'Elektronik', stock: 15, location: 'Rak A-1', date: '2026-06-15', status: 'Aman', deleted_at: null },
  { id: 'BRG-002', name: 'Kamera Sony Alpha A7 ii', category: 'Elektronik', stock: 3, location: 'Rak A-3', date: '2026-06-20', status: 'Kritis', deleted_at: null },
  { id: 'BRG-003', name: 'Kursi Kerja Ergonomis', category: 'Elektronik', stock: 40, location: 'Gudang B', date: '2026-05-10', status: 'Aman', deleted_at: null },
  { id: 'BRG-004', name: 'Kertas HVS A4 80gr', category: 'ATK', stock: 120, location: 'Lemari C', date: '2026-06-28', status: 'Aman', deleted_at: null },
  { id: 'BRG-005', name: 'Pulpen Gel Hitam Box', category: 'ATK', stock: 50, location: 'Lemari C', date: '2026-06-29', status: 'Aman', deleted_at: null },
];

export default function StokBarang({ role = 'admin' }) {
  const isAdmin = role === 'admin';
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [items, setItems] = useState(initialItemsData);
  const [showTrash, setShowTrash] = useState(false);

  // STATE FILTER & SORTING
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc' (A-Z), 'desc' (Z-A)

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleSoftDelete = (id) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus item ${id}? (Data akan dipindahkan ke Trash)`)) {
      setItems(items.map(item => 
        item.id === id ? { ...item, deleted_at: new Date().toISOString() } : item
      ));
    }
  };

  const handleRestore = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, deleted_at: null } : item
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // LOGIKA FILTERING, SEARCHING, & SORTING
  const processedItems = items
    .filter(item => (showTrash ? item.deleted_at !== null : item.deleted_at === null))
    .filter(item => (categoryFilter === 'Semua' ? true : item.category === categoryFilter))
    .filter(item => {
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'desc') return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header Utama dengan Tombol Back Arrow Interaktif */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {showTrash && (
            <button 
              onClick={() => setShowTrash(false)}
              className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl shadow-md text-[#00805e] hover:bg-emerald-50 hover:text-[#00664b] hover:border-emerald-200 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
              title="Kembali ke Barang Aktif"
            >
              <ArrowLeft size={18} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">Manajemen Stok & Inventaris</h2>
            <p className="text-xs text-white-500 mt-0.5">
              {showTrash ? 'Daftar arsip barang yang dihapus sementara (Trash)' : 'Daftar fisik logistik dan aset operasional kantor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* REVISI: Tombol "Lihat Trash" sudah dilengkapi Icon Tempat Sampah (Trash2) */}
          {!showTrash && (
            <button 
              onClick={() => setShowTrash(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-700 border border-zinc-200 rounded-xl text-sm font-semibold shadow-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer group"
            >
              <Trash2 size={16} className="text-zinc-500 group-hover:text-red-600 transition-colors" />
            </button>
          )}

          {isAdmin && !showTrash && (
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 bg-[#00664b] hover:bg-[#00553e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Tambah Item Baru
            </button>
          )}
        </div>
      </div>

      {/* Bar Kontrol Filter */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl shadow-md border border-zinc-200/80">
        <div className="flex-1 relative flex items-center">
          <Search size={18} className="absolute left-3 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan kode asset atau nama barang..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex items-center bg-zinc-50 border border-zinc-200 rounded-lg px-3 hover:bg-zinc-100 transition-colors">
            <Filter size={16} className="text-zinc-500 mr-2" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-sm text-zinc-600 focus:outline-none cursor-pointer py-2 pr-2 font-medium"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Elektronik">Elektronik</option>
              <option value="ATK">ATK</option>
            </select>
          </div>

          <div className="relative flex items-center bg-zinc-50 border border-zinc-200 rounded-lg px-3 hover:bg-zinc-100 transition-colors">
            <ArrowUpDown size={16} className="text-zinc-500 mr-2" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent text-sm text-zinc-600 focus:outline-none cursor-pointer py-2 pr-2 font-medium"
            >
              <option value="none">Urutan Default</option>
              <option value="asc">Nama Barang (A - Z)</option>
              <option value="desc">Nama Barang (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Utama */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#58a27d] text-white text-xs uppercase font-semibold tracking-wider border-b border-[#58a27d]">
                <th className="p-4 rounded-tl-xl">Kode</th>
                <th className="p-4">Nama Barang</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Jumlah Stok</th>
                <th className="p-4">Lokasi Penyimpanan</th>
                <th className="p-4">Tanggal Masuk</th>
                {isAdmin && <th className="p-4 text-right">Aksi Kontrol</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {processedItems.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-12 text-center text-zinc-400 font-medium bg-zinc-50/30">
                    Tidak ditemukan data barang yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                processedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-zinc-900 bg-zinc-50/30">{item.id}</td>
                    
                    <td className="p-4 font-semibold text-zinc-900">{item.name}</td>
                    <td className="p-4 text-zinc-600">{item.category}</td>
                    <td className="p-4">
                      <span className={`font-bold ${item.status === 'Kritis' && !showTrash ? 'text-red-600' : 'text-zinc-900'}`}>
                        {item.stock} Unit
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">{item.location}</td>
                    <td className="p-4 text-zinc-600 font-medium">{formatDate(item.date)}</td>

                    {isAdmin && (
                      <td className="p-4 text-right space-x-1">
                        {showTrash ? (
                          <button 
                            onClick={() => handleRestore(item.id)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all inline-flex items-center gap-1 text-xs font-semibold border border-amber-200 cursor-pointer"
                          >
                            <RefreshCw size={14} /> Restore
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEditClick(item)}
                              className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-flex items-center cursor-pointer"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleSoftDelete(item.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all inline-flex items-center cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && <TambahItem onClose={() => setIsAddOpen(false)} />}
      {isEditOpen && <EditItem itemData={selectedItem} onClose={() => setIsEditOpen(false)} />}

    </div>
  );
}