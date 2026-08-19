import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

export const generateLaporanActivityLog = async (data, namaPeriode = 'Semua_Waktu', toastId) => {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Nama sheet Excel dibatasi maks 31 karakter
    const safeSheetName = `Log Aktifitas`.slice(0, 31);
    const worksheet = workbook.addWorksheet(safeSheetName);

    // 1. Setup Lebar Kolom Tabel Activity Log
    worksheet.columns = [
      { key: 'no', width: 6 },
      { key: 'idTransaksi', width: 22 },
      { key: 'tipe', width: 16 },
      { key: 'pemohon', width: 28 },
      { key: 'unit', width: 20 },
      { key: 'barang', width: 35 },
      { key: 'jumlah', width: 14 },
      { key: 'tanggal', width: 22 },
      { key: 'status', width: 16 }
    ];

    // 2. Baris Header Tabel
    const headerRow = worksheet.addRow([
      'No', 
      'ID Transaksi', 
      'Tipe Transaksi', 
      'Nama Pemohon', 
      'Unit / KC', 
      'Nama Barang', 
      'Jumlah (Unit)', 
      'Tanggal', 
      'Status'
    ]);

    // Styling Header (Warna Hijau BSN, Teks Putih Bold, Rata Tengah)
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00664B' } // Hijau BSN (#00664b)
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    headerRow.height = 26;

    // 3. Masukkan Data & Hitung Akumulasi Total
    let totalKuantitas = 0;

    data.forEach((item, index) => {
      const qty = Number(item["Jumlah (Unit)"] ?? item.qty ?? 0) || 0;
      totalKuantitas += qty;

      const row = worksheet.addRow([
        index + 1,
        item["ID Transaksi"] || item.id || '-',
        item["Tipe Transaksi"] || item.type || '-',
        item["Nama Pemohon"] || item.requester || '-',
        item["Unit / KC"] || item.unit || '-',
        item["Nama Barang / Logistik"] || item.itemName || '-',
        qty,
        item["Tanggal Transaksi"] || item.date || '-',
        item["Status"] || item.managerStatus || '-'
      ]);

      // Styling Seluruh Sel Data
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // Kolom 4 (Pemohon) & Kolom 6 (Nama Barang) dibuat rata kiri, sisanya rata tengah
        if (colNumber === 4 || colNumber === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    // 4. Baris Total di Bagian Bawah
    const totalRow = worksheet.addRow([
      '', '', '', '', 'TOTAL ITEM TERPROSES', '', 
      totalKuantitas, '', ''
    ]);

    // Styling Baris Total (Warna Kuning Gold Penuh)
    totalRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC000' } // Kuning Gold (#FFC000)
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };

      if (colNumber === 5) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });

    // 5. Download File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const finalFileName = `Laporan_Activity_Log_${namaPeriode}.xlsx`;

    saveAs(blob, finalFileName);

    if (toastId) {
      toast.success(`Laporan berhasil diunduh!`, { id: toastId });
    } else {
      toast.success(`Laporan berhasil diunduh!`);
    }

  } catch (error) {
    if (toastId) toast.error('Gagal menyusun Excel: ' + error.message, { id: toastId });
    throw error;
  }
};