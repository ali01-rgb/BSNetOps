import React from 'react';

const TemplateDokumenA4 = React.forwardRef(({ formData, daftarBarang = [] }, ref) => {
  // Minimal 5 baris, atau mengikuti jumlah barang
  const MIN_ROWS = 5;
  const rowCount = Math.max(MIN_ROWS, daftarBarang.length);
  const rows = Array.from({ length: rowCount });

  return (
    <div 
      ref={ref} 
      className="bg-white w-[210mm] h-[297mm] p-[10mm] text-black font-sans box-border"
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-2">
        <div className="flex flex-col">
          <img src="/images/logo-BSN.png" alt="Logo BSN" className="h-15 w-auto object-contain mb-1" />
          <div className="flex flex-col">
            <span className="text-[15px] font-puppy text-middle mt-2">Cabang Semarang</span>
          </div>
        </div>
        
        <h1 className="text-xl font-bold uppercase underline underline-offset-4 decoration-2 mt-2">Bon Barang</h1>
        
        {/* Bagian ini diperbaiki: lebar ditambah dan justify-end digunakan */}
        <div className="text-[12px] w-[200px] text-right font-bold mt-2">
          <div className="flex justify-end items-center gap-2">
            <span>Unit:</span>
            <span className="border-b border-black w-[120px] inline-block text-center">
              {formData?.divisi || ''}
            </span>
          </div>
          <div className="flex justify-end items-center gap-2 mt-2">
            <span>Tanggal:</span>
            <span className="border-b border-black w-[120px] inline-block text-center">
              {new Date().toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* TABEL */}
      <table className="w-full border-collapse border-2 border-black text-sm mb-6">
        <thead>
          <tr className="bg-gray-100 font-bold">
            <th className="border-2 border-black w-[10%] py-2">No</th>
            <th className="border-2 border-black w-[45%] py-2">Nama Barang</th>
            <th className="border-2 border-black w-[15%] py-2">Jumlah</th>
            <th className="border-2 border-black w-[30%] py-2">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, index) => {
            const barang = daftarBarang[index];
            return (
              <tr key={index} className="h-[40px]">
                <td className="border-2 border-black text-center font-bold">{index + 1}</td>
                <td className="border-2 border-black px-3 capitalize font-semibold">{barang ? barang.namaAset : ''}</td>
                <td className="border-2 border-black text-center font-bold">{barang ? barang.jumlah : ''}</td>
                {/* Teks Keterangan sudah diperbesar ke text-sm */}
                <td className="border-2 border-black px-2 text-sm font-medium">
                  {index === 0 ? formData?.alasanDibutuhkan : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TANDA TANGAN */}
      <table className="w-full border-collapse border-2 border-black mt-2 text-[10px] font-bold text-center table-fixed">
        <thead>
          <tr className="bg-gray-100">
            <td className="border-2 border-black py-2">GA</td>
            <td className="border-2 border-black py-2">Dikeluarkan</td>
            <td className="border-2 border-black py-2">Atasan</td>
            <td className="border-2 border-black py-2">Pemohon</td>
          </tr>
        </thead>
        <tbody>
          <tr className="h-[100px]">
            <td className="border-2 border-black align-bottom pb-2"></td>
            <td className="border-2 border-black align-bottom pb-2"></td>
            <td className="border-2 border-black align-bottom pb-2"></td>
            <td className="border-2 border-black align-bottom pb-2 capitalize font-bold text-xs">
              {formData?.namaLengkap}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default TemplateDokumenA4;