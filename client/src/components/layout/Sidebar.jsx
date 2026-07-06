import React from 'react';
import { X, Settings } from 'lucide-react';
import { menuConfig } from '../../config/menuConfig';

export default function Sidebar({ role, isOpen, setIsOpen }) {
  const activeMenu = menuConfig[role] || [];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-zinc-950 transition-all duration-500 overflow-hidden text-zinc-100 flex flex-col shrink-0`}>
      <div className="p-6 flex items-center justify-between border-b border-zinc-800">
        <span className="text-xl font-bold">Menu</span>
        <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
          <X size={16} />
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {activeMenu.map((item) => (
          <a key={item.name} href="#" className="flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-lg transition-colors">
            {item.icon} {item.name}
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800 mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://ui-avatars.com/api/?name=Chico+Diar&background=random" className="h-10 w-10 rounded-full border border-zinc-700" alt="Profile" />
          <div className="flex flex-col text-xs">
            <span className="font-medium">Chico Diar</span>
            <span className="text-zinc-500 capitalize">{role}</span>
          </div>
        </div>
        <Settings size={18} className="text-zinc-500 cursor-pointer hover:text-white" />
      </div>
    </aside>
  );
}