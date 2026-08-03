import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, RefreshCw, ArrowLeft, XCircle, AlertTriangle } from 'lucide-react';
import TambahItem from './TambahItem';
import EditItem from './EditItem';
import toast from 'react-hot-toast'; // 🔥 IMPORT TOASTER
import { API_URL } from '../../api'; // Sesuaikan path jika perlu

export default function StokBarang({ role = 'admin' }) {
  const isAdmin = role === 'admin' || role === 'ADMIN';
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, item: null });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/inventory/assets`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson || [];
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Gagal mengambil data aset:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleSoftDeleteClick = (item) => {
    setDeleteModal({ isOpen: true, type: 'soft', item });
  };

  const handleHardDeleteClick = (item) => {
    setDeleteModal({ isOpen: true, type: 'hard', item });
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    
    const id = deleteModal.item.id || deleteModal.item.kode_barang;
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    try {
      if (deleteModal.type === 'soft') {
        const timestamp = new Date().toISOString();
        const res = await fetch(`${API_URL}/inventory/assets/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ deleted_at: timestamp })
        });

        if (res.ok) {
          setItems(items.map(item => item.id === id ? { ...item, deleted_at: timestamp } : item));
          toast.success("Barang dipindahkan ke Trash."); // 🔥 UX MANIS
        } else {
          setItems(items.filter(item => item.id !== id));
        }
      } 
      else if (deleteModal.type === 'hard') {
        const res = await fetch(`${API_URL}/inventory/assets/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          setItems(items.filter(item => item.id !== id));
          toast.success("Barang dihapus permanen."); // 🔥 UX MANIS
        }
      }
    } catch (error) {
      console.error('Gagal memproses penghapusan:', error.message);
      toast.error('Gagal memproses penghapusan');
    } finally {
      setDeleteModal({ isOpen: false, type: null, item: null });
    }
  };

  const handleRestore = async (id) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/inventory/assets/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ deleted_at: null })
      });

      if (res.ok) {
        setItems(items.map(item => item.id === id ? { ...item, deleted_at: null } : item));
        toast.success("Barang berhasil dipulihkan."); // 🔥 UX MANIS
      }
    } catch (error) {
      console.error('Gagal memulihkan item:', error.message);
      toast.error('Gagal memulihkan barang.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const processedItems = items
    .filter(item => {
      if (showTrash) return item.deleted_at !== null && item.deleted_at !== undefined;
      return !item.deleted_at;
    })
    .filter(item => {
      const name = item.nama_barang || item.nama_aset || item.name || '';
      const kode = item.kode_barang || item.id || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             kode.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {showTrash && (
            <button onClick={() => setShowTrash(false)} className="p-2 bg-white border border-zinc-200 rounded-xl shadow-md text-[#00664b] hover:bg-emerald-50 transition-all cursor-pointer">
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">Manajemen Stok & Inventaris</h2>
            <p className="text-xs text-white/80 mt-0.5">
              {showTrash ? 'Daftar arsip barang (Trash)' : 'Daftar logistik dan aset operasional BSN'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!showTrash && (
            <button onClick={() => setShowTrash(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-zinc-700 border border-zinc-200 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer shadow-md">
              <Trash2 size={16} /> 
            </button>
          )}
          {isAdmin && !showTrash && (
            <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-[#00664b] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:bg-[#00553e] transition-all cursor-pointer">
              <Plus size={16} /> Tambah Item Baru
            </button>
          )}
        </div>
      </div>

      <div className="flex bg-white p-4 rounded-xl shadow-md border border-zinc-200/80">
        <div className="flex-1 relative flex items-center">
          <Search size={18} className="absolute left-3 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan kode atau nama barang..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#58a27d] text-white text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Kode Barang</th>
                <th className="p-4">Nama Barang</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Tanggal Masuk</th>
                {isAdmin && <th className="p-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-zinc-400">Memuat data dari database...</td>
                </tr>
              ) : processedItems.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-zinc-500">
                    {showTrash ? 'Tidak ada data di Trash.' : 'Tidak ditemukan data barang.'}
                  </td>
                </tr>
              ) : (
                processedItems.map((item) => (
                  <tr key={item.id || item.kode_barang} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-zinc-900">{item.kode_barang || '-'}</td>
                    <td className="p-4 font-semibold text-zinc-900">{item.nama_barang || item.nama_aset || item.name}</td>
                    
                    <td className="p-4 text-zinc-600">
                      {item.category && !item.category.deleted_at ? item.category.name : '-'}
                    </td>
                    
                    <td className="p-4 font-bold text-[#00664b]">{item.stok ?? item.stock ?? 0} Unit</td>
                    <td className="p-4 text-zinc-600">{item.location || '-'}</td>
                    <td className="p-4 text-zinc-500 text-xs">{formatDate(item.createdAt || item.date)}</td>
                    
                    {isAdmin && (
                      <td className="p-4 text-right space-x-2">
                        {showTrash ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleRestore(item.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer">
                              <RefreshCw size={14} /> Restore
                            </button>
                            <button onClick={() => handleHardDeleteClick(item)} className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer">
                              <XCircle size={14} /> Hapus
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleEditClick(item)} className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleSoftDeleteClick(item)} className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                              <Trash2 size={16} />
                            </button>
                          </div>
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

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 p-8 text-center animate-in zoom-in-95 duration-200">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${deleteModal.type === 'soft' ? 'bg-amber-100' : 'bg-red-100'}`}>
              <AlertTriangle className={`w-8 h-8 ${deleteModal.type === 'soft' ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
            
            <h3 className="text-xl font-bold text-zinc-900 mb-3">
              {deleteModal.type === 'soft' ? 'Pindahkan ke Trash?' : 'Hapus Permanen Barang?'}
            </h3>
            
            <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
              {deleteModal.type === 'soft' ? (
                <>Apakah Anda yakin ingin memindahkan item <b>"{deleteModal.item?.nama_barang || deleteModal.item?.nama_aset || deleteModal.item?.name}"</b> ({deleteModal.item?.kode_barang}) ke tempat sampah?</>
              ) : (
                <>PERINGATAN: Hapus PERMANEN <b>"{deleteModal.item?.nama_barang || deleteModal.item?.nama_aset || deleteModal.item?.name}"</b>? Data ini tidak dapat dibatalkan, dan memori barang akan dihapus selamanya.</>
              )}
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, type: null, item: null })} 
                className="px-6 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                className={`px-6 py-2.5 text-sm font-semibold text-white rounded-full shadow-md transition-all active:scale-95 cursor-pointer ${
                  deleteModal.type === 'soft' ? 'bg-[#00664b] hover:bg-[#00553e]' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <TambahItem 
         onClose={() => setIsAddOpen(false)} 
         onSuccess={() => {
         setIsAddOpen(false);
         fetchItems();
        }} 
         existingItemsCount={items.length} 
        />
      )}

      {isEditOpen && (
        <EditItem 
          itemData={selectedItem} 
          onClose={() => setIsEditOpen(false)} 
          onSuccess={() => { setIsEditOpen(false); fetchItems(); }} 
        />
      )}
    </div>
  );
}