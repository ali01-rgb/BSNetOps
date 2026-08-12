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
    <div className="min-h-screen bg-gradient-to-b from-[#40725a] via-[#c1d3ca] to-[#f8faf9] text-slate-800 pb-20 font-sans">
      
      {/* Header: Warna solid hijau gelap kontras */}
      <div className="pt-12 pb-28 px-6 md:px-12 text-center bg-[#00664b] shadow-md border-b border-[#003d2d]">
        <p className="text-emerald-200 text-xs font-extrabold tracking-[0.2em] uppercase mb-2">
          Dokumen Kebijakan Internal
        </p>

        <div className="relative w-full flex items-center justify-center">
          <Link
            to="/"
            className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 text-xs font-medium text-emerald-100 hover:text-white transition bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20"
          >
            ← Kembali
          </Link>
          
          {/* font-serif diganti jadi font-extrabold bawaan sans biar selaras dashboard */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Kebijakan Privasi
          </h1>
        </div>
      </div>

      {/* Main Content: Kertas Solid */}
      <div className="px-6 md:px-12 flex justify-center -mt-16 relative z-10">
        
        {/* bg-white/75 dan backdrop-blur dihapus, diganti jadi bg-white solid dengan border rapi */}
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-300/40 p-8 md:p-14">

          <div className="space-y-12 text-sm text-slate-700 leading-relaxed">
            {sections.map((s, i) => (
              <section key={s.id}>
                {/* font-serif dihilangkan, ketebalan disesuaikan */}
                <h2 className="text-lg md:text-xl font-semibold text-slate-900 pb-2 mb-4 border-b-2 border-[#00533d]/15">
                  {String(i + 1).padStart(2, '0')}. {s.title}
                </h2>
                <p className="text-sm leading-relaxed">{s.intro}</p>
                {s.points.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {s.points.map((p, idx) => (
                      <li key={idx} className="flex gap-4 text-sm">
                        <span className="text-[#00533d] font-bold shrink-0 mt-0.5">
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

        </div>
      </div>
    </div>
  );
}