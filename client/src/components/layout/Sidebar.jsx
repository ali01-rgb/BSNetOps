import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { menuConfig } from '../../config/menuConfig';
import { API_URL } from '../js/api'; // 🔥 1. IMPORT API_URL (Sesuaikan titik/path foldernya jika merah)

export default function Sidebar({ role, isOpen, setIsOpen, currentView, setCurrentView }) {
  const currentMenu = menuConfig[role] || [];
  
  const [userData, setUserData] = useState({ 
    fullName: 'Loading...', 
    initials: '..',
    avatar: null,
    role: role 
  });

  const [prevView, setPrevView] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        const res = await fetch(`${API_URL}/auth/profile`, { // 🔥 REVISI URL
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const name = data.fullName || data.username || 'User BSN';
          const init = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

          setUserData({ 
            fullName: name, 
            initials: init, 
            avatar: data.avatar || null, 
            role: data.role || role 
          });
        }
      } catch (error) {
        console.error("Gagal load data profil untuk sidebar:", error);
      }
    };

    fetchUserData();

    const handleProfileUpdate = (event) => {
      const name = event.detail.fullName || 'User BSN';
      const init = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      setUserData(prev => ({
        ...prev,
        fullName: name,
        initials: init,
        avatar: event.detail.avatar !== undefined ? event.detail.avatar : prev.avatar,
        role: event.detail.role || role
      }));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [role]);

  // 🔥 Fungsi Klik Menu
  const handleMenuClick = (menuPath) => {
    if (currentView === 'edit-profil' && menuPath !== 'edit-profil') {
      window.dispatchEvent(new Event('closeProfileAnimation'));
      setTimeout(() => {
        setCurrentView(menuPath);
      }, 350); 
    } else {
      setCurrentView(menuPath);
    }
  };

  // 🔥 Fungsi Buka/Tutup Profil
  const toggleSettings = () => {
    if (currentView === 'edit-profil') {
      const nextView = prevView || currentMenu[0]?.name.toLowerCase().replace(/\s+/g, '-');
      window.dispatchEvent(new Event('closeProfileAnimation'));
      setTimeout(() => {
        setCurrentView(nextView);
      }, 350);
    } else {
      setPrevView(currentView);
      setCurrentView('edit-profil');
    }
  };

  return (
    <aside 
      className={`fixed md:sticky top-0 bottom-0 left-0 z-50 h-screen bg-[#FEFEFA] text-zinc-500 flex flex-col justify-between transition-all duration-300 print:hidden ${
        isOpen 
          ? 'w-64 p-4 opacity-100 shadow-[4px_0_24px_rgba(0,0,0,0.08)]' 
          : 'w-0 p-0 opacity-0 overflow-hidden shadow-none'
      }`}
    >
      <div className="flex flex-col h-full justify-between overflow-hidden">
        
        <div className="flex flex-col space-y-4 flex-1 overflow-y-auto pr-1 select-none">
          <div className="flex items-center justify-between px-2 py-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Menu Navigasi
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors cursor-pointer block"
              title="Tutup Menu"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {currentMenu.map((menu, idx) => {
              const menuPath = menu.name.toLowerCase().replace(/\s+/g, '-');
              const isActive = currentView === menuPath && currentView !== 'edit-profil';

              return (
                <button
                  key={idx}
                  onClick={() => handleMenuClick(menuPath)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer group ${
                    isActive 
                      ? 'bg-[#00664b] text-white shadow-sm shadow-emerald-900/10' 
                      : 'hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600'} transition-colors`}>
                    {menu.icon}
                  </span>
                  <span>{menu.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* PANEL PROFIL BOTTOM SIDEBAR */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-2 px-1 bg-white shrink-0 mt-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {userData.avatar ? (
              <img 
                src={userData.avatar} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full object-cover border border-emerald-100 shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600 shrink-0 text-xs shadow-sm">
                {userData.initials}
              </div>
            )}

            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-zinc-800 truncate">{userData.fullName}</span>
              <span className="text-[10px] capitalize tracking-wider font-bold text-emerald-600 mt-0.5">{userData.role}</span>
            </div>
          </div>

          <button 
            onClick={toggleSettings}
            className={`p-2 rounded-xl transition-all duration-300 cursor-pointer group ${
              currentView === 'edit-profil' 
                ? 'bg-zinc-800 text-white shadow-md scale-105' 
                : 'hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700'
            }`}
            title={currentView === 'edit-profil' ? "Kembali" : "Pengaturan Profil"}
          >
            <Settings 
              size={16} 
              className={`transform transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                currentView === 'edit-profil' ? 'rotate-[360deg]' : 'group-hover:rotate-90'
              }`} 
            />
          </button>
        </div>

      </div>
    </aside>
  );
}