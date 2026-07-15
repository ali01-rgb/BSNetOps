import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function TambahUser({ onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Staff', status: 'Aktif' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Daftarkan User Baru</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Berikan otorisasi masuk sistem logistik kepada pegawai baru</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-600 rounded-lg transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Nama Lengkap</label>
            <input type="text" required placeholder="Contoh: Budi Setiawan" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Email Resmi BSN</label>
            <input type="email" required placeholder="budi.s@bsn.go.id" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Hak Akses</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] bg-white cursor-pointer">
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Status Awal</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] bg-white cursor-pointer">
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Ditangguhkan</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">Batal</button>
            <button type="submit" className="flex items-center gap-2 bg-[#00664b] hover:bg-[#00553e] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer">
              <Save size={16} /> Simpan User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}