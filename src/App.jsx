import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Impor semua halaman dashboard sesuai role
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

export default function App() {
  // Anda tinggal mengganti string di bawah menjadi 'user', 'manager', atau 'admin'
  const [role, setRole] = useState('admin');
  const [isOpen, setIsOpen] = useState(() => JSON.parse(localStorage.getItem('sidebarOpen')) ?? true);

  useEffect(() => { 
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen)); 
  }, [isOpen]);

  return (
    <div className="flex min-h-screen bg-linear-to-b from-[#00664b]/10 to-zinc-50">
      {/* Sidebar otomatis berubah menu & profil berdasarkan role */}
      <Sidebar role={role} isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        
        <main className="p-8 animate-in fade-in duration-700">
          {/* Kondisi rendering berdasarkan role aktif */}
          {role === 'admin' && <AdminDashboard />}
          {role === 'manager' && <ManagerDashboard />}
          {role === 'user' && <UserDashboard />}
        </main>
      </div>
    </div>
  );
}