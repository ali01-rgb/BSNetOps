import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, ArrowLeft, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import TambahKategori from './TambahKategori';
import EditKategori from './EditKategori';
import toast from 'react-hot-toast'; // 🔥 IMPORT TOASTER

export default function KategoriBarang() {
  const [categories, setCategories] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, category: null });

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch("http://localhost:3000/inventory/categories", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const resJson = await res.json();
        const dataList = resJson.data || resJson;
        if (Array.isArray(dataList)) setCategories(dataList);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleSoftDeleteClick = (category) => {
    setDeleteModal({ isOpen: true, type: 'soft', category });
  };

  const handleHardDeleteClick = (category) => {
    setDeleteModal({ isOpen: true, type: 'hard', category });
  };

  const confirmDelete = async () => {
    if (!deleteModal.category) return;
    const id = deleteModal.category.id;
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    try {
      if (deleteModal.type === 'soft') {
        const timestamp = new Date().toISOString();
        const res = await fetch(`http://localhost:3000/inventory/categories/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ deleted_at: timestamp, deletedAt: timestamp })
        });
        if (res.ok) toast.success("Kategori dipindahkan ke Trash."); // 🔥 UX MANIS
      } 
      else if (deleteModal.type === 'hard') {
        const res = await fetch(`http://localhost:3000/inventory/categories/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) toast.success("Kategori dihapus permanen."); // 🔥 UX MANIS
      }
      fetchCategories();
    } catch (error) {
      console.error("Gagal memproses penghapusan:", error);
      toast.error("Gagal memproses penghapusan.");
    } finally {
      setDeleteModal({ isOpen: false, type: null, category: null });
    }
  };

  const handleRestoreCategory = async (id) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/inventory/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ deleted_at: null, deletedAt: null })
      });
      if (res.ok) toast.success("Kategori berhasil dipulihkan."); // 🔥 UX MANIS
      fetchCategories();
    } catch (error) {
      console.error("Gagal restore:", error);
      toast.error("Gagal memulihkan kategori.");
    }
  };

  const filteredCategories = categories
    .filter(cat => {
      const isDeleted = cat.deleted_at || cat.deletedAt;
      return showTrash ? isDeleted != null : !isDeleted;
    })
    .filter(cat => {
      const name = cat.name || cat.namaKategori || '';
      const code = cat.category_code || cat.code || cat.id || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || code.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {showTrash && (
            <button onClick={() => setShowTrash(false)} className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl shadow-md text-[#00805e] transition-all hover:scale-110 cursor-pointer">
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">Kategori Barang Inventaris</h2>
            <p className="text-xs text-white/80 mt-0.5">{showTrash ? 'Arsip Trash Kategori' : 'Kelola kategori aset'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!showTrash && (
            <>
              <button onClick={() => setShowTrash(true)} className="p-2.5 bg-white text-zinc-700 border border-zinc-200 hover:text-red-600 rounded-xl shadow-xs cursor-pointer">
                <Trash2 size={18} />
              </button>
              <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 bg-[#00664b] hover:bg-[#00553e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer">
                <Plus size={16} /> Tambah Kategori
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex bg-white p-4 rounded-xl shadow-md border border-zinc-200/80">
        <div className="flex-1 relative flex items-center">
          <Search size={18} className="absolute left-3 text-zinc-400" />
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Kategori atau Nama Kategori..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b]"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#58a27d] text-white text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 w-32">Kode</th>
              <th className="p-4 w-48">Nama</th>
              <th className="p-4">Deskripsi</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredCategories.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-zinc-500 font-medium">Data kategori kosong.</td></tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-50/40">
                  <td className="p-4 font-mono text-xs font-bold text-zinc-900">{cat.category_code || cat.code || String(cat.id).substring(0,8)}</td>
                  <td className="p-4 font-bold">{cat.name || cat.namaKategori}</td>
                  <td className="p-4 text-zinc-600">{cat.description || cat.deskripsi || '-'}</td>
                  
                  <td className="p-4 text-right space-x-1">
                     {showTrash ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleRestoreCategory(cat.id)} className="text-amber-600 border border-amber-200 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-amber-50 flex items-center gap-1"><RefreshCw size={12}/> Restore</button>
                        <button onClick={() => handleHardDeleteClick(cat)} className="text-red-600 border border-red-200 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-red-50 flex items-center gap-1"><XCircle size={12}/> Hapus</button>
                      </div>
                     ) : (
                      <>
                        <button onClick={() => handleEditClick(cat)} className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"><Edit3 size={16}/></button>
                        <button onClick={() => handleSoftDeleteClick(cat)} className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={16}/></button>
                      </>
                     )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 p-8 text-center animate-in zoom-in-95 duration-200">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${deleteModal.type === 'soft' ? 'bg-amber-100' : 'bg-red-100'}`}>
              <AlertTriangle className={`w-8 h-8 ${deleteModal.type === 'soft' ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
            
            <h3 className="text-xl font-bold text-zinc-900 mb-3">
              {deleteModal.type === 'soft' ? 'Pindahkan ke Trash?' : 'Hapus Permanen Kategori?'}
            </h3>
            
            <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
              {deleteModal.type === 'soft' ? (
                <>Apakah Anda yakin ingin memindahkan "{deleteModal.category?.name || deleteModal.category?.namaKategori}" ke Trash? Barang dengan kategori ini akan sementara berubah menjadi "-".</>
              ) : (
                <>PERINGATAN: Hapus PERMANEN "{deleteModal.category?.name || deleteModal.category?.namaKategori}"? Data ini tidak dapat dibatalkan, dan memori kategori barang akan dihapus selamanya.</>
              )}
            </p>
            
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteModal({ isOpen: false, type: null, category: null })} className="px-6 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer">
                Batal
              </button>
              <button onClick={confirmDelete} className={`px-6 py-2.5 text-sm font-semibold text-white rounded-full shadow-md transition-all active:scale-95 cursor-pointer ${deleteModal.type === 'soft' ? 'bg-[#00664b] hover:bg-[#00553e]' : 'bg-red-600 hover:bg-red-700'}`}>
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <TambahKategori 
         onClose={() => setIsAddOpen(false)} 
         onSuccess={() => { toast.success("Kategori berhasil ditambahkan!"); fetchCategories(); }} 
         existingCategoriesCount={categories.length}
      />)}
      {isEditOpen && <EditKategori categoryData={selectedCategory} onClose={() => setIsEditOpen(false)} onSuccess={() => { toast.success("Kategori berhasil diperbarui!"); fetchCategories(); }} />}
       
    </div>
  );
}