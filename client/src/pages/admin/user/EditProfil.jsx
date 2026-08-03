import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Camera, Save, Building, Briefcase, Phone, Loader2 } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_URL } from '../../api'; // Sesuaikan path jika perlu

export default function EditProfil() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    namaLengkap: '',
    nipPegawai: '',
    email: '',
    divisi: '',
    jabatan: 'LOADING...', 
    noTelepon: '',
    avatar: null
  });

  const fileInputRef = useRef(null);
  const controls = useAnimation(); 

  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: { type: "spring", mass: 0.7, stiffness: 220, damping: 20 }
    });

    const handleClose = () => {
      controls.start({
        opacity: 0,
        scale: 0.02, 
        x: "-40vw", 
        y: "40vh",  
        transition: { type: "spring", mass: 0.5, stiffness: 250, damping: 22 }
      });
    };

    window.addEventListener('closeProfileAnimation', handleClose);
    return () => window.removeEventListener('closeProfileAnimation', handleClose);
  }, [controls]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile({
            namaLengkap: data.fullName || '',
            nipPegawai: data.employeeId || '',
            email: data.email || '',
            divisi: data.divisi || '',
            jabatan: data.role || '', 
            noTelepon: data.phone || '',
            avatar: data.avatar || null
          });
        }
      } catch (err) {
        console.error("Gagal load profil dari DB", err);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 🔥 VALIDASI DOMAIN EMAIL BSN
    const allowedDomains = ["@btn.co.id", "@bankbsn.co.id", "@bsn.co.id"];
    const isDomainValid = allowedDomains.some(domain => profile.email.toLowerCase().endsWith(domain));
    
    if (!isDomainValid) {
      toast.error("Gagal: Gunakan email resmi BSN (@btn.co.id, @bankbsn.co.id, @bsn.co.id)");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: profile.namaLengkap,
          employeeId: profile.nipPegawai,
          email: profile.email,
          divisi: profile.divisi,
          phone: profile.noTelepon,
          avatar: profile.avatar
        })
      });

      if (res.ok) {
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedProfile = { 
          ...currentProfile, 
          fullName: profile.namaLengkap, 
          role: profile.jabatan, 
          avatar: profile.avatar 
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        window.dispatchEvent(new CustomEvent('profileUpdated', {
          detail: { 
            fullName: profile.namaLengkap, 
            role: profile.jabatan, 
            avatar: profile.avatar
          }
        }));

        toast.success('Profil berhasil diperbarui dan disinkronkan ke Database!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Gagal menyimpan ke database. Cek koneksi server.');
      }
    } catch (err) {
      toast.error('Backend NestJS error atau tidak merespons.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.02, x: "-40vw", y: "40vh" }}
      animate={controls}
      style={{ transformOrigin: "bottom left" }}
      className="max-w-2xl mx-auto space-y-6 pb-12"
    >
      
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Pengaturan Akun</h2>
        <p className="text-xs text-white/80 mt-0.5 font-medium">Kelola identitas personal dan info kontak Anda</p>
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
                  {profile.namaLengkap ? profile.namaLengkap.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : profile.jabatan.substring(0,2).toUpperCase()}
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
              <p className="text-xs text-zinc-400 mt-0.5">Klik kamera untuk upload foto baru</p>
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
                {/* 🔥 FIELD DI-DISABLE */}
                <input 
                  type="text" 
                  name="nipPegawai" 
                  value={profile.nipPegawai} 
                  disabled 
                  className="w-full pl-10 pr-4 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-600 font-bold cursor-not-allowed select-none" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Unit</label>
              <div className="relative flex items-center">
                <Building size={16} className="absolute left-3 text-zinc-400" />
                <select 
                  name="divisi" 
                  value={profile.divisi} 
                  onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800 transition-colors cursor-pointer" 
                  required
                >
                  <option value="" disabled hidden>Pilih Unit</option>
                  <option value="KC Semarang">KC Semarang</option>
                  <option value="KCP Majapahit">KCP Majapahit</option>
                  <option value="KCP Ngaliyan">KCP Ngaliyan</option>
                  <option value="KCP Ungaran">KCP Ungaran</option>
                  <option value="KCP Kendal">KCP Kendal</option>
                  <option value="KCP Kudus">KCP Kudus</option>
                  <option value="KCP Magelang">KCP Magelang</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Jabatan / Role</label>
              <div className="relative flex items-center">
                <Briefcase size={16} className="absolute left-3 text-zinc-400" />
                {/* 🔥 FIELD DI-DISABLE */}
                <input 
                  type="text" 
                  name="jabatan" 
                  value={profile.jabatan} 
                  disabled 
                  className="w-full pl-10 pr-4 py-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-600 font-bold uppercase cursor-not-allowed select-none" 
                />
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
                <input type="tel" name="noTelepon" value={profile.noTelepon} onChange={handleChange} placeholder="Masukkan No Telephone" className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#58a27d] focus:bg-white font-medium text-zinc-800 transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex justify-end mt-4">
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-[#58a27d] hover:bg-[#478767] text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-md shadow-[#58a27d]/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}