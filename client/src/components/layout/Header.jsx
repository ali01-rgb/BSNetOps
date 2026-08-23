import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, LogOut, ChevronDown, PackagePlus, TriangleAlert, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/api';

export default function Header({ isOpen, setIsOpen, role = 'admin', setCurrentView }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const [userData, setUserData] = useState({ fullName: 'Loading...', avatar: null, role: role });
  
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // 🔥 FETCH NOTIFIKASI & FILTER OTOMATIS (LEWAT 1 HARI)
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const resJson = await res.json();
        const dataList = resJson.data || resJson; 
        
        if (Array.isArray(dataList)) {
          const now = new Date();
          
          // Filter: Jika sudah dibaca dan lewat 24 jam, hilangkan dari UI (hapus otomatis)
          const validNotifs = dataList.filter(n => {
            const isRead = n.isRead || n.is_read;
            const notifDate = new Date(n.createdAt || n.created_at);
            const diffHours = (now - notifDate) / (1000 * 60 * 60);
            
            if (isRead && diffHours >= 24) return false;
            return true;
          });

          validNotifs.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
          
          const formattedNotifs = validNotifs.map(n => ({
            id: n.id,
            title: n.title || n.judul || 'Pemberitahuan',
            message: n.message || n.pesan || '',
            type: n.type || n.tipe || 'request',
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

  // 🔥 FUNGSI KLIK NOTIF 
  const handleNotifClick = async (id, target) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    if (target && setCurrentView) {
      setCurrentView(target);
      setNotifOpen(false);
    }

    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal update status read:", error);
    }
  };

  // 🔥 FUNGSI TANDAI SEMUA DIBACA
  const markAllAsRead = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal tandai semua dibaca:", error);
    }
  };

  // 🔥 FUNGSI HAPUS SATU NOTIFIKASI
  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal menghapus notifikasi:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        const res = await fetch(`${API_URL}/auth/profile`, {
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
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000); 
    return () => clearInterval(interval);
  }, [role]);

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

  const renderNotifIcon = (type, isUnread) => {
    const iconClass = isUnread ? "text-blue-600" : "text-zinc-400";
    const alertClass = isUnread ? "text-red-600" : "text-zinc-400";

    switch (type) {
      case 'alert': 
        return <TriangleAlert size={18} className={alertClass} />;
      case 'request': 
        return <PackagePlus size={18} className={iconClass} />;
      default: 
        return <Bell size={18} className={iconClass} />;
    }
  };

  // 🔥 FORMAT TANGGAL SESUAI GAMBAR (e.g., 22 aug, 22.38)
  const formatNotifDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('id-ID', { month: 'short' }).toLowerCase();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month}, ${hours}.${minutes}`;
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
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white border border-zinc-200 shadow-2xl rounded-xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50 text-zinc-700">
              
              {/* HEADER DROPDOWN NOTIFIKASI */}
              <div className="px-4 py-3 bg-white border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-zinc-900">Notifikasi :</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e7f0ec] text-[#00664b] rounded-md capitalize tracking-wide">
                    {userData.role}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead} 
                      className="text-[11px] font-semibold text-[#00664b] hover:text-[#004d38] cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              </div>

              {/* LIST NOTIFIKASI */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 text-xs font-medium flex flex-col items-center gap-2">
                    <Bell size={28} className="text-zinc-300 opacity-50" />
                    Belum ada pemberitahuan baru
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isUnread = !notif.isRead;

                    return (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotifClick(notif.id, notif.target)}
                        className="px-4 py-3 flex items-start gap-3 cursor-pointer relative group bg-white hover:bg-zinc-50 border-b border-zinc-100 last:border-0"
                      >
                        {/* 🔥 Ikon & Dot diberi shrink-0 agar tidak mengecil/gepeng */}
                        <div className="flex items-center gap-2 pt-0.5 shrink-0">
                          {isUnread ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 shrink-0" /> 
                          )}
                          {renderNotifIcon(notif.type, isUnread)}
                        </div>

                        {/* 🔥 min-w-0 + break-words agar teks panjang otomatis turun ke baris berikutnya */}
                        <div className="flex-1 min-w-0 pr-6">
                          <p className={`text-[13px] font-bold mb-0.5 break-words leading-snug ${isUnread ? 'text-zinc-900' : 'text-zinc-500'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-[11px] leading-relaxed mb-1.5 break-words ${isUnread ? 'text-zinc-700 font-medium' : 'text-zinc-400'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-medium">
                            {formatNotifDate(notif.createdAt)}
                          </p>
                        </div>

                        {/* 🔥 TOMBOL X UNTUK HAPUS */}
                        <button
                          onClick={(e) => handleDeleteNotif(e, notif.id)}
                          className="absolute right-3 top-3.5 p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                          title="Hapus"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
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