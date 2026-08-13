import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import LandingPage from "./pages/LandingPage";

import Bantuan from "./pages/barketentuan/Bantuan";
import SyaratKetentuan from "./pages/barketentuan/SyaratKetentuan";
import KebijakanPrivasi from "./pages/barketentuan/KebijakanPrivasi";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

import StokBarang from './pages/admin/stokbarang/StokBarang';
import UserManagement from './pages/admin/manajemenuser/UserManagement'; 
import KategoriBarang from './pages/admin/kategoribarang/KategoriBarang';
import LogAktifitasAdmin from './pages/admin/log/LogAktifitas.jsx'; 
import EditProfil from './pages/admin/user/EditProfil';
import PenyetujuanBarang from './pages/admin/penyetujuan/PenyetujuanBarang';

import ApprovalRequest from './pages/manager/appreq/ApprovalRequest';
import ActivityLogManager from './pages/manager/actlog/ActivityLog.jsx'; 

import Aset from './pages/user/aset/Aset';
import AjukanPermintaan from './pages/user/permintaan/AjukanPermintaan';
import RiwayatPermintaan from './pages/user/riwayat/RiwayatPermintaan';

// --- LAYOUT KHUSUS UNTUK HALAMAN DOKUMEN (PRIVASI, SYARAT, BANTUAN) ---
function PublicDocLayout({ title, subtitle, children }) {
  return (
    <div className="flex-1 min-h-screen flex flex-col font-['Poppins'] bg-gradient-to-b from-[#00664b]/90 via-zinc-70 to-zinc-30 select-none">
      <div className="pt-12 pb-28 px-6 md:px-12 text-center bg-[#00664b] shadow-md relative z-20">
        <p className="text-emerald-200 text-xs font-extrabold tracking-[0.2em] uppercase mb-2">
          {subtitle}
        </p>
        <div className="relative w-full flex items-center justify-center">
          <Link
            to="/"
            className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 text-xs font-medium text-emerald-100 hover:text-white transition bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20"
          >
            ← Kembali
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {title}
          </h1>
        </div>
      </div>
      <main className="flex-1 px-6 md:px-12 flex justify-center -mt-16 relative z-10 pb-20">
        {children}
      </main>
    </div>
  );
}

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

          {/* ================= ROUTE DOKUMEN PUBLIK ================= */}
          <Route path="/kebijakan-privasi" element={
            <PublicDocLayout title="Kebijakan Privasi" subtitle="Dokumen Kebijakan Internal">
              <KebijakanPrivasi />
            </PublicDocLayout>
          } />
          <Route path="/syarat-ketentuan" element={
            <PublicDocLayout title="Syarat & Ketentuan" subtitle="Dokumen Perjanjian Resmi">
              <SyaratKetentuan />
            </PublicDocLayout>
          } />
          <Route path="/bantuan" element={
            <PublicDocLayout title="Bantuan & FAQ" subtitle="Pusat Layanan & Dukungan">
              <Bantuan />
            </PublicDocLayout>
          } />

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