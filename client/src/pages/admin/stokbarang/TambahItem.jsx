import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export default function TambahItem({ onClose }) {
  // Mengeset default input tanggal ke hari ini
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'Elektronik', 
    stock: '', 
    location: '',
    date: today 
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Tambah Item Baru</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Masukkan unit aset fisik logistik ke sistem gudang</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-600 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Nama Barang</label>
            <input type="text" required placeholder="Contoh: Lampu Studio Ringlight" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Kategori</label>
              <select className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b]">
                <option>Elektronik</option>
                <option>ATK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Jumlah Stok Awal</label>
              <input 
                type="number" 
                required 
                min="0"
                value={formData.stock}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFormData({ ...formData, stock: val < 0 ? 0 : e.target.value });
                }}
                placeholder="0" 
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b]" 
              />
            </div>
          </div>

          {/* Baris Input Lokasi & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">Tanggal Masuk</label>
              <input 
                type="date" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white text-zinc-700" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Batal</button>
            <button type="submit" className="flex items-center gap-2 bg-[#00664b] hover:bg-[#00553e] text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95">
              <Save size={16} /> Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}