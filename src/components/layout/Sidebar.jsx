import React from 'react';
import { X, Settings } from 'lucide-react';
// Menggunakan ekstensi .jsx secara eksplisit untuk menjamin Vite melakukan bundling dengan benar
import { menuConfig } from '../../config/menuConfig.jsx';

export default function Sidebar({ role, isOpen, setIsOpen, currentView, setCurrentView }) {
  const activeMenu = menuConfig[role] || [];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-zinc-950 transition-all duration-500 overflow-hidden text-zinc-100 flex flex-col shrink-0`}>
      {/* Header Sidebar */}
      <div className="p-6 flex items-center justify-between border-b border-zinc-800">
        <span className="text-xl font-bold">Menu</span>
        <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer">
          <X size={16} />
        </button>
      </div>
      
      {/* Navigasi Menu Otomatis */}
      <nav className="flex-1 p-4 space-y-2">
        {activeMenu.map((item) => {
          // LOGIKA OTOMATIS: Mengubah "Manajemen User" -> "manajemen-user"
          const menuId = item.name.toLowerCase().replace(/\s+/g, '-');
          const isActive = currentView === menuId;

          return (
            <button
              key={item.name}
              onClick={() => setCurrentView(menuId)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left text-sm cursor-pointer ${
                isActive 
                  ? 'bg-[#00664b] text-white font-semibold shadow-md scale-[1.02]' 
                  : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile User */}
      <div className="p-4 border-t border-zinc-800 mt-auto flex items-center justify-between bg-zinc-900/30">
        <div className="flex items-center gap-3">
          <img src="https://ui-avatars.com/api/?name=Chico+Diar&background=random" className="h-10 w-10 rounded-full border border-zinc-700 shadow-xs" alt="Profile" />
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-zinc-200">Chico Diar</span>
            <span className="text-zinc-500 capitalize font-medium">{role}</span>
          </div>
        </div>
        <Settings size={18} className="text-zinc-500 cursor-pointer hover:text-white transition-colors" />
      </div>
    </aside>
  );
}