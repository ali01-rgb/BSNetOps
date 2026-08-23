import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function EditUser({ userData, onClose, onSave }) {
  const [formData, setFormData] = useState({ 
    id: '', 
    originalId: '', 
    name: '', 
    password: '', 
    role: 'User', 
    cabang: 'KC Semarang',
    unit: 'CWO',
    isSuspended: false,
    isDeleted: false 
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        id: userData.id || '',
        originalId: userData.originalId || '',
        name: userData.name || '',
        password: '', // Kosong secara default jika tidak ingin ganti password
        role: userData.role || 'User',
        cabang: userData.cabang || 'KC Semarang',
        unit: userData.unit || 'CWO',
        isSuspended: userData.isSuspended || false,
        isDeleted: userData.isDeleted || false 
      });
    }
  }, [userData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Ubah Otorisasi User</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Mengubah konfigurasi akun <span className="font-mono font-bold text-zinc-700">{formData.id}</span></p>
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
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white" 
            />
          </div>

          {/* 🔥 EMAIL DIGANTI MENJADI GANTI PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Ganti Password Baru</label>
            <input 
              type="password" 
              placeholder="Kosongkan jika tidak ingin mengubah password"
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
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
                {/* 🔥 LOGIKA ROLE: Jika Manager, cuma bisa Manager. Jika User/Admin, hanya bisa User/Admin */}
                {userData?.role === 'Manager' ? (
                  <option value="Manager">Manager</option>
                ) : (
                  <>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Penempatan Cabang</label>
              <select 
                value={formData.cabang} 
                onChange={(e) => setFormData({ ...formData, cabang: e.target.value })} 
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

          {/* 🔥 STATUS KEAKTIFAN & UNIT BERDAMPINGAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Status Keaktifan Akun</label>
              <select 
                value={formData.isSuspended ? "suspended" : "active"} 
                onChange={(e) => setFormData({ ...formData, isSuspended: e.target.value === "suspended" })} 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white cursor-pointer"
              >
                <option value="active">Aktif (Diizinkan Login)</option>
                <option value="suspended">Suspend (Ditangguhkan)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Unit Kerja</label>
              <select 
                value={formData.unit} 
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] bg-white cursor-pointer"
              >
                <option value="CWO">CWO</option>
                <option value="Teller">Teller</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Operasional">Operasional</option>
                <option value="Logistik">Logistik</option>
                <option value="IT Support">IT Support</option>
                <option value="SDM / HRD">SDM / HRD</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">Jika ditangguhkan, user tidak akan bisa masuk ke dalam sistem saat mencoba login.</p>

          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">Batal</button>
            <button type="submit" className="flex items-center gap-2 bg-[#00664b] hover:bg-[#00553e] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer">
              <Check size={16} /> Perbarui Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}