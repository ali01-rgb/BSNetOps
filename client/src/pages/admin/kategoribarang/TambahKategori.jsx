import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function TambahKategori({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    category_code: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch("http://localhost:3000/inventory/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Gagal menambahkan kategori baru.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <h3 className="text-base font-bold text-zinc-800">Tambah Kategori Baru</h3>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Kode Kategori</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: CAT-001"
              value={formData.category_code}
              onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#00664b]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Nama Kategori</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Elektronik & Alat Tulis"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#00664b]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Deskripsi</label>
            <textarea 
              rows="3"
              placeholder="Keterangan singkat kategori..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#00664b]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-xl text-sm font-semibold hover:bg-zinc-50 cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-[#00664b] hover:bg-[#00553e] text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer">
              {loading ? 'Menyimpan...' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}