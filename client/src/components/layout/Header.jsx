import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 🔥 IMPOR INI: Mengaktifkan kendali navigasi router

// FIX: Menambahkan destructuring props 'role' dengan default value 'manager'
export default function Header({ isOpen, setIsOpen, role = 'manager', notificationCount = 3 }) {
  const navigate = useNavigate(); // 🔥 INISIALISASI NAVIGATE
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Efek klik di luar untuk menutup dropdown otomatis
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔥 FUNGSI LOGOUT YANG SUDAH DIFUNGSIKAN KE LANDING PAGE
  const handleLogout = () => {
    setDropdownOpen(false);
    // Langsung pindah ke halaman root / landing page temanmu
    navigate('/');
  };

  return (
    <header className="h-16 bg-[#00664b] flex items-center px-6 justify-between text-white shadow-md relative z-50">
      {/* Bagian Kiri: Tombol Menu & Logo */}
      <div className="flex items-center gap-4">
        {!isOpen && (
          <button onClick={() => setIsOpen(true)} className="hover:text-zinc-200 transition-colors cursor-pointer">
            <Menu size={24} />
          </button>
        )}
        <img src="/logobsn.png" alt="Logo" className="h-8 w-auto" />
      </div>
      
      {/* Bagian Kanan: Lonceng Notifikasi & Foto Profil Pembuka Dropdown */}
      <div className="flex items-center gap-4">
        {/* Tombol Lonceng Notifikasi */}
        <button className="p-2 rounded-full hover:bg-white/10 transition-all relative cursor-pointer">
          <Bell size={25} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Pembungkus Dropdown Profil */}
        <div className="relative" ref={dropdownRef}>
          {/* Komponen Foto Profil */}
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer group focus:outline-none bg-transparent border-none text-white"
          >
            <img 
              src="https://ui-avatars.com/api/?name=Chico+Diar&background=random" 
              className="h-8 w-8 rounded-full border border-white/40 group-hover:border-white transition-all shadow-sm" 
              alt="Profile" 
            />
            {/* Animasi panah kecil berputar */}
            <ChevronDown 
              size={14} 
              className={`text-white/70 group-hover:text-white transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* MENONGOL DI BAWAHNYA: DROPDOWN LOGOUT */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-zinc-200 shadow-xl rounded-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-zinc-700">
              
              {/* Info akun singkat biar estetik */}
              <div className="px-3 py-1.5 border-b border-zinc-100 mb-1 select-none">
                <p className="text-xs font-bold text-zinc-800">Chico Diar</p>
                {/* FIX: Teks 'Admin' diganti dinamis menggunakan data props role & di-capitalize */}
                <p className="text-[10px] text-zinc-400 capitalize font-medium">{role}</p>
              </div>

              {/* Tombol Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer text-left group"
              >
                <LogOut size={15} className="text-red-500 group-hover:translate-x-0.5 transition-transform" />
                <span>Logout.</span>
              </button>
              
            </div>
          )}
        </div>
      </div>
    </header>
  );
}