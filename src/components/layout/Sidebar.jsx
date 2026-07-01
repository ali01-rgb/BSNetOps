import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { menuConfig } from '../../config/menuConfig';

export default function Sidebar({ role, isOpen, setIsOpen, currentView, setCurrentView }) {
  const menus = menuConfig[role] || [];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-zinc-900 text-zinc-400 min-h-screen p-4 flex flex-col justify-between transition-all duration-300 border-r border-zinc-800`}>
      {/* Bagian Atas: Logo & Menu Utama */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 py-3 border-b border-zinc-800">
          <h2 className={`font-bold text-white tracking-wider transition-all ${isOpen ? 'text-lg block' : 'text-xs text-center w-full'}`}>
            {isOpen ? 'BSN INVENTORY' : 'BSN'}
          </h2>
        </div>

        <nav className="space-y-1.5">
          {menus.map((item, index) => {
            const menuId = item.name.toLowerCase().replace(/\s+/g, '-');
            const isActive = currentView === menuId;
            return (
              <button
                key={index}
                onClick={() => setCurrentView(menuId)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#58a27d] text-white shadow-md shadow-[#58a27d]/20' 
                    : 'hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                <div className="shrink-0">{item.icon}</div>
                {isOpen && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bagian Bawah: Profil Pengguna & Gear */}
      <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[#58a27d]/20 border border-[#58a27d]/40 flex items-center justify-center font-bold text-white shrink-0 text-sm">
            CD
          </div>
          {isOpen && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-zinc-200 truncate">Chico Diar</span>
              <span className="text-[10px] capitalize tracking-wider font-semibold text-[#58a27d]">{role}</span>
            </div>
          )}
        </div>

        {/* IKON GEAR DENGAN ANIMASI ROTASI HALUS */}
        <button 
          onClick={() => setCurrentView('edit-profil')}
          className={`p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer group`}
          title="Pengaturan Profil"
        >
          <Settings 
            size={18} 
            className="transform group-hover:rotate-90 transition-transform duration-500 ease-out" 
          />
        </button>
      </div>
    </aside>
  );
}