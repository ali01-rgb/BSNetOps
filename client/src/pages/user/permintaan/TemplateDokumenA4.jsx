import React from 'react';

const TemplateDokumenA4 = React.forwardRef(({ formData, daftarBarang = [], submitResult }, ref) => {
  const MIN_ROWS = 5;
  const rowCount = Math.max(MIN_ROWS, daftarBarang.length);
  const rows = Array.from({ length: rowCount });

  const requestId = submitResult?.id || submitResult?.[0]?.id || `BSN-REQ-${Date.now()}`;
  const statusDoc = (formData?.status || submitResult?.status || submitResult?.[0]?.status || 'PENDING').toUpperCase();

  // 🔥 REVISI: Tambahkan 'MENUNGGU MANAGER', 'FORWARDED', dan 'DITOLAK' agar saat barang sudah diproses admin, kolom Diberikan & QR Admin langsung muncul
  const isDiteruskan = [
    'DITERUSKAN', 
    'FORWARDED', 
    'MENUNGGU MANAGER', 
    'DISETUJUI', 
    'SELESAI', 
    'APPROVED', 
    'DITOLAK', 
    'REJECTED'
  ].includes(statusDoc);

  // Hanya status disetujui final yang memunculkan QR Manager
  const isDisetujui = ['DISETUJUI', 'SELESAI', 'APPROVED'].includes(statusDoc);

  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const role = (userProfile.role || '').toUpperCase();
  const localName = userProfile.fullName || userProfile.username || '';

  const adminName = formData?.adminName && formData.adminName !== 'Admin Gudang' 
    ? formData.adminName 
    : (role === 'ADMIN' ? localName : 'Admin Gudang');

  const managerName = formData?.managerName && formData.managerName !== 'Manager Operasional' 
    ? formData.managerName 
    : (role === 'MANAGER' ? localName : 'Manager Operasional');

  const pemohonName = formData?.namaLengkap || 'Pemohon';
  
  const getQrUrl = (roleName, personName) => {
    const text = `VERIFIED_BSN|${roleName}|${personName}|${requestId}|${new Date().toLocaleDateString('id-ID')}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
  };

  const keteranganTambahan = daftarBarang.map(b => b?.remark || b?.keterangan).filter(Boolean).join(", ") || "Tidak ada keterangan tambahan.";

  return (
    <div ref={ref} className="bg-white w-[210mm] min-h-[297mm] p-[10mm] text-black font-sans box-border">
      <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-2">
        <div className="flex flex-col items-start">
          <img src="/images/logo-BSN.png" alt="Logo BSN" className="h-12 w-auto object-contain object-left mb-1" />
          <span className="text-[13px] font-bold mt-1 text-left w-full">Cabang Semarang</span>
        </div>
        <h1 className="text-xl font-bold uppercase underline underline-offset-4 decoration-2 mt-2">BON BARANG</h1>
        <div className="text-[12px] w-[200px] text-right font-bold mt-2">
          <div className="flex justify-end items-center gap-2">
            <span>Unit:</span>
            <span className="border-b border-black w-[120px] inline-block text-center">{formData?.divisi || 'KC Semarang'}</span>
          </div>
          <div className="flex justify-end items-center gap-2 mt-2">
            <span>Tanggal:</span>
            <span className="border-b border-black w-[120px] inline-block text-center">{new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="border-2 border-black rounded-lg p-3 mb-4 text-xs">
        <p className="font-bold underline mb-1">Informasi & Keperluan Pemohon:</p>
        <p className="italic text-gray-700">"{keteranganTambahan}"</p>
      </div>

      <table className="w-full border-collapse border-2 border-black text-xs mb-6 table-fixed">
        <thead>
          <tr className="bg-gray-100 font-bold text-center">
            <th rowSpan={2} className="border-2 border-black w-[5%] py-2">No.</th>
            <th rowSpan={2} className="border-2 border-black w-[45%] py-2">Nama Barang</th>
            <th colSpan={2} className="border-2 border-black w-[20%] py-1">Jumlah</th>
            <th rowSpan={2} className="border-2 border-black w-[30%] py-2">Keterangan</th>
          </tr>
          <tr className="bg-gray-100 font-bold text-center">
            <th className="border-2 border-black py-1">Diminta</th>
            <th className="border-2 border-black py-1">Diberikan</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, index) => {
            const barang = daftarBarang[index];
            return (
              <tr key={index} className="h-[36px] text-center">
                <td className="border-2 border-black font-bold align-top py-1.5">{index + 1}</td>
                <td className="border-2 border-black px-3 py-1.5 text-left capitalize font-semibold align-top break-all leading-snug">
                  {barang ? (barang.namaAset || barang.namaBarang) : ''}
                </td>
                <td className="border-2 border-black font-bold align-top py-1.5">
                  {barang ? (barang.jumlahDiminta || barang.jumlah || '') : ''}
                </td>
                {/* Kolom Diberikan: Otomatis terisi jumlah disetujui admin */}
                <td className="border-2 border-black font-bold text-[#00664b] align-top py-1.5">
                  {barang && isDiteruskan ? (barang.jumlahDisetujui !== undefined ? barang.jumlahDisetujui : barang.jumlahDiminta) : ''}
                </td>
                <td className="border-2 border-black px-2 py-1.5 text-left font-medium align-top break-all leading-snug">
                  {barang ? (barang.remark || barang.keterangan || '') : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <table className="w-full border-collapse border-2 border-black text-[10px] font-bold text-center table-fixed">
        <thead>
          <tr className="bg-gray-100">
            <td className="border-2 border-black py-2">GA (Manager)</td>
            <td className="border-2 border-black py-2">Barang telah dikeluarkan oleh</td>
            <td className="border-2 border-black py-2">Atasan</td>
            <td className="border-2 border-black py-2">Pemohon</td>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[110px]">
            <td className="border-2 border-black p-2 align-middle">
              {isDisetujui ? (
                <div className="flex flex-col items-center justify-center">
                  <img src={getQrUrl('GA', managerName)} alt="QR GA" className="w-12 h-12 object-contain" />
                  <span className="capitalize font-bold text-[11px] mt-1 underline">{managerName}</span>
                </div>
              ) : <span className="text-gray-400 italic font-normal">Belum di-ACC</span>}
            </td>
            <td className="border-2 border-black p-2 align-middle">
              {/* QR Admin: Muncul saat status Menunggu Manager, Diteruskan, Selesai, atau Ditolak */}
              {isDiteruskan ? (
                <div className="flex flex-col items-center justify-center">
                  <img src={getQrUrl('ADMIN', adminName)} alt="QR Admin" className="w-12 h-12 object-contain" />
                  <span className="capitalize font-bold text-[11px] mt-1 underline">{adminName}</span>
                </div>
              ) : <span className="text-gray-400 italic font-normal">Belum di-ACC</span>}
            </td>
            <td className="border-2 border-black p-2 align-middle">
              <span className="text-gray-400 italic font-normal">Belum di-ACC</span>
            </td>
            <td className="border-2 border-black p-2 align-middle">
              <div className="flex flex-col items-center justify-center h-full">
                <img src={getQrUrl('PEMOHON', pemohonName)} alt="QR Pemohon" className="w-14 h-14 object-contain border border-gray-200 rounded p-0.5" />
                <span className="capitalize font-bold text-[11px] mt-1 underline">{pemohonName}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default TemplateDokumenA4;