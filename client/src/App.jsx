import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Impor komponen modular berdasarkan arsitektur folder role asli
import AdminDashboard from './pages/admin/AdminDashboard';
import StokBarang from './pages/admin/stokbarang/StokBarang';
import UserManagement from './pages/admin/manajemenuser/UserManagement'; 
import KategoriBarang from './pages/admin/kategoribarang/KategoriBarang';
import HistoryPeminjaman from './pages/admin/history/HistoryPeminjaman';
import EditProfil from './pages/admin/user/EditProfil';
import UserDashboard from './pages/user/UserDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ApprovalRequest from './pages/manager/appreq/ApprovalRequest';
import AsetKantor from './pages/manager/asetkantor/AsetKantor';

export default function App() {
  // Akun testing utama diset ke 'manager'
  const [role, setRole] = useState('manager');
  
  // State pengontrol halaman aktif
  const [currentView, setCurrentView] = useState('dashboard');
  const [isOpen, setIsOpen] = useState(() => JSON.parse(localStorage.getItem('sidebarOpen')) ?? true);

  useEffect(() => { 
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen)); 
  }, [isOpen]);

  return (
    // FIX TOTAL: Menggunakan h-screen dan overflow-hidden pada root layout agar scroll terkontrol
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 select-none">
      
      {/* Sidebar pengirim state navigasi */}
      <Sidebar 
        role={role} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
      
      {/* FIX TOTAL: Ditambahkan h-screen flex flex-col overflow-hidden agar Header terkunci statis */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#00664b]/20 via-zinc-50 to-zinc-50">
        
        {/* Header Atas (Sekarang statis tidak akan ikut bergeser) */}
        <Header isOpen={isOpen} setIsOpen={setIsOpen} role={role} />
        
        {/* FIX TOTAL: main diberikan flex-1 dan overflow-y-auto sebagai wadah satu-satunya area scroll */}
        <main className="flex-1 p-8 overflow-y-auto animate-in fade-in duration-700">
          
          {/* 1. ROUTE: DASHBOARD PANEL OVERVIEW */}
          {currentView === 'dashboard' && (
            <>
              {role === 'admin' && <AdminDashboard />}
              {role === 'manager' && <ManagerDashboard />}
              {role === 'user' && <UserDashboard />}
            </>
          )}

          {/* ROUTE KHUSUS ADMIN AJA!!! */}

          {/* 2. ROUTE: MANAJEMEN STOK GUDANG */}
          {currentView === 'stok-barang' && <StokBarang role={role} />}

          {/* 3. ROUTE: MANAJEMEN OTORISASI USER */}
          {currentView === 'manajemen-user' && <UserManagement />}

          {/* 4. ROUTE: KATEGORI BARANG (ATK & ELEKTRONIK) */}
          {currentView === 'kategori-barang' && <KategoriBarang />}

          {/* 5. ROUTE: HISTORY PEMINJAMAN GLOBAL */}
          {currentView === 'history-peminjaman' && <HistoryPeminjaman />}

          {/* 6. ROUTE INTERNAL: EDIT DATA PROFIL ANGGOTA */}
          {currentView === 'edit-profil' && <EditProfil />}

          {/* ROUTE KHUSUS USER AJA!!! */}
          {}

          {/* ROUTE KHUSUS MANAGER AJA!!! */}
          {currentView === 'approval-request' && <ApprovalRequest />}
          {currentView === 'aset-kantor' && <AsetKantor />}

        </main>
      </div>
    </div>
  );
}