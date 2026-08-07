import React from 'react';
import { Link } from 'react-router-dom';

export default function KebijakanPrivasi() {
  const sections = [
    {
      id: 'pengumpulan',
      title: 'Pengumpulan Informasi',
      intro:
        'Aplikasi BSNetOps mencatat informasi tertentu milik staf/pengguna internal untuk mendukung tata kelola aset perusahaan yang akuntabel. Data yang dikumpulkan meliputi:',
      points: [
        'Identitas resmi (Nama lengkap, NIP/ID Karyawan, Jabatan, dan Email internal).',
        'Riwayat permintaan, peminjaman, serta pengembalian barang inventaris.',
        'Alamat IP lokal dan log aktivitas sistem untuk kebutuhan audit IT.'
      ]
    },
    {
      id: 'penggunaan',
      title: 'Penggunaan Data',
      intro: 'Seluruh data yang tercatat dalam sistem digunakan secara eksklusif untuk kepentingan internal:',
      points: [
        'Memproses pengajuan dan validasi izin peminjaman perangkat.',
        'Penyusunan Laporan Hasil Audit (LHA) inventaris berkala.',
        'Mencegah dan mendeteksi penggunaan fasilitas jaringan secara tidak sah.'
      ]
    },
    {
      id: 'keamanan',
      title: 'Keamanan & Kerahasiaan',
      intro:
        'Data disimpan dalam basis data terenkripsi milik Bank Syariah Nasional. Kami menjamin bahwa tidak ada data pengguna yang diperjualbelikan atau disebarluaskan kepada pihak ketiga di luar instansi resmi.',
      points: []
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 pb-20">
      {/* Header - Dibuat lebih pendek (py-8) dan langsung rata kiri (px-12 lg:px-24) */}
      <div className="bg-gradient-to-r from-[#003d2d] via-[#00533d] to-[#00664b] text-white py-8 px-12 lg:px-24 shadow-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-emerald-200 hover:text-white transition bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm mb-6"
        >
          ← Kembali ke Landing Page
        </Link>
        <p className="text-emerald-300 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
          Dokumen Kebijakan Internal
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Kebijakan Privasi</h1>
      </div>

      {/* Main Content - Sejajar kiri dengan header, lebar dibatasi, font sedikit dibesarkan */}
      <div className="px-12 lg:px-24 mt-10">
        <div className="relative max-w-4xl bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8 md:p-12">
          
          {/* Watermark stamp */}
          <div className="absolute top-6 right-6 rotate-12 border-2 border-rose-300/60 text-rose-400/70 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md select-none pointer-events-none">
            Rahasia
          </div>

          {/* Intro text (Optional, if you want to replace the meta bar info subtly) */}
          <p className="text-xs text-slate-400 mb-8 pb-4 border-b border-slate-100">
            No. Dokumen: PRIV/BSN-OPS/2026/001 | Efektif: 6 Agustus 2026
          </p>

          <div className="space-y-12 text-sm text-slate-600 leading-relaxed">
            {sections.map((s, i) => (
              <section key={s.id}>
                <h2 className="font-serif text-xl font-bold text-slate-800 pb-2 mb-4 border-b-2 border-[#00533d]/15">
                  {String(i + 1).padStart(2, '0')}. {s.title}
                </h2>
                <p className="text-sm leading-relaxed">{s.intro}</p>
                {s.points.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {s.points.map((p, idx) => (
                      <li key={idx} className="flex gap-4 text-sm">
                        <span className="font-serif text-[#00533d]/50 font-bold shrink-0 mt-0.5">
                          {i + 1}.{idx + 1}
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Footer Card */}
          <div className="mt-12 pt-6 border-t border-dashed border-slate-200 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-400">
            <span>Dicetak otomatis oleh Sistem BSNetOps</span>
            <span>Halaman 1 dari 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}