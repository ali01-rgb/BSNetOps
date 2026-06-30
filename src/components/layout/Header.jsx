import React from 'react';
import { Menu, Bell } from 'lucide-react';

export default function Header({ isOpen, setIsOpen, notificationCount = 3 }) {
  return (
    <header className="h-16 bg-[#00664b] flex items-center px-6 justify-between text-white shadow-md">
      <div className="flex items-center gap-4">
        {!isOpen && <button onClick={() => setIsOpen(true)} className="hover:text-zinc-200"><Menu size={24} /></button>}
        <img src="/logobsn.png" alt="Logo" className="h-8 w-auto" />
      </div>
      <button className="p-2 rounded-full hover:bg-white/10 transition-all relative">
        <Bell size={20} />
        {notificationCount > 0 && <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full">{notificationCount}</span>}
      </button>
    </header>
  );
}