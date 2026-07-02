import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Filter, Shield, UserCheck, ArrowLeft } from 'lucide-react';
import TambahUser from './TambahUser';
import EditUser from './EditUser';

const initialUsersData = [
  { id: 'USR-001', name: 'Chico Diar Ramadhan', email: 'chico.diar@bsn.go.id', role: 'Admin', status: 'Aktif' },
  { id: 'USR-003', name: 'Ahmad Subarjo', email: 'ahmad.subarjo@bsn.go.id', role: 'Staff', status: 'Aktif' },
  { id: 'USR-004', name: 'Siti Rahmawati', email: 'siti.rahma@bsn.go.id', role: 'Admin', status: 'Aktif' },
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsersData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // STATE SEARCH & FILTER
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus hak akses akun untuk ${name} (${id})?`)) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // LOGIKA PEMPROSESAN DATA USER (LIVE SEARCH & FILTER ROLE)
  const processedUsers = users
    .filter(user => (roleFilter === 'Semua' ? true : user.role === roleFilter))
    .filter(user => {
      const query = searchQuery.toLowerCase();
      return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#00805e]">Manajemen Hak Akses Akun</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Kelola verifikasi profil, peran hak akses, dan kredensial sistem logistik BSN</p>
        </div>

        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#00664b] hover:bg-[#00553e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-95 self-start md:self-auto"
        >
          <Plus size={16} /> Daftarkan User Baru
        </button>
      </div>

      {/* Kontrol Pencarian & Filter Peran */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-md border border-zinc-200/80">
        <div className="flex-1 relative flex items-center">
          <Search size={18} className="absolute left-3 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama staff atau alamat email resmi..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#00664b] focus:bg-white transition-colors"
          />
        </div>
        
        <div className="relative flex items-center bg-zinc-50 border border-zinc-200 rounded-lg px-3 hover:bg-zinc-100 transition-colors">
          <Filter size={16} className="text-zinc-500 mr-2" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent text-sm text-zinc-600 focus:outline-none cursor-pointer py-2 pr-2 font-medium"
          >
            <option value="Semua">Semua Peran / Role</option>
            <option value="Admin">Admin Utama</option>
            <option value="Staff">Staff Gudang</option>
          </select>
        </div>
      </div>

      {/* Tabel Utama User dengan Header Emerald BSN */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#58a27d] text-white text-xs uppercase font-semibold tracking-wider border-b border-[#58a27d]">
                <th className="p-4 rounded-tl-xl">ID User</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Email Resmi</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right rounded-tr-xl">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {processedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-400 font-medium bg-zinc-50/30">
                    Tidak ditemukan data user yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                processedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/40 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-zinc-900 bg-zinc-50/30">{user.id}</td>
                    <td className="p-4 font-semibold text-zinc-900">{user.name}</td>
                    {/* Teks Email Hitam Solid */}
                    <td className="p-4 text-zinc-900 font-medium">{user.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        user.role === 'Admin' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {user.role === 'Admin' ? <Shield size={12} /> : <UserCheck size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block w-2 height w-2 rounded-full mr-2 ${user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                      <span className={`text-xs font-semibold ${user.status === 'Aktif' ? 'text-zinc-800' : 'text-zinc-400'}`}>{user.status}</span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-flex items-center"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all inline-flex items-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && <TambahUser onClose={() => setIsAddOpen(false)} />}
      {isEditOpen && <EditUser userData={selectedUser} onClose={() => setIsEditOpen(false)} />}

    </div>
  );
}