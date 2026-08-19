import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

export const exportLaporanOpnameStyled = async (data, fileName = "Laporan_Opname.xlsx") => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Opname');

    // 1. Atur Lebar Kolom
    worksheet.columns = [
      { key: 'no', width: 6 },
      { key: 'kodeBarang', width: 22 },
      { key: 'namaBarang', width: 35 },
      { key: 'kategori', width: 18 },
      { key: 'stokAwal', width: 12 },
      { key: 'barangMasuk', width: 15 },
      { key: 'barangKeluar', width: 15 },
      { key: 'stokAkhir', width: 12 },
    ];

    // 2. Tambahkan Baris Header
    const headerRow = worksheet.addRow([
      'No', 'Kode Barang', 'Nama Barang', 'Kategori', 
      'Stok Awal', 'Barang Masuk', 'Barang Keluar', 'Stok Akhir'
    ]);

    // Styling Header (Warna Hijau BSN, Teks Putih, Bold, Rata Tengah)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00664B' } // Hijau BSN (#00664b)
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' }, // Putih
        bold: true
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // 3. Masukkan Data dan Hitung Akumulasi Total
    let totalAwal = 0;
    let totalMasuk = 0;
    let totalKeluar = 0;
    let totalAkhir = 0;

    data.forEach((item, index) => {
      const row = worksheet.addRow([
        index + 1,
        item.kodeBarang || '-',
        item.namaBarang || '-',
        item.kategori || '-',
        item.stokAwal || 0,
        item.barangMasuk || 0,
        item.barangKeluar || 0,
        item.stokAkhir || 0
      ]);

      totalAwal += (item.stokAwal || 0);
      totalMasuk += (item.barangMasuk || 0);
      totalKeluar += (item.barangKeluar || 0);
      totalAkhir += (item.stokAkhir || 0);

      // Styling Baris Data
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        
        // Kolom angka di tengah, teks di kiri
        if ([1, 5, 6, 7, 8].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // 4. Tambahkan Baris "TOTAL KESELURUHAN" di Paling Bawah
    const totalRow = worksheet.addRow([
      '', '', 'TOTAL KESELURUHAN', '', 
      totalAwal, totalMasuk, totalKeluar, totalAkhir
    ]);

    // Styling Baris Total (Warna Kuning Gold, Bold)
    totalRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC000' } // Kuning Gold
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      
      if (colNumber === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    // 5. Ekspor dan Download File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  } catch (error) {
    console.error("Gagal export excel:", error);
    toast.error("Gagal mendownload laporan opname.");
  }
};
