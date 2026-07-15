<<<<<<< HEAD
import { LayoutDashboard, Package, FileText, Users, CheckSquare, PlusCircle, BoxIcon } from 'lucide-react';
=======
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  CheckSquare, 
  PlusCircle, 
  Boxes, 
  History,
  FileText,
  ActivityIcon
} from 'lucide-react';
>>>>>>> 862821d8ca357898e505ab42b7a7f2e9c6e1d05f

export const menuConfig = {
  admin: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Stok Barang', icon: <Package size={20}/> },
    { name: 'Manajemen User', icon: <Users size={20}/> },
<<<<<<< HEAD
    { name: 'Kategori Barang', icon: <BoxIcon size={20}/> },
    { name: 'Laporan Global', icon: <FileText size={20}/> },
=======
    { name: 'Kategori Barang', icon: <Boxes size={20}/> },
    { name: 'Log Aktifitas', icon: <ActivityIcon size={20}/> },
>>>>>>> 862821d8ca357898e505ab42b7a7f2e9c6e1d05f
  ],
  manager: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Approval Request', icon: <CheckSquare size={20}/> },
<<<<<<< HEAD
    { name: 'Laporan Keuangan', icon: <FileText size={20}/> },
=======
    { name: 'Activity Log', icon: <ActivityIcon size={20}/>},
>>>>>>> 862821d8ca357898e505ab42b7a7f2e9c6e1d05f
  ],
  user: [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Barang Saya', icon: <Package size={20}/> },
    { name: 'Ajukan Peminjaman', icon: <PlusCircle size={20}/> },
  ]
};