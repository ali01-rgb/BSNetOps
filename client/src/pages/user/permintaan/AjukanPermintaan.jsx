import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js'; // 📦 Impor html2pdf untuk ekspor PDF otomatis

// =========================================================================
// 1. KOMPONEN UTAMA WIZARD FORM (AjukanPermintaan)
// =========================================================================
export default function AjukanPermintaan() {
  // Reference untuk menangkap elemen A4 saat akan didownload sebagai PDF
  const printRef = useRef();

  // Ambil data kiriman dari localStorage
  const savedAsset = JSON.parse(localStorage.getItem('selectedAssetData'));

  // Langkah awal (currentStep) DIKUNCI tetap mulai dari Tahap 1
  const [currentStep, setCurrentStep] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const [formData, setFormData] = useState({
    namaLengkap: '', nipPegawai: '', divisi: '', jabatan: '', email: '', noTelepon: '',
    namaAset: savedAsset?.namaAset || '', // Auto-fill nama aset di background state
    tanggalDibutuhkan: '', 
    prioritas: '', 
    jumlah: '', 
    alasanDibutuhkan: ''
  });

  // Hapus localStorage setelah dibaca agar cache bersih saat diakses manual nanti
  useEffect(() => {
    if (savedAsset?.namaAset) {
      localStorage.removeItem('selectedAssetData');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Batasan maksimal 40 kata untuk alasan biar pas di cetakan A4
    if (name === "alasanDibutuhkan") {
      const kata = value.trim().split(/\s+/);
      if (kata.length > 40) {
        alert("Batas maksimum pengisian alasan adalah 40 kata agar muat dalam format cetak!");
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  };

  const handleSubmitFinal = () => {
    console.log("Data Sent to Backend:", formData);
    setCurrentStep(4);
  };

  // 📥 FUNGSI UNTUK LANGSUNG UNDUH FILE PDF SECARA OTOMATIS (DENGAN FIX ERROR OKLCH)
  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;

    setIsExporting(true);

    const opt = {
      margin:       0,
      filename:     `Form_Permintaan_Aset_${formData.namaLengkap ? formData.namaLengkap.replace(/\s+/g, '_') : 'BSN'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        logging: false,
        // FIX: Tangani error parse warna oklch dari Tailwind v4
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const style = window.getComputedStyle(el);
            if (style.color && style.color.includes('oklch')) {
              el.style.color = '#000000';
            }
            if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = '#ffffff';
            }
            if (style.borderColor && style.borderColor.includes('oklch')) {
              el.style.borderColor = '#d1d5db';
            }
          });
        }
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Eksekusi generator PDF dan simpan file
    html2pdf().set(opt).from(element).save().then(() => {
      setIsExporting(false);
    }).catch((err) => {
      console.error("Error generating PDF:", err);
      alert("Gagal mengunduh PDF: " + err.message);
      setIsExporting(false);
    });
  };

  // 🖨️ FUNGSI UNTUK CETAK BIASA
  const handlePrint = () => {
    window.print();
    setTimeout(() => {
      setCurrentStep(3); 
    }, 500);
  };

  const getMinimalDate = () => {
    const hariIni = new Date();
    const yyyy = hariIni.getFullYear();
    const mm = String(hariIni.getMonth() + 1).padStart(2, '0');
    const dd = String(hariIni.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* HEADER WIZARD (Sembunyikan saat cetak) */}
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
              <span>Detail Permintaan</span>
            </div>
            <div className="h-[1px] w-12 bg-white opacity-50"></div>
            <div className={`flex items-center space-x-1 ${currentStep === 3 ? 'font-semibold' : 'opacity-60'}`}>
              <span className={`rounded-full w-5 h-5 flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-white text-[#4d8c6b]' : 'border border-white'}`}>3</span>
              <span>Review & Submit</span>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW HEADER UNTUK STEP 4 */}
      {currentStep === 4 && (
        <div className="w-full max-w-[210mm] flex justify-between items-start mb-6 text-white print:hidden">
          <div>
            <h1 className="text-2xl font-bold">Preview Formulir Permintaan</h1>
            <p className="text-sm opacity-90">Formulir ini dapat diunduh dan di cetak</p>
            <span className="text-xs block mt-2 opacity-50">A4 - 1</span>
          </div>
          <div className="flex flex-col space-y-2">
            {/* TOMBOL DOWNLOAD PDF LANGSUNG OTOMATIS */}
            <button 
              onClick={handleDownloadPDF} 
              disabled={isExporting}
              className="flex items-center justify-center space-x-2 bg-white text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{isExporting ? '⏳ Mengunduh...' : '📥 Download PDF'}</span>
            </button>
            {/* TOMBOL CETAK BIASA */}
            <button 
              onClick={handlePrint} 
              className="flex items-center justify-center space-x-2 bg-white text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span>🖨️ Cetak</span>
            </button>
          </div>
        </div>
      )}

      {/* AREA CARD UTAMA FORMULIR */}
      {currentStep <= 3 ? (
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-8 text-black">
          {currentStep <= 2 ? (
            <form onSubmit={handleNext}>
              {/* STEP 1: INFORMASI PEMOHON */}
              {currentStep === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-6">Informasi Pemohon</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label><input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">NIP/ ID pegawai</label><input type="text" name="nipPegawai" value={formData.nipPegawai} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Divisi/ Departemen</label><input type="text" name="divisi" value={formData.divisi} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label><input type="text" name="jabatan" value={formData.jabatan} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">No Telephone</label><input type="tel" name="noTelepon" value={formData.noTelepon} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-8">1/2</div>
                </>
              )}

              {/* STEP 2: DETAIL PERMINTAAN */}
              {currentStep === 2 && (
                <>
                  <h2 className="text-xl font-bold mb-6">Detail Permintaan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aset</label>
                        <input 
                          type="text" 
                          name="namaAset" 
                          value={formData.namaAset} 
                          onChange={handleChange} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-zinc-50 font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" 
                          required 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          <span>Prioritas</span>
                          {formData.prioritas === 'Tinggi' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span>}
                          {formData.prioritas === 'Sedang' && <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>}
                          {formData.prioritas === 'Rendah' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>}
                        </label>
                        <select name="prioritas" value={formData.prioritas} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b] bg-white cursor-pointer" required>
                          <option value="" disabled hidden>Pilih Prioritas</option>
                          <option value="Rendah">Rendah (🔵)</option>
                          <option value="Sedang">Sedang (🟡)</option>
                          <option value="Tinggi">Tinggi (🔴)</option>
                        </select>
                      </div>

                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label><input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                    </div>

                    <div className="flex flex-col space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal dibutuhkan</label>
                        <input 
                          type="date" 
                          name="tanggalDibutuhkan" 
                          min={getMinimalDate()} 
                          value={formData.tanggalDibutuhkan} 
                          onChange={handleChange} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" 
                          required 
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Dibutuhkan</label>
                        <textarea name="alasanDibutuhkan" value={formData.alasanDibutuhkan} onChange={handleChange} rows="4" placeholder="Tuliskan alasan keperluan aset..." className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b] resize-none" required></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-8">2/2</div>
                </>
              )}

              <div className="flex justify-end space-x-4 mt-4">
                <button type="button" onClick={handleBack} className="px-6 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-medium">{currentStep === 2 ? 'Kembali' : 'Batal'}</button>
                <button type="submit" className="px-6 py-2 bg-[#045936] text-white rounded-lg text-sm font-medium">Selanjutnya</button>
              </div>
            </form>
          ) : (
            /* STEP 3: REVIEW & SUBMIT */
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Informasi Pemohon</h2>
                <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-y-2 text-sm">
                  <span className="font-medium">Nama Lengkap</span><span>: {formData.namaLengkap}</span>
                  <span className="font-medium">NIP/ ID Pegawai</span><span>: {formData.nipPegawai}</span>
                  <span className="font-medium">Divisi / Departemen</span><span>: {formData.divisi}</span>
                  <span className="font-medium">Jabatan</span><span>: {formData.jabatan}</span>
                  <span className="font-medium">Email</span><span>: {formData.email}</span>
                  <span className="font-medium">No Telephone</span><span>: {formData.noTelepon}</span>
                </div>
              </div>
              <hr className="border-gray-300 my-6" />
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Detail Permintaan</h2>
                <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-y-2 text-sm">
                  <span className="font-medium">Nama Aset</span><span className="capitalize">: {formData.namaAset}</span>
                  <span className="font-medium">Jumlah</span><span>: {formData.jumlah}</span>
                  <span className="font-medium">Prioritas</span><span>: {formData.prioritas}</span>
                  <span className="font-medium">Tanggal Dituntutkan</span><span>: {formData.tanggalDibutuhkan}</span>
                  <span className="font-medium">Alasan</span><span>: {formData.alasanDibutuhkan}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg text-sm font-medium">Ubah</button>
                <button type="button" onClick={handleSubmitFinal} className="px-6 py-2 bg-[#045936] text-white rounded-lg text-sm font-medium">Ajukan Permintaan</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STEP 4: TEMPLATE DOKUMEN SIAP CETAK / UNDUH */
        <div className="shadow-2xl print:shadow-none bg-white rounded-lg overflow-hidden">
          <TemplateDokumenA4 ref={printRef} formData={formData} />
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 2. TEMPLATE DOKUMEN OFFLINE SIAP CETAK (FIX AMAN HEX COLOR FOR HTML2CANVAS)
// =========================================================================
const TemplateDokumenA4 = React.forwardRef(({ formData }, ref) => {
  return (
    <div 
      ref={ref} 
      style={{ backgroundColor: '#ffffff', color: '#000000' }}
      className="bg-white w-[210mm] min-h-[297mm] p-[20mm] text-black flex flex-col justify-between print:p-0 print:w-full"
    >
      <div>
        {/* HEADER DOKUMEN */}
        <div 
          style={{ borderColor: '#4d8c6b' }} 
          className="flex justify-between items-start border-b-2 pb-4 mb-6"
        >
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 font-bold text-2xl tracking-tight" style={{ color: '#045936' }}>
              <span>bsn</span>
              <span className="text-xl font-black" style={{ color: '#f59e0b' }}>★</span>
            </div>
            <span className="text-[10px] font-medium tracking-wide uppercase mt-0.5" style={{ color: '#6b7280' }}>
              bank syariah nasional
            </span>
          </div>
          <div className="text-right">
            <h2 className="text-md font-bold" style={{ color: '#1f2937' }}>Form Permintaan Aset Kantor</h2>
            <div className="text-xs mt-1" style={{ color: '#4b5563' }}>
              <p>No. Permintaan : <span></span></p>
              <p>Tanggal : <span>{new Date().toLocaleDateString('id-ID')}</span></p>
            </div>
          </div>
        </div>

        {/* DATA PEMOHON */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: '#045936' }}>Data Pemohon</h3>
          <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-y-1.5 text-xs">
            <span style={{ color: '#4b5563' }}>Nama Lengkap</span><span>: {formData?.namaLengkap}</span>
            <span style={{ color: '#4b5563' }}>NIP/ ID Pegawai</span><span>: {formData?.nipPegawai}</span>
            <span style={{ color: '#4b5563' }}>Divisi/ Departemen</span><span>: {formData?.divisi}</span>
            <span style={{ color: '#4b5563' }}>Jabatan</span><span>: {formData?.jabatan}</span>
            <span style={{ color: '#4b5563' }}>Email</span><span>: {formData?.email}</span>
            <span style={{ color: '#4b5563' }}>No Telephone</span><span>: {formData?.noTelepon}</span>
          </div>
        </div>

        {/* DETAIL PERMINTAAN */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: '#045936' }}>Detail Permintaan</h3>
          <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-y-1.5 text-xs">
            <span style={{ color: '#4b5563' }}>Nama Aset</span><span className="capitalize">: {formData?.namaAset}</span>
            <span style={{ color: '#4b5563' }}>Jumlah</span><span>: {formData?.jumlah}</span>
            <span style={{ color: '#4b5563' }}>Prioritas</span><span>: {formData?.prioritas}</span>
            <span style={{ color: '#4b5563' }}>Tanggal Dibutuhkan</span><span>: {formData?.tanggalDibutuhkan}</span>
            <span style={{ color: '#4b5563' }}>Alasan</span><span>: {formData?.alasanDibutuhkan}</span>
          </div>
        </div>

        {/* PERSETUJUAN MANAGER */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#045936' }}>Persetujuan Manager</h3>
          <div className="flex space-x-8 text-xs mb-3">
            <div className="flex items-center space-x-2"><div className="w-4 h-4 border" style={{ borderColor: '#9ca3af', backgroundColor: '#f3f4f6' }}></div><span>Disetujui</span></div>
            <div className="flex items-center space-x-2"><div className="w-4 h-4 border" style={{ borderColor: '#9ca3af', backgroundColor: '#f3f4f6' }}></div><span>Ditolak</span></div>
          </div>
          <div className="text-xs flex items-start space-x-2" style={{ color: '#4b5563' }}>
            <span>Catatan Manager :</span>
            <div className="flex-1 border-b h-4 mt-1" style={{ borderColor: '#9ca3af' }}></div>
          </div>
          <div className="border-b h-4 w-full ml-[96px] mt-2" style={{ borderColor: '#9ca3af' }}></div>
        </div>

        {/* TANDA TANGAN */}
        <div className="grid grid-cols-2 gap-12 text-center text-xs mt-12">
          <div className="flex flex-col items-center justify-between h-24">
            <span>Pemohon</span>
            <div className="w-32 border-b" style={{ borderColor: '#9ca3af' }}></div>
            <div className="text-left w-32 text-[10px]" style={{ color: '#6b7280' }}>Tanggal: _________</div>
          </div>
          <div className="flex flex-col items-center justify-between h-24">
            <span>Manager Terkait,</span>
            <div className="w-40 flex justify-between px-2" style={{ color: '#9ca3af' }}><span>(</span><span>)</span></div>
            <div className="w-40 border-b -mt-2" style={{ borderColor: '#9ca3af' }}></div>
            <div className="text-left w-40 text-[10px]" style={{ color: '#6b7280' }}>Tanggal: _________</div>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] mt-12 border-t pt-2 font-mono" style={{ color: '#9ca3af', borderColor: '#e5e7eb' }}>
        Dokumen ini dicetak secara otomatis oleh BSNetOps
      </div>
    </div>
  );
});