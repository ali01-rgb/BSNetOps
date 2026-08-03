import React, { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../../supabaseClient'; 
import toast from 'react-hot-toast'; // 🔥 IMPORT TOASTER
import { API_URL } from '../../api'; // Sesuaikan path jika perlu

export default function EditItem({ itemData, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ 
    id: '',
    kodeBarang: '',
    name: '', 
    categoryId: '', 
    stock: '', 
    location: '', 
    date: '',
    image: null,
    existingImageUrl: null
  });
  
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  // Fetch daftar kategori
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const res = await fetch(`${API_URL}/inventory/categories`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok && isMounted) {
          const resJson = await res.json();
          setCategories(resJson.data || resJson || []);
        }
      } catch (error) {
        console.error("Gagal load kategori:", error);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  // Pre-fill data lama ke form & set preview gambar lama
  useEffect(() => {
    if (itemData) {
      const imgUrl = itemData.image_url || itemData.image || null;
      setFormData({
        id: itemData.id || itemData.kode_barang || '',
        kodeBarang: itemData.kode_barang || itemData.id || '',
        name: itemData.nama_barang || itemData.name || '',
        categoryId: itemData.categoryId || '',
        stock: itemData.stok ?? itemData.stock ?? 0,
        location: itemData.location || '',
        date: itemData.date || '',
        image: null,
        existingImageUrl: imgUrl
      });
      setPreview(imgUrl);
    }
  }, [itemData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran gambar cukup besar (>2MB), proses simpan mungkin memerlukan waktu ekstra."); // 🔥 GANTI ALERT
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.existingImageUrl;

      // 1. Upload Gambar Baru ke Supabase jika user memilih file baru
      if (formData.image) {
        setLoadingStatus('Mengunggah foto baru...');
        const file = formData.image;
        const fileExt = file.name.split('.').pop();
        const fileName = `${formData.kodeBarang}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('items-bucket')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (!uploadError) {
          const { data: publicURLData } = supabase.storage
            .from('items-bucket')
            .getPublicUrl(fileName);
          finalImageUrl = publicURLData.publicUrl;
        }
      }

      // 2. Update Data ke Backend NestJS
      setLoadingStatus('Menyimpan perubahan...');
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const jumlahStok = parseInt(formData.stock, 10) || 0;

      const res = await fetch(`${API_URL}/inventory/assets/${formData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_barang: formData.name,
          categoryId: formData.categoryId,
          stok: jumlahStok,
          location: formData.location || '-',
          status: jumlahStok <= 3 ? 'Kritis' : 'Aman',
          image_url: finalImageUrl
        })
      });

      if (!res.ok) throw new Error("Gagal memperbarui item ke database.");

      toast.success(`Sukses! Data item berhasil diperbarui.`); // 🔥 GANTI ALERT
      
      if (onSuccess) onSuccess(); 
      onClose(); 

    } catch (error) {
      console.error('Gagal memperbarui item:', error.message);
      toast.error('Terjadi kesalahan saat memperbarui database: ' + error.message); // 🔥 GANTI ALERT
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Ubah Data Barang</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Mengubah info aset dengan kode unik <span className="font-mono font-bold text-zinc-700">{formData.kodeBarang}</span>
            </p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-600 rounded-lg transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Nama Barang</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Kategori</label>
              <select 
                required
                value={formData.categoryId} 
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] cursor-pointer"
              >
                <option value="" disabled>-- Pilih Kategori --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Jumlah Stok</label>
              <input 
                type="number" 
                required 
                min="0"
                value={formData.stock} 
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFormData({ ...formData, stock: isNaN(val) ? '' : (val < 0 ? 0 : val) });
                }}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Lokasi Rak/Penyimpanan</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white text-zinc-700" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Tanggal Masuk</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white text-zinc-700" 
              />
            </div>
          </div>

          {/* DRAG & DROP / UPLOAD FOTO BARANG */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Foto Barang <span className="text-xs text-zinc-400 font-normal">(Opsional)</span></label>
            <div className="relative mt-1 flex justify-center px-6 pt-4 pb-5 border-2 border-zinc-300 border-dashed rounded-xl hover:border-[#00664b] transition-colors bg-zinc-50 hover:bg-zinc-100/50 group cursor-pointer overflow-hidden">
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="space-y-1 text-center relative z-0">
                {preview ? (
                  <div className="flex flex-col items-center">
                    <img src={preview} alt="Preview" className="h-28 object-contain rounded-lg shadow-sm mb-1" />
                    <p className="text-xs font-medium text-[#00664b]">Klik untuk ganti foto</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="p-2.5 bg-zinc-200 rounded-full group-hover:bg-[#00664b]/10 transition-colors mb-1">
                      <ImageIcon className="w-5 h-5 text-zinc-500 group-hover:text-[#00664b]" />
                    </div>
                    <div className="text-xs text-zinc-600">
                      <span className="font-semibold text-[#00664b]">Klik untuk upload foto</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">PNG, JPG, JPEG (Max. 2MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER ACTION */}
          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100 mt-2">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50">
              <Check size={16} /> {loading ? (loadingStatus || 'Memperbarui...') : 'Perbarui Data'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}