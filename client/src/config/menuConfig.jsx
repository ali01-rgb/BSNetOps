import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  CheckSquare, 
  PlusCircle, 
  BoxIcon,
  History,
  Computer
} from 'lucide-react';

export const menuConfig = {
  admin: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Stok Barang', icon: <Package size={20}/> },
    { name: 'Manajemen User', icon: <Users size={20}/> },
    { name: 'Kategori Barang', icon: <BoxIcon size={20}/> },
    { name: 'History Peminjaman', icon: <History size={20}/> },
  ],
  manager: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Approval Request', icon: <CheckSquare size={20}/> },
    { name: 'Aset Kantor', icon: <Computer size={20}/> },
  ],
  user: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Barang Saya', icon: <Package size={20}/> },
    { name: 'Ajukan Peminjaman', icon: <PlusCircle size={20}/> },
  ]
};