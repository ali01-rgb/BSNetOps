import React, { useState } from 'react';

// =========================================================================
// 1. KOMPONEN UTAMA WIZARD FORM (AjukanPermintaan)
// =========================================================================
export default function AjukanPermintaan() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    namaLengkap: '', nipPegawai: '', divisi: '', jabatan: '', email: '', noTelepon: '',
    namaAset: '', tanggalDibutuhkan: '', prioritas: '', jumlah: '', alasanDibutuhkan: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    // Setelah sukses mengirim ke backend, langsung buka halaman preview PDF (Step 4)
    setCurrentStep(4);
  };

  // Fungsi untuk memicu download PDF / cetak bawaan browser
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* ================= HEADER UTAMA (Sembunyikan saat cetak) ================= */}
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

      {/* ================= PREVIEW HEADER UNTUK STEP 4 (Sembunyikan saat cetak) ================= */}
      {currentStep === 4 && (
        <div className="w-full max-w-[210mm] flex justify-between items-start mb-6 text-white print:hidden">
          <div>
            <h1 className="text-2xl font-bold">Preview Formulir Permintaan</h1>
            <p className="text-sm opacity-90">Formulir ini dapat diunduh dan di cetak</p>
            <span className="text-xs block mt-2 opacity-50">A4 - 1</span>
          </div>
          <div className="flex flex-col space-y-2">
            <button onClick={handlePrint} className="flex items-center justify-center space-x-2 bg-white text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:bg-gray-100 transition-colors">
              <span>📥 Download PDF</span>
            </button>
            <button onClick={handlePrint} className="flex items-center justify-center space-x-2 bg-white text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:bg-gray-100 transition-colors">
              <span>🖨️ Cetak</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= AREA FORMULIR / CARD PUTIH ================= */}
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
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Aset</label><input type="text" name="namaAset" value={formData.namaAset} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                        <select name="prioritas" value={formData.prioritas} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b] bg-white cursor-pointer" required>
                          <option value="" disabled hidden></option>
                          <option value="Rendah">Rendah</option><option value="Sedang">Sedang</option><option value="Tinggi">Tinggi</option>
                        </select>
                      </div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label><input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal dibutuhkan</label><input type="date" name="tanggalDibutuhkan" value={formData.tanggalDibutuhkan} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b]" required /></div>
                      <div className="flex-1 flex flex-col"><label className="block text-sm font-medium text-gray-700 mb-1">alasan Dituntutkan</label><textarea name="alasanDibutuhkan" value={formData.alasanDibutuhkan} onChange={handleChange} rows="4" className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d8c6b] resize-none" required></textarea></div>
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
                  <span className="font-medium">Nama Aset</span><span>: {formData.namaAset}</span>
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
        /* STEP 4: MEMANGGIL TEMPLATE DOKUMEN OFFLINE */
        <div className="shadow-2xl print:shadow-none bg-white rounded-lg">
          <TemplateDokumenA4 formData={formData} />
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 2. TEMPLATE DOKUMEN OFFLINE SIAP CETAK (Ditaruh di bawah komponen utama)
// =========================================================================
function TemplateDokumenA4({ formData }) {
  return (
    <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] text-black flex flex-col justify-between print:p-0 print:w-full">
      <div>
        {/* Header Dokumen */}
        <div className="flex justify-between items-start border-b-2 border-[#4d8c6b] pb-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-[#045936] font-bold text-2xl tracking-tight">
              <span>bsn</span>
              <span className="text-amber-500 text-xl font-black">★</span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase mt-0.5">bank syariah nasional</span>
          </div>
          <div className="text-right">
            <h2 className="text-md font-bold text-gray-800">Form Permintaan Aset Kantor</h2>
            <div className="text-xs text-gray-600 mt-1">
              <p>No. Permintaan : <span></span></p>
              <p>Tanggal : <span>{new Date().toLocaleDateString('id-ID')}</span></p>
            </div>
          </div>
        </div>

        {/* Data Pemohon */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#045936] mb-2 uppercase tracking-wide">Data Pemohon</h3>
          <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-y-1.5 text-xs">
            <span className="text-gray-600">Nama Lengkap</span><span>: {formData.namaLengkap}</span>
            <span className="text-gray-600">NIP/ ID Pegawai</span><span>: {formData.nipPegawai}</span>
            <span className="text-gray-600">Divisi/ Departemen</span><span>: {formData.divisi}</span>
            <span className="text-gray-600">Jabatan</span><span>: {formData.jabatan}</span>
            <span className="text-gray-600">Email</span><span>: {formData.email}</span>
            <span className="text-gray-600">No Telephone</span><span>: {formData.noTelepon}</span>
          </div>
        </div>

        {/* Detail Permintaan */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#045936] mb-2 uppercase tracking-wide">Detail Permintaan</h3>
          <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-y-1.5 text-xs">
            <span className="text-gray-600">Nama Aset</span><span>: {formData.namaAset}</span>
            <span className="text-gray-600">Jumlah</span><span>: {formData.jumlah}</span>
            <span className="text-gray-600">Prioritas</span><span>: {formData.prioritas}</span>
            <span className="text-gray-600">Tanggal Dibutuhkan</span><span>: {formData.tanggalDibutuhkan}</span>
            <span className="text-gray-600">Alasan</span><span>: {formData.alasanDibutuhkan}</span>
          </div>
        </div>

        {/* Persetujuan Manager */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-[#045936] mb-3 uppercase tracking-wide">Persetujuan Manager</h3>
          <div className="flex space-x-8 text-xs mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border border-gray-400 bg-gray-100"></div>
              <span>Disetujui</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border border-gray-400 bg-gray-100"></div>
              <span>Ditolak</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 flex items-start space-x-2">
            <span>Catatan Manager :</span>
            <div className="flex-1 border-b border-gray-400 h-4 mt-1"></div>
          </div>
          <div className="border-b border-gray-400 h-4 w-full ml-[96px] mt-2"></div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-12 text-center text-xs mt-12">
          <div className="flex flex-col items-center justify-between h-24">
            <span>Pemohon</span>
            <div className="w-32 border-b border-gray-400"></div>
            <div className="text-left w-32 text-[10px] text-gray-500">Tanggal: _________</div>
          </div>
          <div className="flex flex-col items-center justify-between h-24">
            <span>Manager Terkait,</span>
            <div className="w-40 text-gray-400 flex justify-between px-2"><span>(</span><span>)</span></div>
            <div className="w-40 border-b border-gray-400 -mt-2"></div>
            <div className="text-left w-40 text-[10px] text-gray-500">Tanggal: _________</div>
          </div>
        </div>
      </div>

      {/* Footer Dokumen */}
      <div className="text-center text-[10px] text-gray-400 mt-12 border-t border-gray-200 pt-2 font-mono">
        Dokumen ini dicetak secara otomatis oleh BSNetOps
      </div>
    </div>
  );
}