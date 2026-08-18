import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import TemplateDokumenA4 from './TemplateDokumenA4';
import toast from 'react-hot-toast';
import { API_URL } from '@/api';

export default function AjukanPermintaan() {
  const printRef = useRef();

  const savedAssets = JSON.parse(localStorage.getItem('selectedAssetData')) || [];
  const isMultiItem = Array.isArray(savedAssets) && savedAssets.length > 0;

  const savedDraft = JSON.parse(localStorage.getItem('draftFormPermintaan'));

  const [currentStep, setCurrentStep] = useState(savedDraft?.currentStep || 1);
  const [isExporting, setIsExporting] = useState(false);
  const [yearlyCount, setYearlyCount] = useState(0);
  const [calculatedPriority, setCalculatedPriority] = useState('Rendah');
  
  const [submitResult, setSubmitResult] = useState(null);
  
  const [formData, setFormData] = useState(savedDraft?.formData || {
    namaLengkap: '', nipPegawai: '', divisi: '', jabatan: '', email: '', noTelepon: '',
    tanggalDibutuhkan: ''
  });

  const [daftarBarang, setDaftarBarang] = useState(savedDraft?.daftarBarang || []);
  const [masterAssets, setMasterAssets] = useState([]); // 🔥 STATE BARU UNTUK MENAMPUNG STOK ADMIN

  // 1. HITUNG PRIORITAS BERDASARKAN HISTORY
  useEffect(() => {
    const fetchYearlyRequestsAndSetPriority = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API_URL}/inventory/my-requests`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const resJson = await res.json();
          const dataList = resJson.data || resJson;

          if (Array.isArray(dataList)) {
            const currentYear = new Date().getFullYear();
            
            const thisYearRequests = dataList.filter(r => {
              const reqDate = new Date(r.createdAt || r.created_at || Date.now());
              return reqDate.getFullYear() === currentYear;
            });

            const totalCount = thisYearRequests.length;
            setYearlyCount(totalCount);

            let autoPriority = 'Rendah';
            if (totalCount >= 50) {
              autoPriority = 'Tinggi';
            } else if (totalCount >= 25) {
              autoPriority = 'Sedang';
            }

            setCalculatedPriority(autoPriority);
          }
        }
      } catch (err) {
        console.error("Gagal menghitung prioritas tahunan:", err);
      }
    };

    fetchYearlyRequestsAndSetPriority();
  }, []);

  // 2. FETCH PROFIL LENGKAP DARI DATABASE
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          
          setFormData(prev => ({
            ...prev,
            namaLengkap: prev.namaLengkap || data.fullName || data.name || data.username || '',
            nipPegawai: data.employeeId || data.id || 'BSN-USR-001',
            divisi: prev.divisi || data.divisi || data.unit || '',
            jabatan: data.role || data.jabatan || 'User',
            email: data.email || 'user@bsn.go.id',
            noTelepon: prev.noTelepon || data.phone || data.noTelepon || ''
          }));
        }
      } catch (err) {
        console.error("Gagal menarik data profil dari server:", err);
      }
    };

    fetchUserProfile();
  }, []);

  // 🔥 3. FETCH DATA ASET ADMIN UNTUK COCOKAN STOK ASLI
  useEffect(() => {
    const fetchMasterAssets = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        const res = await fetch(`${API_URL}/inventory/assets`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const resJson = await res.json();
          const assets = resJson.data || resJson;
          if (Array.isArray(assets)) {
            setMasterAssets(assets);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil master aset:", err);
      }
    };

    fetchMasterAssets();
  }, []);

  // 4. SET BARANG DARI KERANJANG ASET
  useEffect(() => {
    if (isMultiItem) {
      const items = savedAssets.map(asset => ({
        namaAset: asset.namaAset,
        kodeAset: asset.kodeAset,
        jumlah: asset.jumlah || 1,
        keterangan: '', 
        prioritas: calculatedPriority
      }));
      setDaftarBarang(items);
      localStorage.removeItem('selectedAssetData');

      setCurrentStep(1);
      setSubmitResult(null);
      
    } else if (daftarBarang.length > 0) {
      setDaftarBarang(prev => prev.map(b => ({ ...b, prioritas: calculatedPriority })));
    }
  }, [isMultiItem, calculatedPriority]);

  // 5. AUTO SAVE DRAFT
  useEffect(() => {
    if (currentStep < 4 && (daftarBarang.length > 0 || formData.tanggalDibutuhkan || currentStep > 1)) {
      const draftData = {
        currentStep,
        formData,
        daftarBarang
      };
      localStorage.setItem('draftFormPermintaan', JSON.stringify(draftData));
    } else if (currentStep === 4) {
      localStorage.removeItem('draftFormPermintaan');
    }
  }, [currentStep, formData, daftarBarang]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQtyChange = (index, val) => {
    const updated = [...daftarBarang];
    updated[index].jumlah = parseInt(val) || 1;
    setDaftarBarang(updated);
  };

  const handleKeteranganItemChange = (index, val) => {
    const updated = [...daftarBarang];
    updated[index].keterangan = val;
    setDaftarBarang(updated);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) setCurrentStep(2);
    else if (currentStep === 2) {
      if (daftarBarang.length === 0) {
        toast.error("Belum ada barang yang diajukan. Silakan pilih kembali dari katalog.");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  };

  const handleSubmitFinal = async () => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    
    if (!token) {
      toast.error("Sesi Anda tidak valid atau telah habis. Silakan Logout dan Login kembali.");
      return;
    }

    setIsExporting(true); 

    try {
      const res = await fetch(`${API_URL}/inventory/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          nipPegawai: formData.nipPegawai,
          divisi: formData.divisi,
          jabatan: formData.jabatan,
          tanggalDibutuhkan: formData.tanggalDibutuhkan,
          items: daftarBarang.map(b => ({
            kodeAset: b.kodeAset,
            namaAset: b.namaAset,
            jumlah: b.jumlah,
            prioritas: calculatedPriority, 
            keterangan: b.keterangan
          }))
        })
      });

      const responseData = await res.json();

      if (res.ok) {
        localStorage.removeItem('selectedAssetData');
        setSubmitResult(responseData);
        toast.success("Permintaan berhasil diajukan!");
        setCurrentStep(4);
      } else {
        toast.error(`Gagal mengirim permohonan: ${responseData.message}`);
      }
    } catch (err) {
      toast.error("Error: Gagal terhubung ke server NestJS.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;
    setIsExporting(true);

    const opt = {
      margin:       0,
      filename:     `Bon_Barang_${formData.namaLengkap ? formData.namaLengkap.replace(/\s+/g, '_') : 'BSN'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const style = window.getComputedStyle(el);
            if (style.color && style.color.includes('oklch')) el.style.color = '#000000';
            if (style.backgroundColor && style.backgroundColor.includes('oklch')) el.style.backgroundColor = '#ffffff';
            if (style.borderColor && style.borderColor.includes('oklch')) el.style.borderColor = '#000000';
          });
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsExporting(false);
    }).catch((err) => {
      console.error("Error:", err);
      setIsExporting(false);
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getHighestPriority = () => {
    if (!daftarBarang || daftarBarang.length === 0) return '-';
    const weights = { 'Tinggi': 3, 'Sedang': 2, 'Rendah': 1 };
    return daftarBarang.reduce((max, item) => {
      return weights[item.prioritas] > weights[max] ? item.prioritas : max;
    }, 'Rendah');
  };

  const highestPriority = getHighestPriority();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {currentStep <= 3 && (
        <div className="w-full max-w-3xl mb-6 text-white print:hidden">
          <h1 className="text-2xl font-bold">Ajukan Permintaan</h1>
          <p className="text-sm opacity-90 mt-1">Sistem otomatis menghitung tingkat prioritas berdasarkan frekuensi permintaan tahunan</p>
          
          <div className="flex items-center space-x-4 mt-5 text-sm">
            <div className={`flex items-center space-x-2 ${currentStep === 1 ? 'font-bold' : 'opacity-70'}`}>
              <span className={`rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs leading-none ${currentStep === 1 ? 'bg-white text-[#00664b]' : 'border border-white'}`}>1</span>
              <span>Informasi Pemohon</span>
            </div>
            <div className="h-[1px] w-16 bg-white opacity-50"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 2 ? 'font-bold' : 'opacity-70'}`}>
              <span className={`rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs leading-none ${currentStep === 2 ? 'bg-white text-[#00664b]' : 'border border-white'}`}>2</span>
              <span>Detail Kebutuhan</span>
            </div>
            <div className="h-[1px] w-16 bg-white opacity-50"></div>
            <div className={`flex items-center space-x-2 ${currentStep === 3 ? 'font-bold' : 'opacity-70'}`}>
              <span className={`rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs leading-none ${currentStep === 3 ? 'bg-white text-[#00664b]' : 'border border-white'}`}>3</span>
              <span>Review & Submit</span>
            </div>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="w-full max-w-[210mm] flex justify-between items-start mb-6 text-white print:hidden">
          <div>
            <h1 className="text-2xl font-bold">Preview Bon Barang</h1>
            <p className="text-sm opacity-90">Formulir cetak ini berukuran nota fisik (21cm x 16cm)</p>
          </div>
          <div className="flex flex-col space-y-2">
            <button onClick={handleDownloadPDF} disabled={isExporting} className="flex items-center justify-center space-x-2 bg-white text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:bg-gray-100 transition-colors cursor-pointer">
              <span>{isExporting ? '⏳ Mengunduh...' : '📥 Download PDF'}</span>
            </button>
            <button onClick={() => window.print()} className="flex items-center justify-center space-x-2 bg-white text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:bg-gray-100 transition-colors cursor-pointer">
              <span>🖨️ Cetak</span>
            </button>
          </div>
        </div>
      )}

      {currentStep <= 3 ? (
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl p-8 text-black">
          {currentStep <= 2 ? (
            <form onSubmit={handleNext}>
              
              {/* STEP 1: INFORMASI PEMOHON */}
              {currentStep === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-6 text-zinc-900">Informasi Pemohon</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                      <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00664b] focus:border-[#00664b] transition-all" required />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">NIP/ ID pegawai</label>
                      <input type="text" name="nipPegawai" value={formData.nipPegawai} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed select-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit</label>
                      <select name="divisi" value={formData.divisi} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00664b] focus:border-[#00664b] cursor-pointer transition-all" required>
                        <option value="" disabled hidden>Pilih Unit</option>
                        <option value="KC Semarang">KC Semarang</option>
                        <option value="KCP Majapahit">KCP Majapahit</option>
                        <option value="KCP Ngaliyan">KCP Ngaliyan</option>
                        <option value="KCP Ungaran">KCP Ungaran</option>
                        <option value="KCP Kendal">KCP Kendal</option>
                        <option value="KCP Kudus">KCP Kudus</option>
                        <option value="KCP Magelang">KCP Magelang</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jabatan</label>
                      <input 
                        type="text" 
                        name="jabatan" 
                        value={formData.jabatan?.toUpperCase() === 'USER' ? 'User' : formData.jabatan} 
                        disabled 
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed select-none capitalize" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                      <input type="email" name="email" value={formData.email} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed select-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">No Telephone</label>
                      <input type="tel" name="noTelepon" value={formData.noTelepon} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#00664b] focus:border-[#00664b] transition-all" required />
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-10">1/3</div>
                </>
              )}

              {/* STEP 2: DETAIL DAFTAR BARANG */}
              {currentStep === 2 && (
                <>
                  {/* 🔥 PERBAIKAN ALIGNMENT TANGGAL DIBUTUHKAN */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-xl font-bold text-zinc-900">Detail Daftar Barang</h2>
                    <div className="flex flex-col items-start mt-4 sm:mt-0">
                      <label className="text-xs font-bold text-zinc-700 mb-1.5 text-left w-full">Tanggal Dibutuhkan</label>
                      <input 
                        type="date" 
                        name="tanggalDibutuhkan" 
                        value={formData.tanggalDibutuhkan} 
                        onChange={handleChange} 
                        min={getTodayDate()} 
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#00664b] focus:ring-1 focus:ring-[#00664b] bg-white transition-all w-full sm:w-auto" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 pb-2">
                    {daftarBarang.map((barang, idx) => {
                      // 🔥 PENCARIAN STOK DINAMIS DARI TABEL MASTER ASSETS
                      const matchedAsset = masterAssets.find(a => a.kode_barang === barang.kodeAset || a.id === barang.kodeAset || a.nama_barang === barang.namaAset);
                      const stokTersedia = matchedAsset ? (matchedAsset.stok ?? matchedAsset.stock ?? 0) : '-';

                      return (
                        <div key={barang.kodeAset} className="border border-zinc-200 rounded-xl p-5 bg-white shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                            <div>
                              <h4 className="font-bold text-lg text-zinc-900 capitalize tracking-tight">{barang.namaAset}</h4>
                              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">ID: {barang.kodeAset}</p>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-600">
                                Prioritas: 
                                <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${
                                  barang.prioritas === 'Tinggi' ? 'bg-red-50 text-red-600' :
                                  barang.prioritas === 'Sedang' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-[#00664b]'
                                }`}>
                                  {barang.prioritas}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-600">
                                Kuantitas:
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="number" 
                                    min="1" 
                                    max={stokTersedia !== '-' ? stokTersedia : undefined}
                                    value={barang.jumlah} 
                                    onChange={(e) => handleQtyChange(idx, e.target.value)} 
                                    className="w-12 border border-zinc-300 text-center rounded-md py-1 text-sm font-bold focus:outline-none focus:border-[#00664b] focus:ring-1 focus:ring-[#00664b]"
                                    required
                                  />
                                  {/* 🔥 LOGIKA STOK MENAMPILKAN DATA ASLI */}
                                  <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">/ {stokTersedia} Stok</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <hr className="border-zinc-100 mb-4" />

                          <div>
                            <label className="block text-[11px] font-bold text-zinc-500 mb-2">Alasan Permintaan Barang Ini:</label>
                            <input 
                              type="text" 
                              placeholder="Contoh: Stok alat tulis habis..." 
                              value={barang.keterangan || ''}
                              onChange={(e) => handleKeteranganItemChange(idx, e.target.value)}
                              className="w-full text-sm border border-zinc-200 rounded-lg bg-zinc-50 py-2.5 px-3 focus:outline-none focus:border-[#00664b] focus:ring-1 focus:ring-[#00664b] focus:bg-white transition-all"
                            />
                          </div>

                        </div>
                      )
                    })}
                  </div>

                  <div className="text-center text-xs text-gray-500 mt-6">2/3</div>
                </>
              )}

              <div className="flex justify-end space-x-4 mt-8">
                <button 
                  type="button" 
                  onClick={currentStep === 2 ? handleBack : undefined} 
                  className="px-6 py-2.5 bg-white border border-red-500 text-red-500 rounded-xl text-sm font-bold shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                >
                  {currentStep === 2 ? 'Kembali' : 'Batal'}
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-[#00664b] hover:bg-[#004d38] text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </form>
          ) : (

            /* STEP 3: REVIEW & SUBMIT */
            <div>
              <div className="mb-8">
                <h2 className="text-[19px] font-bold mb-5 text-zinc-900">Informasi Pemohon</h2>
                <div className="grid grid-cols-[150px_10px_1fr] gap-y-2.5 text-sm text-zinc-800 font-semibold">
                  <span className="text-zinc-600">Nama Lengkap</span><span>:</span><span className="text-zinc-900">{formData.namaLengkap}</span>
                  <span className="text-zinc-600">Unit</span><span>:</span><span className="text-zinc-900">{formData.divisi}</span>
                  <span className="text-zinc-600">Tanggal dibutuhkan</span><span>:</span><span className="text-zinc-900">{formData.tanggalDibutuhkan}</span>
                  <span className="text-zinc-600">Prioritas</span><span>:</span><span className="text-zinc-900">{highestPriority}</span>
                </div>
              </div>
              
              <hr className="border-zinc-200 my-6" />
              
              <div className="mb-6">
                <h2 className="text-[19px] font-bold mb-4 text-zinc-900">Rincian Barang ({daftarBarang.length})</h2>
                <div className="border border-zinc-200 rounded-2xl overflow-hidden text-sm bg-white shadow-sm">
                  
                  {/* Table Header */}
                  <div className="bg-zinc-200/60 font-bold px-5 py-3.5 grid grid-cols-[1fr_120px_100px] gap-4 text-zinc-700 border-b border-zinc-200 text-[13px]">
                    <span>Nama Barang</span>
                    <span className="text-center">Prioritas</span>
                    <span className="text-center">Jumlah</span>
                  </div>
                  
                  {/* Table Body */}
                  {daftarBarang.map((b, i) => (
                    <div key={b.kodeAset} className={`px-5 py-4 grid grid-cols-[1fr_120px_100px] gap-4 items-center ${i !== daftarBarang.length - 1 ? 'border-b border-zinc-100' : ''}`}>
                      <div>
                        <span className="block font-bold text-zinc-800 text-[15px] capitalize">{b.namaAset}</span>
                        <span className="block text-[11px] text-zinc-400 font-mono mt-0.5">ID: {b.kodeAset}</span>
                        <span className="block text-[12px] text-zinc-600 mt-1.5 leading-snug">Alasan: {b.keterangan || '-'}</span>
                      </div>
                      <div className="text-center">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold inline-block ${
                          b.prioritas === 'Tinggi' ? 'bg-red-50 text-red-600' :
                          b.prioritas === 'Sedang' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-[#00664b]'
                        }`}>
                          {b.prioritas}
                        </span>
                      </div>
                      <div className="text-center font-bold text-zinc-800 text-[14px]">
                        {b.jumlah} Item
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-10">
                <div className="text-xs text-gray-500">3/3</div>
                <div className="flex space-x-4">
                  <button 
                    type="button" 
                    onClick={handleBack} 
                    className="px-7 py-2.5 bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    Ubah
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSubmitFinal} 
                    disabled={isExporting}
                    className="px-7 py-2.5 bg-[#00664b] hover:bg-[#004d38] text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? 'Mengirim...' : 'Ajukan Permintaan'}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      ) : (
        <div className="shadow-2xl print:shadow-none bg-white rounded-lg overflow-hidden">
          <TemplateDokumenA4 ref={printRef} formData={formData} daftarBarang={daftarBarang} submitResult={submitResult} />
        </div>
      )}
    </div>
  );
}