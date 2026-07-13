import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Camera, Save, Building, Briefcase, Phone } from 'lucide-react';

export default function EditProfil() {
  const [profile, setProfile] = useState({
    namaLengkap: '',
    nipPegawai: '',
    email: '',
    divisi: '',
    jabatan: '',
    noTelepon: '',
    avatar: null
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) {
      setProfile({
        namaLengkap: savedProfile.namaLengkap || savedProfile.name || '',
        nipPegawai: savedProfile.nipPegawai || savedProfile.nim || '',
        email: savedProfile.email || '',
        divisi: savedProfile.divisi || '',
        jabatan: savedProfile.jabatan || '',
        noTelepon: savedProfile.noTelepon || '',
        avatar: savedProfile.avatar || null
      });
    } else {
      setProfile({
        namaLengkap: 'Chico Diar Ramadhan',
        nipPegawai: '21120124140150',
        email: 'chico.diar@example.com',
        divisi: 'IT',
        jabatan: 'Staff',
        noTelepon: '085157778659',
        avatar: null
      });
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile({ ...profile, avatar: imageUrl });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Profil berhasil diperbarui dan disinkronkan ke sistem!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Pengaturan Akun</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Kelola identitas personal dan info kontak Anda</p>
      </div>

      <div className="bg-white border border-zinc-200/80 shadow-md rounded-2xl overflow-hidden">
        <div className="h-24 bg-[#58a27d]"></div>

        <form onSubmit={handleSave} className="p-6 pt-0 space-y-6 relative">
          <div className="flex flex-col sm:flex-row items-center gap-4 -mt-12 sm:items-end mb-4">
            <div className="relative group w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-zinc-100 overflow-hidden shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-2xl text-[#478767] bg-emerald-50 tracking-tighter">
                  {profile.namaLengkap ? profile.namaLengkap.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CD'}
                </div>
              )}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Nama Lengkap</label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3 text-zinc-400" />
                <input type="text" name="namaLengkap" value={profile.namaLengkap} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800 transition-colors" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">ID Pegawai</label>
              <div className="relative flex items-center">
                <Shield size={16} className="absolute left-3 text-zinc-400" />
                <input type="text" name="nipPegawai" value={profile.nipPegawai} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800 transition-colors" required />
              </div>
            </div>

            {/* Mengubah Label menjadi Unit */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Unit</label>
              <div className="relative flex items-center">
                <Building size={16} className="absolute left-3 text-zinc-400" />
                <input type="text" name="divisi" value={profile.divisi} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800 transition-colors" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Jabatan</label>
              <div className="relative flex items-center">
                <Briefcase size={16} className="absolute left-3 text-zinc-400" />
                <input type="text" name="jabatan" value={profile.jabatan} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800 transition-colors" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Alamat Email</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-zinc-400" />
                <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800 transition-colors" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">No Telephone</label>
              <div className="relative flex items-center">
                <Phone size={16} className="absolute left-3 text-zinc-400" />
                <input type="tel" name="noTelepon" value={profile.noTelepon} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800 transition-colors" required />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex justify-end mt-4">
            <button type="submit" className="px-5 py-2.5 bg-[#58a27d] hover:bg-[#478767] text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-md shadow-[#58a27d]/10 hover:shadow-lg transition-all cursor-pointer">
              <Save size={16} /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}