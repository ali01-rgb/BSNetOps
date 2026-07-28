import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, LogOut, ChevronDown, CheckCircle2, XCircle, PackagePlus, Clock, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ isOpen, setIsOpen, role = 'admin', setCurrentView }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const [userData, setUserData] = useState({ fullName: 'Loading...', avatar: null, role: role });
  
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // 🔥 1. FUNGSI NARIK NOTIFIKASI DARI BACKEND (UDAH DIPERBAIKI)
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch("http://localhost:3000/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const resJson = await res.json();
        // FIX: Tangkap array-nya, entah dibungkus di dalam "data" atau langsung array
        const dataList = resJson.data || resJson; 
        
        if (Array.isArray(dataList)) {
          // Sortir notifikasi dari yang paling baru
          dataList.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
          
          // Mapping data dari DB supaya selalu cocok sama UI (jaga-jaga beda nama kolom)
          const formattedNotifs = dataList.map(n => ({
            id: n.id,
            title: n.title || n.judul || 'Pemberitahuan',
            message: n.message || n.pesan || '',
            type: n.type || n.tipe || 'info',
            isRead: n.isRead || n.is_read || false,
            createdAt: n.createdAt || n.created_at || new Date().toISOString(),
            target: n.target || 'dashboard'
          }));
          
          setNotifications(formattedNotifs);
        }
      }
    } catch (err) {
      console.error("Gagal narik notifikasi:", err);
    }
  };

  // 🔥 2. FUNGSI KLIK NOTIF (UPDATE KE DB LALU PINDAH HALAMAN)
  const handleNotifClick = async (id, target) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    // Update UI instan (Biar ngga nunggu loading)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    if (target && setCurrentView) {
      setCurrentView(target);
      setNotifOpen(false);
    }

    // Tembak API buat ngerubah isRead: true di Database
    try {
      await fetch(`http://localhost:3000/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal update status read:", error);
    }
  };

  // 🔥 3. FUNGSI READ ALL
  const markAllAsRead = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      await fetch("http://localhost:3000/notifications/read-all", {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal tandai semua dibaca:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        const res = await fetch("http://localhost:3000/auth/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUserData({ 
            fullName: data.fullName || data.username || 'User BSN', 
            avatar: data.avatar || null, 
            role: data.role || role 
          });
        }
      } catch (error) {
        console.error("Gagal load profil:", error);
      }
    };

    fetchUserData();
    fetchNotifications(); // 🔥 Panggil notif saat Header pertama kali dirender

    // Polling tiap 30 detik buat ngecek notif baru otomatis
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, [role]);

  // Listener untuk ganti foto real-time
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      setUserData(prev => ({
        ...prev,
        fullName: event.detail.fullName || 'User BSN',
        avatar: event.detail.avatar !== undefined ? event.detail.avatar : prev.avatar,
        role: event.detail.role || role
      }));
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [role]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('userProfile');
    setDropdownOpen(false);
    navigate('/');
  };

  const renderNotifIcon = (type) => {
    switch (type) {
      case 'approved': return <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />;
      case 'rejected': return <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />;
      case 'request': return <PackagePlus size={16} className="text-blue-600 shrink-0 mt-0.5" />;
      case 'history': return <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />;
      case 'alert': return <TriangleAlert size={16} className="text-red-600 shrink-0 mt-0.5" />;
      default: return <Bell size={16} className="text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  // FUNGSI HITUNG WAKTU MUNDUR MANUAL
  const formatTime = (dateString) => {
    const notifDate = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - notifDate) / 60000); // dalam menit
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff/60)} jam lalu`;
    return `${Math.floor(diff/1440)} hari lalu`;
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
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 shadow-xl rounded-xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50 text-zinc-700">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">Notifikasi</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-[#dcfce7] text-[#00664b] rounded-md capitalize tracking-wide border border-[#bbf7d0]">
                    {userData.role}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] font-bold text-[#00664b] hover:underline cursor-pointer">
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-zinc-400 text-xs font-medium flex flex-col items-center gap-2">
                    <Bell size={24} className="text-zinc-300 opacity-50" />
                    Belum ada notifikasi
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotifClick(notif.id, notif.target)}
                      className={`p-3.5 flex gap-3 hover:bg-zinc-50 transition-colors cursor-pointer relative ${
                        !notif.isRead ? (notif.type === 'alert' ? 'bg-red-50/60' : 'bg-emerald-50/30') : 'bg-white'
                      }`}
                    >
                      {!notif.isRead && <div className="absolute left-1 top-5 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                      {renderNotifIcon(notif.type)}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${notif.type === 'alert' ? 'text-red-700' : (!notif.isRead ? 'text-zinc-900' : 'text-zinc-400')}`}>
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-zinc-400 font-medium">{formatTime(notif.createdAt)}</span>
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
            <img 
              src={userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=random`} 
              className="h-8 w-8 rounded-full border border-white/40 object-cover shrink-0" 
              alt="Profile" 
            />
            <ChevronDown size={14} className={`text-white/70 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-zinc-200 shadow-xl rounded-xl p-1.5 animate-in fade-in zoom-in-95 z-50 text-zinc-700">
              <div className="px-3 py-1.5 border-b border-zinc-100 mb-1 select-none">
                <p className="text-xs font-bold text-zinc-800 truncate">{userData.fullName}</p>
                <p className="text-[10px] text-zinc-400 capitalize font-medium">{userData.role}</p>
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