<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ================= 1. IMPOR HALAMAN UTAMA & AUTH (YANG BARU KAMU TARIK) =================
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// ================= 2. IMPOR LAYOUT STRUKTUR (MILIKMU) =================
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// ================= 3. IMPOR KOMPONEN MODULAR DALEMAN =================
// FIX: Jalur impor dashboard disesuaikan agar sejajar di dalam folder /pages/ sesuai image_dc974a.png
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

// Subfolder Admin Pages
import StokBarang from './pages/admin/stokbarang/StokBarang';
import UserManagement from './pages/admin/manajemenuser/UserManagement'; 
import KategoriBarang from './pages/admin/kategoribarang/KategoriBarang';
import HistoryPeminjaman from './pages/admin/history/HistoryPeminjaman';
import EditProfil from './pages/admin/user/EditProfil';

// Subfolder Manager Pages
import ApprovalRequest from './pages/manager/appreq/ApprovalRequest';
import AsetKantor from './pages/manager/asetkantor/AsetKantor';

// Subfolder User/Staff Pages
import Aset from './pages/user/aset/Aset';
import AjukanPermintaan from './pages/user/permintaan/AjukanPermintaan';
import RiwayatPermintaan from './pages/user/riwayat/RiwayatPermintaan';

// Layout Wrapper khusus daleman agar Sidebar & Header mengunci sempurna
function DashboardLayout({ role, currentView, setCurrentView, children }) {
  const [isOpen, setIsOpen] = useState(() => JSON.parse(localStorage.getItem('sidebarOpen')) ?? true);

  useEffect(() => { 
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen)); 
  }, [isOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 select-none">
      <Sidebar 
        role={role} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
      <div className="flex-1 h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#00664b]/90 via-zinc-70 to-zinc-30">
        <Header isOpen={isOpen} setIsOpen={setIsOpen} role={role} />
        <main className="flex-1 p-8 overflow-y-auto animate-in fade-in duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <BrowserRouter>
      <Routes>
        {/* Route Umum & Halaman Depan */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ================= ROUTE ROLE: ADMIN ================= */}
        <Route path="/admin" element={
          <DashboardLayout role="admin" currentView={currentView} setCurrentView={setCurrentView}>
            {currentView === 'dashboard' && <AdminDashboard />}
            {currentView === 'stok-barang' && <StokBarang role="admin" />}
            {currentView === 'manajemen-user' && <UserManagement />}
            {currentView === 'kategori-barang' && <KategoriBarang />}
            {currentView === 'history-peminjaman' && <HistoryPeminjaman />}
            {currentView === 'edit-profil' && <EditProfil />}
          </DashboardLayout>
        } />

        {/* ================= ROUTE ROLE: MANAGER ================= */}
        <Route path="/manager" element={
          <DashboardLayout role="manager" currentView={currentView} setCurrentView={setCurrentView}>
            {currentView === 'dashboard' && <ManagerDashboard />}
            {currentView === 'approval-request' && <ApprovalRequest />}
            {currentView === 'aset-kantor' && <AsetKantor />}
            {currentView === 'edit-profil' && <EditProfil />}
          </DashboardLayout>
        } />

        {/* ================= ROUTE ROLE: USER ================= */}
        <Route path="/user" element={
          <DashboardLayout role="user" currentView={currentView} setCurrentView={setCurrentView}>
            {currentView === 'dashboard' && <UserDashboard />}
            {currentView === 'aset' && <Aset />}
            {currentView === 'ajukan-permintaan' && <AjukanPermintaan />}
            {currentView === 'riwayat-permintaan' && <RiwayatPermintaan />}
            {currentView === 'edit-profil' && <EditProfil />}
          </DashboardLayout>
        } />

        {/* Keamanan: kalau ngetik sembarang langsung dilempar ke landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );                                                                          
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Landing Page
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Dashboard
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import UserDashboard from "./pages/UserDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );                                                                        
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
}