import React from 'react';

export default function TemplateDokumenA4({ formData }) {
  return (
    /* Menggunakan ukuran standar kertas A4 (210mm x 297mm) */
    <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] text-black flex flex-col justify-between print:p-0 print:w-full">
      <div>
        {/* ================= HEADER SURAT ================= */}
        <div className="flex justify-between items-start border-b-2 border-[#4d8c6b] pb-4 mb-6">
          <div className="flex flex-col">
            {/* Brand Logo BSN */}
            <div className="flex items-center space-x-1 text-[#045936] font-bold text-2xl tracking-tight">
              <span>bsn</span>
              <span className="text-amber-500 text-xl font-black">★</span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase mt-0.5">
              bank syariah nasional
            </span>
          </div>
          <div className="text-right">
            <h2 className="text-md font-bold text-gray-800">Form Permintaan Aset Kantor</h2>
            <div className="text-xs text-gray-600 mt-1">
              <p>No. Permintaan : <span></span></p>
              <p>Tanggal : <span>{new Date().toLocaleDateString('id-ID')}</span></p>
            </div>
          </div>
        </div>

        {/* ================= DATA PEMOHON ================= */}
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

        {/* ================= DETAIL PERMINTAAN ================= */}
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

        {/* ================= AREA PERSETUJUAN MANAGER ================= */}
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

        {/* ================= TANDA TANGAN ================= */}
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

      {/* Footer Nota A4 */}
      <div className="text-center text-[10px] text-gray-400 mt-12 border-t border-gray-200 pt-2 font-mono">
        Dokumen ini dicetak secara otomatis oleh BSNetOps
      </div>
    </div>
  );
}