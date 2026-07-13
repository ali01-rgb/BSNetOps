import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, LogOut, ChevronDown, CheckCircle2, XCircle, PackagePlus, Clock, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ isOpen, setIsOpen, role = 'manager' }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const initialNotifications = {
    user: [
      { id: 1, title: 'Permintaan Disetujui', message: 'Pengajuan Laptop Dell Latitude 5430 telah disetujui Manajer.', time: '5 menit lalu', type: 'approved', isRead: false },
      { id: 2, title: 'Permintaan Ditolak', message: 'Pengajuan Kamera Sony Alpha A7 II ditolak.', time: '1 jam lalu', type: 'rejected', isRead: false },
    ],
    admin: [
      { id: 1, title: 'History Permintaan Baru', message: 'Chico Diar telah mengambil MacBook Pro 14".', time: '10 menit lalu', type: 'history', isRead: false },
      { id: 2, title: 'Permintaan Dicatat', message: 'Iwak Peyek mengajukan permintaan Kertas HVS A4.', time: '2 jam lalu', type: 'history', isRead: false },
      { id: 3, title: 'STOK RENDAH', message: 'Kertas HVS A4 kurang dari standar aman (<5)', time: '2 menit lalu', type: 'alert', isRead: false },
    ],
    manager: [
      { id: 1, title: 'Pengajuan Request Baru', message: 'Chico Diar (IT) mengajukan permintaan Laptop Dell Latitude 5430.', time: '2 menit lalu', type: 'request', isRead: false },
      { id: 2, title: 'Pengajuan Request Baru', message: 'Rina Amelia (Finance) mengajukan permintaan Printer Canon.', time: '30 menit lalu', type: 'request', isRead: false },
    ]
  };

  const [notifications, setNotifications] = useState(initialNotifications);
  const currentNotifs = notifications[role] || [];
  const unreadCount = currentNotifs.filter(n => !n.isRead).length;

  // Fungsi tandai satu notifikasi sebagai sudah dibaca
  const markAsRead = (id) => {
    setNotifications(prev => ({
      ...prev,
      [role]: prev[role].map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
  };

  const markAllAsRead = () => {
    setNotifications(prev => ({
      ...prev,
      [role]: prev[role].map(n => ({ ...n, isRead: true }))
    }));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    navigate('/');
  };

  const renderNotifIcon = (type) => {
    switch (type) {
      case 'approved': return <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />;
      case 'rejected': return <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />;
      case 'request': return <PackagePlus size={16} className="text-blue-600 shrink-0 mt-0.5" />;
      case 'alert': return <TriangleAlert size={16} className="text-red-600 shrink-0 mt-0.5" />;
      default: return <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <header className="h-16 bg-[#00664b] flex items-center px-6 justify-between text-white shadow-md relative z-50 print:hidden select-none">
      <div className="flex items-center gap-4">
        {!isOpen && (
          <button onClick={() => setIsOpen(true)} className="hover:text-zinc-200 transition-colors cursor-pointer">
            <Menu size={24} />
          </button>
        )}
        <img src="/logobsn.png" alt="Logo" className="h-8 w-auto" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
            className="p-2 rounded-full hover:bg-white/10 transition-all relative cursor-pointer"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 shadow-xl rounded-xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50 text-zinc-700">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">Notifikasi</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-[#dcfce7] text-[#00664b] rounded-md capitalize tracking-wide border border-[#bbf7d0]">
                    {role}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] font-bold text-[#00664b] hover:underline cursor-pointer">
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100">
                {currentNotifs.length === 0 ? (
                  <div className="p-6 text-center text-zinc-400 text-xs font-medium">Tidak ada notifikasi baru</div>
                ) : (
                  currentNotifs.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3.5 flex gap-3 hover:bg-zinc-50 transition-colors cursor-pointer relative ${
                        !notif.isRead ? (notif.type === 'alert' ? 'bg-red-50/60' : 'bg-emerald-50/30') : 'bg-white'
                      }`}
                    >
                      {/* Titik Indikator Baru */}
                      {!notif.isRead && <div className="absolute left-1 top-5 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                      
                      {renderNotifIcon(notif.type)}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${notif.type === 'alert' ? 'text-red-700' : (!notif.isRead ? 'text-zinc-900' : 'text-zinc-400')}`}>
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-zinc-400 font-medium">{notif.time}</span>
                        </div>
                        <p className={`text-[11px] leading-snug ${notif.type === 'alert' ? 'text-red-600 font-medium' : (!notif.isRead ? 'text-zinc-600' : 'text-zinc-400')}`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }} className="flex items-center gap-2 cursor-pointer group focus:outline-none text-white">
            <img src="https://ui-avatars.com/api/?name=Chico+Diar&background=random" className="h-8 w-8 rounded-full border border-white/40" alt="Profile" />
            <ChevronDown size={14} className={`text-white/70 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-zinc-200 shadow-xl rounded-xl p-1.5 animate-in fade-in zoom-in-95 z-50 text-zinc-700">
              <div className="px-3 py-1.5 border-b border-zinc-100 mb-1 select-none">
                <p className="text-xs font-bold text-zinc-800">Chico Diar</p>
                <p className="text-[10px] text-zinc-400 capitalize font-medium">{role}</p>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                <LogOut size={15} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}