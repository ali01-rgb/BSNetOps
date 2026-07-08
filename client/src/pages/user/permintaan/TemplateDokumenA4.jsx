import React from 'react';

// Menggunakan React.forwardRef agar elemen bisa ditangkap oleh html2pdf.js / print ref
const TemplateDokumenA4 = React.forwardRef(({ formData }, ref) => {
  return (
    <div 
      ref={ref} 
      // Force background & text color ke HEX standar agar html2canvas aman dari error oklch
      style={{ backgroundColor: '#ffffff', color: '#000000' }}
      className="bg-white w-[210mm] min-h-[297mm] p-[20mm] text-black flex flex-col justify-between print:p-0 print:w-full"
    >
      <div>
        {/* ================= HEADER SURAT ================= */}
        <div 
          style={{ borderColor: '#4d8c6b' }} 
          className="flex justify-between items-start border-b-2 pb-4 mb-6"
        >
          <div className="flex flex-col">
            {/* Brand Logo BSN */}
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

        {/* ================= DATA PEMOHON ================= */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: '#045936' }}>
            Data Pemohon
          </h3>
          <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-y-1.5 text-xs">
            <span style={{ color: '#4b5563' }}>Nama Lengkap</span><span>: {formData?.namaLengkap}</span>
            <span style={{ color: '#4b5563' }}>NIP/ ID Pegawai</span><span>: {formData?.nipPegawai}</span>
            <span style={{ color: '#4b5563' }}>Divisi/ Departemen</span><span>: {formData?.divisi}</span>
            <span style={{ color: '#4b5563' }}>Jabatan</span><span>: {formData?.jabatan}</span>
            <span style={{ color: '#4b5563' }}>Email</span><span>: {formData?.email}</span>
            <span style={{ color: '#4b5563' }}>No Telephone</span><span>: {formData?.noTelepon}</span>
          </div>
        </div>

        {/* ================= DETAIL PERMINTAAN ================= */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: '#045936' }}>
            Detail Permintaan
          </h3>
          <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-y-1.5 text-xs">
            <span style={{ color: '#4b5563' }}>Nama Aset</span><span className="capitalize">: {formData?.namaAset}</span>
            <span style={{ color: '#4b5563' }}>Jumlah</span><span>: {formData?.jumlah}</span>
            <span style={{ color: '#4b5563' }}>Prioritas</span><span>: {formData?.prioritas}</span>
            <span style={{ color: '#4b5563' }}>Tanggal Dibutuhkan</span><span>: {formData?.tanggalDibutuhkan}</span>
            <span style={{ color: '#4b5563' }}>Alasan</span><span>: {formData?.alasanDibutuhkan}</span>
          </div>
        </div>

        {/* ================= AREA PERSETUJUAN MANAGER ================= */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: '#045936' }}>
            Persetujuan Manager
          </h3>
          <div className="flex space-x-8 text-xs mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border" style={{ borderColor: '#9ca3af', backgroundColor: '#f3f4f6' }}></div>
              <span>Disetujui</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border" style={{ borderColor: '#9ca3af', backgroundColor: '#f3f4f6' }}></div>
              <span>Ditolak</span>
            </div>
          </div>
          <div className="text-xs flex items-start space-x-2" style={{ color: '#4b5563' }}>
            <span>Catatan Manager :</span>
            <div className="flex-1 border-b h-4 mt-1" style={{ borderColor: '#9ca3af' }}></div>
          </div>
          <div className="border-b h-4 w-full ml-[96px] mt-2" style={{ borderColor: '#9ca3af' }}></div>
        </div>

        {/* ================= TANDA TANGAN ================= */}
        <div className="grid grid-cols-2 gap-12 text-center text-xs mt-12">
          <div className="flex flex-col items-center justify-between h-24">
            <span>Pemohon</span>
            <div className="w-32 border-b" style={{ borderColor: '#9ca3af' }}></div>
            <div className="text-left w-32 text-[10px]" style={{ color: '#6b7280' }}>Tanggal: _________</div>
          </div>
          <div className="flex flex-col items-center justify-between h-24">
            <span>Manager Terkait,</span>
            <div className="w-40 flex justify-between px-2" style={{ color: '#9ca3af' }}>
              <span>(</span><span>)</span>
            </div>
            <div className="w-40 border-b -mt-2" style={{ borderColor: '#9ca3af' }}></div>
            <div className="text-left w-40 text-[10px]" style={{ color: '#6b7280' }}>Tanggal: _________</div>
          </div>
        </div>
      </div>

      {/* Footer Nota A4 */}
      <div 
        className="text-center text-[10px] mt-12 border-t pt-2 font-mono" 
        style={{ color: '#9ca3af', borderColor: '#e5e7eb' }}
      >
        Dokumen ini dicetak secara otomatis oleh BSNetOps
      </div>
    </div>
  );
});

export default TemplateDokumenA4;