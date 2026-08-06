import React from 'react';
import { Link } from 'react-router-dom';

export default function KebijakanPrivasi() {
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Kebijakan Privasi</h1>
            <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-2.5 py-1 rounded-full font-semibold">
              v1.0
            </span>
          </div>
          <p className="text-emerald-100 text-xs mt-2">Terakhir Diperbarui: 6 Agustus 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-sm leading-relaxed text-slate-600">
          
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-[#00533d] text-xs font-bold">1</span>
              Pengumpulan Informasi
            </h2>
            <p className="pl-8 text-xs leading-normal">
              Aplikasi BSNetOps mencatat informasi tertentu milik staf/pengguna internal untuk mendukung tata kelola aset perusahaan yang akuntabel. Data yang dikumpulkan meliputi:
            </p>
            <ul className="pl-12 list-disc text-xs space-y-1 text-slate-600">
              <li>Identitas resmi (Nama lengkap, NIP/ID Karyawan, Jabatan, dan Email internal).</li>
              <li>Riwayat permintaan, peminjaman, serta pengembalian barang inventaris.</li>
              <li>Alamat IP lokal dan log aktivitas sistem untuk kebutuhan audit IT.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-[#00533d] text-xs font-bold">2</span>
              Penggunaan Data
            </h2>
            <p className="pl-8 text-xs leading-normal">
              Seluruh data yang tercatat dalam sistem digunakan secara eksklusif untuk kepentingan internal:
            </p>
            <ul className="pl-12 list-disc text-xs space-y-1 text-slate-600">
              <li>Memproses pengajuan dan validasi izin peminjaman perangkat.</li>
              <li>Penyusunan Laporan Hasil Audit (LHA) inventaris berkala.</li>
              <li>Mencegah dan mendeteksi penggunaan fasilitas jaringan secara tidak sah.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-[#00533d] text-xs font-bold">3</span>
              Keamanan & Kerahasiaan
            </h2>
            <p className="pl-8 text-xs leading-normal">
              Data disimpan dalam basis data terenkripsi milik Bank Syariah Nasional. Kami menjamin bahwa tidak ada data pengguna yang diperjualbelikan atau disebarluaskan kepada pihak ketiga di luar instansi resmi.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}