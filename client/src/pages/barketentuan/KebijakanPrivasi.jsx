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
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003d2d] via-[#00533d] to-[#00664b] text-white pt-10 pb-6 px-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-200 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm mb-6"
          >
            ← Kembali ke Landing Page
          </Link>
          <p className="text-emerald-300 text-[11px] font-semibold tracking-[0.2em] uppercase mb-1">
            Dokumen Kebijakan Internal
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">Kebijakan Privasi</h1>
        </div>
      </div>

      {/* Document meta strip */}
      <div className="max-w-5xl mx-auto px-6 -mt-px">
        <div className="bg-[#00382a] text-emerald-100 text-[11px] rounded-b-xl px-6 py-3 flex flex-wrap gap-x-8 gap-y-1.5 shadow-md">
          <span><span className="text-emerald-400/70">No. Dokumen:</span> PRIV/BSN-OPS/2026/001</span>
          <span><span className="text-emerald-400/70">Versi:</span> 1.0</span>
          <span><span className="text-emerald-400/70">Berlaku Efektif:</span> 6 Agustus 2026</span>
          <span><span className="text-emerald-400/70">Klasifikasi:</span> Internal</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10 grid md:grid-cols-[200px_1fr] gap-8">
        {/* Sticky table of contents */}
        <aside className="hidden md:block">
          <div className="sticky top-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Daftar Isi</p>
            <nav className="space-y-1 border-l border-slate-200">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block pl-4 py-1.5 text-xs text-slate-500 hover:text-[#00533d] hover:border-[#00533d] border-l-2 border-transparent -ml-px transition-colors"
                >
                  {String(i + 1).padStart(2, '0')} — {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Document body */}
        <div className="relative bg-white border border-slate-200/80 rounded-2xl shadow-sm p-8 md:p-10">
          {/* Watermark stamp */}
          <div className="absolute top-5 right-5 rotate-12 border-2 border-rose-300/60 text-rose-400/70 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md select-none pointer-events-none">
            Rahasia
          </div>

          <div className="space-y-10 text-sm text-slate-600 leading-relaxed">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-8">
                <h2 className="font-serif text-lg font-bold text-slate-800 pb-2 mb-3 border-b-2 border-[#00533d]/15">
                  {String(i + 1).padStart(2, '0')}. {s.title}
                </h2>
                <p className="text-xs leading-normal">{s.intro}</p>
                {s.points.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {s.points.map((p, idx) => (
                      <li key={idx} className="flex gap-3 text-xs">
                        <span className="font-serif text-[#00533d]/50 font-semibold shrink-0">
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

          <div className="mt-10 pt-5 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Dicetak otomatis oleh Sistem BSNetOps</span>
            <span>Halaman 1 dari 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}