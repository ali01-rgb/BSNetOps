import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function RiwayatPermintaan() {
  // Data dummy jejak digital permohonan inventaris milik user
  const logRiwayat = [
    { id: 1, barang: 'Kertas HVS A4', jumlah: 2, tgl: '03 Jul 2026', status: 'Pending', ket: 'Kebutuhan cetak laporan bulanan' },
    { id: 2, barang: 'Dell Monitor UltraSharp 24"', jumlah: 1, tgl: '04 Mar 2026', status: 'Approved', ket: 'Setup workspace tambahan staf' },
    { id: 3, barang: 'Ballpoint Hitam Gell', jumlah: 10, tgl: '20 Feb 2026', status: 'Rejected', ket: 'Stok logistik sedang kosong' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-800">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Riwayat Log Permintaan</h2>
        <p className="text-xs text-white font-normal mt-1">Pantau status persetujuan berkas permohonan inventaris Anda secara real-time.</p>
      </div>

      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-[#58a27d] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Keperluan</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold text-zinc-700 divide-y divide-zinc-100">
              {logRiwayat.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3.5 px-4 text-zinc-600 font-normal">{log.tgl}</td>
                  <td className="py-3.5 px-4 text-zinc-900">{log.barang}</td>
                  <td className="py-3.5 px-4">{log.jumlah} Pcs</td>
                  <td className="py-3.5 px-4 text-zinc-600 font-normal max-w-xs truncate">{log.ket}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex justify-center">
                      {log.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {log.status === 'Approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00664b] border border-emerald-100">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      )}
                      {log.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}