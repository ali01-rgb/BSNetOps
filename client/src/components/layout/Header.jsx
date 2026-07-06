<<<<<<< HEAD
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
=======
import React from 'react';
import { Menu, Bell } from 'lucide-react';
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539

export default function Header({ isOpen, setIsOpen, notificationCount = 3 }) {
  return (
    <header className="h-16 bg-[#00664b] flex items-center px-6 justify-between text-white shadow-md">
      {/* Bagian Kiri: Tombol Menu & Logo */}
      <div className="flex items-center gap-4">
        {!isOpen && (
          <button onClick={() => setIsOpen(true)} className="hover:text-zinc-200 transition-colors">
            <Menu size={24} />
          </button>
        )}
        <img src="/logobsn.png" alt="Logo" className="h-8 w-auto" />
      </div>
      
      {/* Bagian Kanan: Lonceng Notifikasi & Foto Profil */}
      <div className="flex items-center gap-4">
        {/* Tombol Lonceng Notifikasi */}
        <button className="p-2 rounded-full hover:bg-white/10 transition-all relative">
          <Bell size={25} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Komponen Foto Profil */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <img 
            src="https://ui-avatars.com/api/?name=Chico+Diar&background=random" 
            className="h-8 w-8 rounded-full border border-white/40 group-hover:border-white transition-all" 
            alt="Profile" 
          />
        </div>
      </div>
    </header>
  );
}