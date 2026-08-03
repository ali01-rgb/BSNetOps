import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast'; // 🔥 IMPORT TOASTER
import { API_URL } from '@/api';

export default function TambahUser({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'Staff', 
    unit: 'KC Semarang' 
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 VALIDASI DOMAIN EMAIL BSN
    const allowedDomains = ["@btn.co.id", "@bankbsn.co.id", "@bsn.co.id"];
    const isDomainValid = allowedDomains.some(domain => formData.email.toLowerCase().endsWith(domain));
    
    if (!isDomainValid) {
      toast.error("Gagal: Harus menggunakan email resmi BSN (@btn.co.id, @bankbsn.co.id, @bsn.co.id)");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');

      const res = await fetch(`${API_URL}/inventory/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.name,
          username: formData.email.split('@')[0], 
          email: formData.email,
          password: formData.password, 
          role: formData.role.toUpperCase(), 
          divisi: formData.unit,
          hasSignedUp: true 
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan ke database");
      }

      toast.success(`Sukses! Akun untuk ${formData.name} berhasil dibuat.`); // 🔥 GANTI ALERT
      if (onSuccess) onSuccess(); 
      onClose(); 

    } catch (error) {
      console.error('Gagal mendaftarkan user baru:', error.message);
      toast.error('Terjadi kesalahan saat menyimpan: ' + error.message); // 🔥 GANTI ALERT
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Buat Akun Baru</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Pembuatan kredensial akses sistem logistik BSN</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-600 rounded-lg transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Budi Setiawan" 
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Email Resmi BSN</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="budi.s@bsn.co.id" 
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Password</label>
            <input 
              type="text" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Masukkan password awal" 
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Hak Akses</label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] bg-white cursor-pointer"
              >
                <option value="Staff">Staff (User)</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Unit / Cabang</label>
              <select 
                value={formData.unit} 
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] bg-white cursor-pointer"
              >
                <option value="KC Semarang">KC Semarang</option>
                <option value="KCP Majapahit">KCP Majapahit</option>
                <option value="KCP Ungaran">KCP Ungaran</option>
                <option value="KCP Ngaliyan">KCP Ngaliyan</option>
                <option value="KCP Kendal">KCP Kendal</option>
                <option value="KCP Kudus">KCP Kudus</option>
                <option value="KCP Magelang">KCP Magelang</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[#00664b] hover:bg-[#00553e] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50">
              <Save size={16} /> {loading ? 'Menyimpan...' : 'Buat Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}