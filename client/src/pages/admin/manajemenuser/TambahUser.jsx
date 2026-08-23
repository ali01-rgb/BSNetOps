import React, { useState, useRef } from 'react';
import { X, Save, UploadCloud, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/api';
import * as XLSX from 'xlsx';

export default function TambahUser({ onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'excel'
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form Manual
  const [formData, setFormData] = useState({ 
    name: '', 
    role: 'User', 
    cabang: 'KC Semarang',
    unit: 'CWO',
    isSuspended: false
  });

  // ======= HANDLER FORM MANUAL =======
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/inventory/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.name,
          role: formData.role.toUpperCase(), 
          cabang: formData.cabang || null,
          divisi: formData.unit || null,
          unit: formData.unit || null,
          is_suspended: formData.isSuspended
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan ke database");
      }

      toast.success(`Akun ${formData.name} berhasil didaftarkan`); 
      if (onSuccess) onSuccess(); 
      onClose(); 
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ======= HANDLER EXCEL UPLOAD =======
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast.error("Harap pilih file dengan format .xlsx atau .xls");
      }
    }
  };

  const handleExcelSubmit = async () => {
    if (!selectedFile) {
      toast.error("Pilih file Excel terlebih dahulu!");
      return;
    }
    setLoading(true);
    const loadingToast = toast.loading("Memproses dokumen...");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const parsedUsers = json.map(row => ({
          name: row['Nama Karyawan'] || row['Nama'],
          cabang: row['Penempatan Cabang'] || row['Cabang'] || null,
          unit: row['Unit'] || null,
          role: row['Posisi Hak Akses'] || row['Hak Akses'] || 'User'
        })).filter(u => u.name);

        if (parsedUsers.length === 0) throw new Error("Tidak ada data Nama Karyawan yang ditemukan di file.");

        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const res = await fetch(`${API_URL}/inventory/users/import`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ users: parsedUsers })
        });

        if (!res.ok) throw new Error("Gagal mengimpor ke database");

        toast.dismiss(loadingToast);
        toast.success(`Berhasil mengimpor ${parsedUsers.length} user!`);
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Gagal import: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[20px] shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="pt-6 px-6 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-[20px] font-bold text-zinc-900 leading-tight">Daftarkan User Baru</h3>
            <p className="text-[13px] text-zinc-500 mt-1 font-medium">
              Password Awal : <span className="text-red-500 font-bold">12345678</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-zinc-200">
          <button 
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-[14px] font-bold transition-all cursor-pointer ${
              activeTab === 'manual' 
                ? 'text-[#00634b] border-b-2 border-[#00634b]' 
                : 'text-zinc-400 hover:text-zinc-600 border-b-2 border-transparent'
            }`}
          >
            Formulir Manual
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('excel')}
            className={`flex-1 py-3 text-[14px] font-bold transition-all cursor-pointer ${
              activeTab === 'excel' 
                ? 'text-[#00634b] border-b-2 border-[#00634b]' 
                : 'text-zinc-400 hover:text-zinc-600 border-b-2 border-transparent'
            }`}
          >
            Import Excel (Otomatis)
          </button>
        </div>

        {/* CONTENT MANUAL */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-zinc-800 mb-1.5">Nama Lengkap</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Budi Setiawan" 
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#00664b] focus:ring-2 focus:ring-[#00664b]/20" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-zinc-800 mb-1.5">Hak Akses</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#00664b] focus:ring-2 focus:ring-[#00664b]/20 cursor-pointer"
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-zinc-800 mb-1.5">Cabang</label>
                <select 
                  value={formData.cabang}
                  onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#00664b] focus:ring-2 focus:ring-[#00664b]/20 cursor-pointer"
                  required
                >
                  <option value="KC Semarang">KC Semarang</option>
                  <option value="KCP Majapahit">KCP Majapahit</option>
                  <option value="KCP Ngaliyan">KCP Ngaliyan</option>
                  <option value="KCP Ungaran">KCP Ungaran</option>
                  <option value="KCP Kendal">KCP Kendal</option>
                  <option value="KCP Kudus">KCP Kudus</option>
                  <option value="KCP Magelang">KCP Magelang</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-zinc-800 mb-1.5">Unit</label>
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#00664b] focus:ring-2 focus:ring-[#00664b]/20 cursor-pointer"
                  required
                >
                  <option value="CWO">CWO</option>
                  <option value="FA & FD">FA & FD</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Teller">Teller</option>
                  <option value="FS">FS</option>
                  <option value="CS">CS</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Funding">Funding</option>
                  <option value="Consumer">Consumer</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-zinc-800 mb-1.5">Status Keaktifan Akun</label>
                <select 
                  value={formData.isSuspended ? "suspended" : "active"} 
                  onChange={(e) => setFormData({ ...formData, isSuspended: e.target.value === "suspended" })} 
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#00664b] focus:ring-2 focus:ring-[#00664b]/20 cursor-pointer"
                >
                  <option value="active">Aktif</option>
                  <option value="suspended">Ditangguhkan</option>
                </select>
              </div>
            </div>

            <div className="pt-5 flex justify-end gap-3 border-t border-zinc-100 mt-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex items-center gap-2 bg-[#00664b] hover:bg-[#004d3a] text-white px-6 py-2.5 rounded-xl text-[14px] font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save size={16} /> {loading ? 'Menyimpan...' : 'Buat Akun'}
              </button>
            </div>
          </form>
        )}

        {/* CONTENT EXCEL */}
        {activeTab === 'excel' && (
          <div className="p-6">
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={24} />
              </div>
              <h4 className="text-[15px] font-bold text-slate-800 mb-2">Upload Data Bebas</h4>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed max-w-xs mb-6">
                Sistem <b>Smart-Mapping</b> otomatis mendeteksi kolom Nama Karyawan, Penempatan Cabang, Unit, dan Hak Akses. ID BSN akan di-generate otomatis.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
              
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {selectedFile ? <FileText size={16} /> : <UploadCloud size={16} />}
                {selectedFile ? selectedFile.name : "Pilih File Excel (.xlsx)"}
              </button>
            </div>

            <div className="pt-6 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-[14px] font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleExcelSubmit} 
                disabled={loading || !selectedFile} 
                className="flex items-center gap-2 bg-[#6b8cff] hover:bg-[#5a7bed] text-white px-6 py-2.5 rounded-xl text-[14px] font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:bg-slate-300"
              >
                {loading ? 'Memproses...' : 'Mulai Import Dokumen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}