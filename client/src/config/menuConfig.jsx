import { LayoutDashboard, Package, FileText, Users, CheckSquare, PlusCircle, BoxIcon } from 'lucide-react';

export const menuConfig = {
  admin: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Stok Barang', icon: <Package size={20}/> },
    { name: 'Manajemen User', icon: <Users size={20}/> },
    { name: 'Kategori Barang', icon: <BoxIcon size={20}/> },
    { name: 'Laporan Global', icon: <FileText size={20}/> },
  ],
  manager: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Approval Request', icon: <CheckSquare size={20}/> },
    { name: 'Laporan Keuangan', icon: <FileText size={20}/> },
  ],
  user: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Barang Saya', icon: <Package size={20}/> },
    { name: 'Ajukan Peminjaman', icon: <PlusCircle size={20}/> },
  ]
};