import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

export const generateLaporanActivityLog = async (data, namaPeriode, toastId) => {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Nama sheet max 31 karakter
    const safeSheetName = `Log Aktifitas`.slice(0, 31);
    const worksheet = workbook.addWorksheet(safeSheetName);

    // 1. Setup Kolom Tabel Activity Log
    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'ID Transaksi', key: 'idTransaksi', width: 22 },
      { header: 'Tipe Transaksi', key: 'tipe', width: 18 },
      { header: 'Nama Pemohon', key: 'pemohon', width: 30 },
      { header: 'Unit / KC', key: 'unit', width: 20 },
      { header: 'Nama Barang', key: 'barang', width: 35 },
      { header: 'Jumlah', key: 'jumlah', width: 12 },
      { header: 'Tanggal', key: 'tanggal', width: 22 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // 2. Styling Header (Hijau BSN)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; 
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00664B' } // Hijau BSN
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // 3. Masukkan Data ke Worksheet
    let totalKuantitas = 0;

    data.forEach((item, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        idTransaksi: item["ID Transaksi"] || '-',
        tipe: item["Tipe Transaksi"] || '-',
        pemohon: item["Nama Pemohon"] || '-',
        unit: item["Unit / KC"] || '-',
        barang: item["Nama Barang / Logistik"] || '-',
        jumlah: item["Jumlah (Unit)"] || 0,
        tanggal: item["Tanggal Transaksi"] || '-',
        status: item["Status"] || '-'
      });

      // Akumulasi total barang masuk/keluar
      totalKuantitas += (Number(item["Jumlah (Unit)"]) || 0);

      // Styling Baris Data (Border & Alignment)
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        
        // Rata kiri untuk teks panjang (Pemohon, Barang)
        if (colNumber === 4 || colNumber === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    // 4. Tambahkan Baris Grand Total (Kuning Emas)
    const totalRow = worksheet.addRow({
      barang: 'TOTAL ITEM TERPROSES',
      jumlah: totalKuantitas
    });

    // Gabungkan kolom 1 sampai 5 untuk label total
    worksheet.mergeCells(`A${totalRow.number}:F${totalRow.number}`);

    totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Jika cell ada di rentang kolom tabel
      if (colNumber <= worksheet.columns.length) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFDE047' } // Kuning
        };
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        if (colNumber === 1) {
           cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else if (colNumber === 7) {
           cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
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