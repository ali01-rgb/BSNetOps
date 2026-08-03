import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { API_URL } from '../../api'; // Sesuaikan path jika perlu

export default function TambahKategori({ onClose, onSuccess, existingCategoriesCount = 0 }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  
  // 🔥 STATE BARU UNTUK ERROR BANNER
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(''); // Reset error

    try {
      const nextNumber = existingCategoriesCount + 1;
      const formattedCode = `KAT-${String(nextNumber).padStart(3, '0')}`;

      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/inventory/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          category_code: formattedCode,
          name: formData.name,
          description: formData.description
        })
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // 🔥 TANGKAP ERROR DARI BACKEND
        const errData = await res.json();
        setErrorMsg(errData.message || "Gagal menambahkan kategori baru.");
      }
    } catch (error) {
      console.error("Error menambah kategori:", error);
      setErrorMsg("Terjadi kesalahan sistem saat menyimpan kategori. Cek koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <div>
            <h3 className="text-base font-bold text-zinc-800">Tambah Kategori Baru</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Kode unik akan ter-generate otomatis oleh sistem</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 🔥 ERROR BANNER (Muncul kalau ada duplikat / ada di trash) */}
          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Elektronik & Hardware"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#00664b] bg-zinc-50 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Deskripsi / Keterangan</label>
            <textarea 
              rows="3"
              placeholder="Keterangan singkat pengelompokan aset..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#00664b] bg-zinc-50 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition-colors cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-[#00664b] hover:bg-[#00553e] text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50">
              <Save size={16} />
              {loading ? 'Menyimpan...' : 'Simpan Kategori'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}