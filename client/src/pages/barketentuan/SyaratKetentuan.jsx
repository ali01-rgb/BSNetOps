import React from 'react';
import { Link } from 'react-router-dom';

export default function SyaratKetentuan() {
  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003d2d] via-[#00533d] to-[#00664b] text-white py-12 px-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-200 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm mb-6"
          >
            ← Kembali ke Landing Page
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Syarat & Ketentuan</h1>
          <p className="text-emerald-100 text-xs mt-2">Ketentuan Penggunaan Aplikasi & Manajemen Aset BSNetOps</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm text-center">
            <div className="w-10 h-10 bg-emerald-50 text-[#00533d] rounded-xl mx-auto flex items-center justify-center font-bold text-lg mb-2">👤</div>
            <h3 className="font-bold text-slate-800 text-xs">Akun Personal</h3>
            <p className="text-[11px] text-slate-500 mt-1">Dilarang memindahtangankan kredensial login kepada siapapun.</p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm text-center">
            <div className="w-10 h-10 bg-emerald-50 text-[#00533d] rounded-xl mx-auto flex items-center justify-center font-bold text-lg mb-2">📦</div>
            <h3 className="font-bold text-slate-800 text-xs">Tanggung Jawab Aset</h3>
            <p className="text-[11px] text-slate-500 mt-1">Wajib menjaga kondisi fisik & kelengkapan perangkat yang dipinjam.</p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm text-center">
            <div className="w-10 h-10 bg-emerald-50 text-[#00533d] rounded-xl mx-auto flex items-center justify-center font-bold text-lg mb-2">⏱️</div>
            <h3 className="font-bold text-slate-800 text-xs">Ketepatan Waktu</h3>
            <p className="text-[11px] text-slate-500 mt-1">Pengembalian wajib sesuai jadwal batas peminjaman yang disetujui.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-5 text-xs text-slate-600 leading-relaxed">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            Ketentuan Lengkap Penggunaan Sistem
          </h2>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-xs">1. Hak dan Kewajiban Pengguna</h3>
            <p>
              Pengguna berhak mengajukan permintaan peminjaman inventaris yang tersedia di katalog sesuai kebutuhan operasional. Pengguna bertanggung jawab penuh atas segala bentuk kerusakan yang terjadi akibat kelalaian penggunaan.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-xs">2. Kebijakan Sanksi & Kerusakan</h3>
            <p>
              Apabila terjadi kerusakan atau kehilangan perangkat selama masa peminjaman, pengguna wajib segera melapor ke IT Operations. Penanganan kelalaian akan diproses berdasarkan Standar Operasional Prosedur (SOP) ganti rugi perusahaan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}