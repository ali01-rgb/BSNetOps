import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Impor semua komponen dashboard
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

export default function App() {
  // Set ke 'user', 'manager', atau 'admin' untuk cek masing-masing dashboard
  const [role, setRole] = useState('user');
  const [isOpen, setIsOpen] = useState(() => JSON.parse(localStorage.getItem('sidebarOpen')) ?? true);

  useEffect(() => { 
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen)); 
  }, [isOpen]);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar tetap di luar wrapper gradasi agar warnanya solid */}
      <Sidebar role={role} isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Di sini letak efek gradasi background dari atas (hijau pudar) ke bawah (putih zinc) */}
      <div className="flex-1 flex flex-col bg-linear-to-b from-[#00664b]/50 to-zinc-50">
        <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        
        <main className="p-8 animate-in fade-in duration-700">
          {/* Kondisi rendering halaman berdasarkan role */}
          {role === 'admin' && <AdminDashboard />}
          {role === 'manager' && <ManagerDashboard />}
          {role === 'user' && <UserDashboard />}
        </main>
      </div>
    </div>
  );
}