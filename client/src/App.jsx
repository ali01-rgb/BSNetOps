import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast'; // 🔥 1. IMPORT TOASTER DI SINI

import LandingPage from "./pages/LandingPage";
import bantuan from "./pages/barketentuan/Bantuan";
import syaratKetentuan from "./pages/barketentuan/SyaratKetentuan";
import kebijakanPrivasi from "./pages/barketentuan/KebijakanPrivasi";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

// --- IMPORT COMPONENT ADMIN ---
import StokBarang from './pages/admin/stokbarang/StokBarang';
import UserManagement from './pages/admin/manajemenuser/UserManagement'; 
import KategoriBarang from './pages/admin/kategoribarang/KategoriBarang';
import LogAktifitasAdmin from './pages/admin/log/LogAktifitas.jsx'; 
import EditProfil from './pages/admin/user/EditProfil';
import PenyetujuanBarang from './pages/admin/penyetujuan/PenyetujuanBarang';

// --- IMPORT COMPONENT MANAGER ---
import ApprovalRequest from './pages/manager/appreq/ApprovalRequest';
import ActivityLogManager from './pages/manager/actlog/ActivityLog.jsx'; 

// --- IMPORT COMPONENT USER ---
import Aset from './pages/user/aset/Aset';
import AjukanPermintaan from './pages/user/permintaan/AjukanPermintaan';
import RiwayatPermintaan from './pages/user/riwayat/RiwayatPermintaan';

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
        <Header 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
          role={role} 
          setCurrentView={setCurrentView} 
        />
        <main className="flex-1 p-8 overflow-y-auto animate-in fade-in duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ allowedRole, children }) {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const userRole = (userProfile.role || '').toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole.toLowerCase()) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'access_token' || e.key === 'userProfile') {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      {/* 🔥 2. PASANG LAYAR TV (TOASTER) DI SINI */}
      {/* Ini akan membuat notif bisa muncul di halaman mana pun */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
          }
        }} 
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ================= ROUTE ROLE: ADMIN ================= */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <DashboardLayout role="admin" currentView={currentView} setCurrentView={setCurrentView}>
                {currentView === 'dashboard' && <AdminDashboard />}
                {currentView === 'stok-barang' && <StokBarang role="admin" />}
                {currentView === 'manajemen-user' && <UserManagement />}
                {currentView === 'kategori-barang' && <KategoriBarang />}
                {currentView === 'penyetujuan-barang' && <PenyetujuanBarang />}
                {currentView === 'activity-log' && <LogAktifitasAdmin />} 
                {currentView === 'edit-profil' && <EditProfil />}
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ================= ROUTE ROLE: MANAGER ================= */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRole="manager">
              <DashboardLayout role="manager" currentView={currentView} setCurrentView={setCurrentView}>
                {currentView === 'dashboard' && <ManagerDashboard />}
                {currentView === 'approval-request' && <ApprovalRequest />}
                {currentView === 'edit-profil' && <EditProfil />}
                {currentView === 'activity-log' && <ActivityLogManager/>} 
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ================= ROUTE ROLE: USER ================= */}
          <Route path="/user" element={
            <ProtectedRoute allowedRole="user">
              <DashboardLayout role="user" currentView={currentView} setCurrentView={setCurrentView}>
                {currentView === 'dashboard' && <UserDashboard setCurrentView={setCurrentView} />}
                {currentView === 'aset' && <Aset setCurrentView={setCurrentView} />}
                {currentView === 'ajukan-permintaan' && <AjukanPermintaan />}
                {currentView === 'riwayat-permintaan' && <RiwayatPermintaan />}
                {currentView === 'edit-profil' && <EditProfil />}
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  ); 
}

