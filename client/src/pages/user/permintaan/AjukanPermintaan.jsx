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

  // 🔥 2. FETCH PROFIL LENGKAP DARI DATABASE (TIDAK CUMA DARI LOCALSTORAGE)
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
            jabatan: data.role || data.jabatan || 'USER',
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

  // 3. SET BARANG DARI KERANJANG ASET
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

  // 4. AUTO SAVE DRAFT
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

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {currentStep <= 3 && (
        <div className="w-full max-w-2xl mb-6 text-white print:hidden">
          <h1 className="text-2xl font-bold">Ajukan Permintaan</h1>
          <p className="text-sm opacity-90">Isi formulir untuk mengajukan permintaan aset kantor</p>
          
          <div className="flex items-center space-x-4 mt-4 text-xs">
            <div className={`flex items-center space-x-1 ${currentStep === 1 ? 'font-semibold' : 'opacity-60'}`}>
              <span className={`rounded-full w-5 h-5 flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-white text-[#4d8c6b]' : 'border border-white'}`}>1</span>
              <span>Informasi Pemohon</span>
            </div>
            <div className="h-[1px] w-12 bg-white opacity-50"></div>
            <div className={`flex items-center space-x-1 ${currentStep === 2 ? 'font-semibold' : 'opacity-60'}`}>
              <span className={`rounded-full w-5 h-5 flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-white text-[#4d8c6b]' : 'border border-white'}`}>2</span>
              <span>Detail Barang & Kebutuhan</span>
            </div>
            <div className="h-[1px] w-12 bg-white opacity-50"></div>
            <div className={`flex items-center space-x-1 ${currentStep === 3 ? 'font-semibold' : 'opacity-60'}`}>
              <span className={`rounded-full w-5 h-5 flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-white text-[#4d8c6b]' : 'border border-white'}`}>3</span>
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
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 text-black">
          {currentStep <= 2 ? (
            <form onSubmit={handleNext}>
              {currentStep === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-6">Informasi Pemohon</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIP/ ID pegawai</label>
                      <input type="text" name="nipPegawai" value={formData.nipPegawai} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 cursor-not-allowed select-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select name="divisi" value={formData.divisi} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4d8c6b] cursor-pointer" required>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan / Role</label>
                      <input 
                        type="text" 
                        name="jabatan" 
                        value={formData.jabatan} 
                        disabled 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 cursor-not-allowed select-none uppercase" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" name="email" value={formData.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 cursor-not-allowed select-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">No Telephone</label>
                      <input type="tel" name="noTelepon" value={formData.noTelepon} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required />
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-8">1/3</div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h2 className="text-xl font-bold mb-1">Daftar Barang yang Diminta</h2>
                  <p className="text-xs text-zinc-500 mb-4">
                    Prioritas dikunci otomatis berdasar akumulasi permohonan Anda tahun ini ({yearlyCount} Permintaan).
                  </p>

                  <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                    {daftarBarang.map((barang, idx) => (
                      <div key={barang.kodeAset} className="flex flex-col gap-3 p-3 bg-white border border-zinc-200 rounded-lg shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold capitalize text-zinc-800">{barang.namaAset}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{barang.kodeAset}</div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <label className="text-[11px] text-zinc-600 font-medium">Prioritas:</label>
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                                calculatedPriority === 'Tinggi' 
                                  ? 'bg-red-50 text-red-700 border-red-200' 
                                  : calculatedPriority === 'Sedang' 
                                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {calculatedPriority}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="text-[11px] text-zinc-600 font-medium">Jumlah:</label>
                              <input 
                                type="number" 
                                min="1" 
                                value={barang.jumlah} 
                                onChange={(e) => handleQtyChange(idx, e.target.value)} 
                                className="w-16 text-center text-xs border border-zinc-300 rounded py-1 px-1.5 focus:outline-[#4d8c6b]"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-full">
                          <input 
                            type="text" 
                            placeholder="Keterangan (Opsional, max 40 kata)..." 
                            value={barang.keterangan || ''}
                            onChange={(e) => handleKeteranganItemChange(idx, e.target.value)}
                            className="w-full text-xs border border-gray-300 rounded bg-gray-50 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#4d8c6b]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Dibutuhkan</label>
                    <input 
                      type="date" 
                      name="tanggalDibutuhkan" 
                      value={formData.tanggalDibutuhkan} 
                      onChange={handleChange} 
                      min={getTodayDate()} 
                      className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg" 
                      required 
                    />
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-8">2/3</div>
                </>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={handleBack} className="px-6 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-medium">{currentStep === 2 ? 'Kembali' : 'Batal'}</button>
                <button type="submit" className="px-6 py-2 bg-[#045936] text-white rounded-lg text-sm font-medium">Selanjutnya</button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Informasi Pemohon</h2>
                <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-y-2 text-sm">
                  <span className="font-medium">Nama Lengkap</span><span>: {formData.namaLengkap}</span>
                  <span className="font-medium">Unit</span><span>: {formData.divisi}</span>
                  <span className="font-medium">Tanggal Dibutuhkan</span><span>: {formData.tanggalDibutuhkan}</span>
                </div>
              </div>
              <hr className="border-gray-300 my-4" />
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3">Daftar Aset Berjumlah ({daftarBarang.length})</h2>
                <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-zinc-100 font-bold p-2.5 grid grid-cols-[1fr_100px]"><span>Nama Barang</span><span>Kuantitas</span></div>
                  {daftarBarang.map((b) => (
                    <div key={b.kodeAset} className="border-t border-zinc-200 p-2.5 flex justify-between items-center capitalize">
                      <div>
                        <span className="block font-medium">{b.namaAset} ({b.kodeAset})</span>
                        <span className="text-[10px] text-gray-500 block mt-1">
                          <span className="font-bold text-[#4d8c6b]">[{calculatedPriority}]</span> {b.keterangan ? `- Ket: ${b.keterangan}` : ''}
                        </span>
                      </div>
                      <span className="font-bold whitespace-nowrap">{b.jumlah} Item</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg text-sm font-medium cursor-pointer">Ubah</button>
                <button 
                  type="button" 
                  onClick={handleSubmitFinal} 
                  disabled={isExporting}
                  className="px-6 py-2 bg-[#045936] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? 'Mengirim...' : 'Ajukan Permintaan'}
                </button>
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