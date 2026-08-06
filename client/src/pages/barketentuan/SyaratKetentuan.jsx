import React from 'react';
import { Link } from 'react-router-dom';

export default function SyaratKetentuan() {
  const pasal = [
    {
      no: 1,
      icon: '🔐',
      title: 'Hak dan Kewajiban Pengguna',
      body:
        'Pengguna berhak mengajukan permintaan peminjaman inventaris yang tersedia di katalog sesuai kebutuhan operasional. Pengguna bertanggung jawab penuh atas segala bentuk kerusakan yang terjadi akibat kelalaian penggunaan.'
    },
    {
      no: 2,
      icon: '📦',
      title: 'Tanggung Jawab Aset',
      body:
        'Setiap perangkat yang dipinjam wajib dijaga kondisi fisik dan kelengkapannya. Kehilangan aksesori atau kelengkapan bawaan menjadi tanggung jawab peminjam hingga masa pinjam berakhir.'
    },
    {
      no: 3,
      icon: '⏱️',
      title: 'Ketepatan Waktu Pengembalian',
      body:
        'Pengembalian wajib dilakukan sesuai jadwal batas peminjaman yang telah disetujui. Keterlambatan tanpa konfirmasi dapat memengaruhi kuota peminjaman berikutnya.'
    },
    {
      no: 4,
      icon: '⚠️',
      title: 'Kebijakan Sanksi & Kerusakan',
      body:
        'Apabila terjadi kerusakan atau kehilangan perangkat selama masa peminjaman, pengguna wajib segera melapor ke IT Operations. Penanganan kelalaian akan diproses berdasarkan Standar Operasional Prosedur (SOP) ganti rugi perusahaan.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003d2d] via-[#00533d] to-[#00664b] text-white py-12 px-6 shadow-md">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-200 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm mb-6"
          >
            ← Kembali ke Landing Page
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Syarat & Ketentuan</h1>
          <p className="text-emerald-100 text-xs mt-2">Perjanjian Penggunaan Aplikasi & Manajemen Aset BSNetOps</p>

          {/* Article progress dots */}
          <div className="flex items-center gap-2 mt-5">
            {pasal.map((p) => (
              <span key={p.no} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300/70" />
                {p.no !== pasal.length && <span className="w-4 h-px bg-emerald-300/30" />}
              </span>
            ))}
            <span className="text-[10px] text-emerald-200 ml-1">{pasal.length} pasal</span>
          </div>
        </div>
      </div>

      {/* Timeline of pasal */}
      <div className="max-w-3xl mx-auto px-6 mt-10">
        <div className="relative pl-10">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />

          {pasal.map((p) => (
            <div key={p.no} className="relative mb-8 last:mb-0">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-white border-2 border-[#00533d] flex items-center justify-center text-xs font-bold text-[#00533d] shadow-sm">
                {p.no}
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{p.icon}</span>
                  <h3 className="text-sm font-bold text-slate-800">
                    Pasal {p.no} — {p.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">{p.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Agreement / signature block */}
        <div className="mt-10 relative border-2 border-dashed border-emerald-200 rounded-2xl p-6 bg-emerald-50/40">
          <span className="absolute -top-3 left-5 bg-[#f8faf9] px-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Persetujuan
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dengan mengakses dan menggunakan sistem BSNetOps, Anda menyatakan telah membaca, memahami, dan menyetujui
            seluruh Pasal 1 hingga Pasal {pasal.length} di atas sebagai bagian dari ketentuan penggunaan resmi
            perusahaan.
          </p>
          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-4 h-4 rounded border-2 border-[#00533d] flex items-center justify-center text-[#00533d] text-[10px]">
                ✓
              </span>
              Disetujui otomatis saat pendaftaran akun
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ref: TOS/BSN-OPS/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}