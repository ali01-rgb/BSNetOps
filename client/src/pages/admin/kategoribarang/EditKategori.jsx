import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { API_URL } from '../../api'; // Sesuaikan path jika perlu

export default function EditKategori({ categoryData, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || '',
        description: categoryData.description || ''
      });
    }
  }, [categoryData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/inventory/categories/${categoryData.id}`, {
        method: "PATCH",
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
        const errData = await res.json();
        setErrorMsg(errData.message || "Gagal memperbarui kategori.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Terjadi kesalahan sistem. Cek koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <h3 className="text-base font-bold text-zinc-800">Edit Kategori</h3>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Nama Kategori</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#00664b]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">Deskripsi</label>
            <textarea 
              rows="3"
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
              {loading ? 'Menyimpan...' : 'Perbarui Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}