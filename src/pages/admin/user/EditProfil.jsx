import React, { useState, useRef } from 'react';
import { User, Mail, Shield, Camera, Save, ArrowLeft } from 'lucide-react';

export default function EditProfil() {
  const [profile, setProfile] = useState({
    name: 'Chico Diar Ramadhan',
    nim: '21120124140150',
    email: 'chico.diar@example.com',
    avatar: null // Menyimpan URL data gambar lokal temporarily
  });

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile({ ...profile, avatar: imageUrl });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Profil berhasil diperbarui secara lokal!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Kecil */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Pengaturan Akun</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Kelola identitas personal dan foto kartu anggota logistik BSN</p>
      </div>

      {/* Kartu Utama */}
      <div className="bg-white border border-zinc-200/80 shadow-md rounded-2xl overflow-hidden">
        
        {/* Banner Hiasan Atas */}
        <div className="h-24 bg-[#58a27d]"></div>

        <form onSubmit={handleSave} className="p-6 pt-0 space-y-6 relative">
          
          {/* Sesi Unggah Avatar Profil */}
          <div className="flex flex-col sm:flex-row items-center gap-4 -mt-12 sm:items-end mb-4">
            <div className="relative group w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-zinc-100 overflow-hidden shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-2xl text-[#478767] bg-emerald-50">
                  CD
                </div>
              )}
              {/* Overlay Hover Tombol Kamera */}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
              >
                <Camera size={18} />
              </button>
            </div>
            
            <div className="text-center sm:text-left pb-1">
              <h4 className="text-sm font-bold text-zinc-800">Foto Profil</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Rekomendasi rasio kotak persegi maks 2MB</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Nama */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">Nama Lengkap</label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3 text-zinc-400" />
                <input 
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800"
                />
              </div>
            </div>

            {/* Input NIM */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">ID Pegawai</label>
              <div className="relative flex items-center">
                <Shield size={16} className="absolute left-3 text-zinc-400" />
                <input 
                  type="text"
                  value={profile.nim}
                  disabled
                  className="w-full pl-10 pr-4 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-400 font-mono select-none"
                  title="NIM tidak dapat diubah mandiri"
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Alamat Email</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-zinc-400" />
                <input 
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button 
              type="submit"
              className="px-4 py-2 bg-[#58a27d] hover:bg-[#478767] text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-md shadow-[#58a27d]/10 hover:shadow-lg transition-all cursor-pointer"
            >
              <Save size={16} /> Simpan Perubahan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}