import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Impor komponen modular berdasarkan arsitektur folder role aslimu
import AdminDashboard from './pages/admin/AdminDashboard';
import StokBarang from './pages/admin/stokbarang/StokBarang';
import UserManagement from './pages/admin/manajemenuser/UserManagement'; // Dikunci sesuai nama folder aslimu
import KategoriBarang from './pages/admin/kategoribarang/KategoriBarang';
import HistoryPeminjaman from './pages/admin/history/HistoryPeminjaman';
import UserDashboard from './pages/user/UserDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';

export default function App() {
  // Akun testing utama diset ke 'admin'
  const [role, setRole] = useState('admin');
  
  // State pengontrol halaman aktif
  const [currentView, setCurrentView] = useState('dashboard');
  const [isOpen, setIsOpen] = useState(() => JSON.parse(localStorage.getItem('sidebarOpen')) ?? true);

  useEffect(() => { 
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen)); 
  }, [isOpen]);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar pengirim state navigasi */}
      <Sidebar 
        role={role} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
      
      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#00664b]/70 via-zinc-50/50 to-zinc-50">
        <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        
        <main className="p-8 animate-in fade-in duration-700">
          
          {/* 1. ROUTE: DASHBOARD PANEL OVERVIEW */}
          {currentView === 'dashboard' && (
            <>
              {role === 'admin' && <AdminDashboard />}
              {role === 'manager' && <ManagerDashboard />}
              {role === 'user' && <UserDashboard />}
            </>
          )}

          {/* 2. ROUTE: MANAJEMEN STOK GUDANG */}
          {currentView === 'stok-barang' && <StokBarang role={role} />}

          {/* 3. ROUTE: MANAJEMEN OTORISASI USER */}
          {currentView === 'manajemen-user' && <UserManagement />}

          {/* 4. ROUTE: KATEGORI BARANG (ATK & ELEKTRONIK) */}
          {currentView === 'kategori-barang' && <KategoriBarang />}

          {/* 5. ROUTE: HISTORY PEMINJAMAN GLOBAL */}
          {currentView === 'history-peminjaman' && <HistoryPeminjaman />}

        </main>
      </div>
    </div>
  );
}