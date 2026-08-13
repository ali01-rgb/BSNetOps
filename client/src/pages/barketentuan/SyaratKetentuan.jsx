import React from 'react';

export default function SyaratKetentuan() {
  const sections = [
    {
      id: 'pasal-1',
      title: 'Pasal 1 — Ketentuan Umum',
      intro: 'Dalam syarat dan ketentuan ini, yang dimaksud dengan:',
      points: [
        'Sistem BSNetOps adalah platform manajemen inventaris dan operasional jaringan internal milik Bank Syariah Nasional.',
        'Pengguna adalah staf, karyawan, atau pihak terotorisasi yang memiliki hak akses terdaftar ke dalam sistem BSNetOps.',
        'Aset adalah seluruh perangkat keras (hardware), perangkat lunak (software), maupun lisensi yang terdaftar di dalam katalog inventaris operasional.'
      ]
    },
    {
      id: 'pasal-2',
      title: 'Pasal 2 — Hak dan Kewajiban Pengguna',
      intro: 'Setiap pengguna yang terdaftar pada sistem memiliki hak dan kewajiban sebagai berikut:',
      points: [
        'Hak: Pengguna berhak mengajukan permohonan peminjaman aset sesuai dengan kebutuhan operasional pekerjaan divisi masing-masing.',
        'Kewajiban: Pengguna wajib menjaga kerahasiaan kredensial akun dan dilarang memindahtangankannya kepada pihak lain.',
        'Kewajiban: Pengguna wajib merawat dan menjaga kondisi fisik, fungsi, serta kelengkapan aset yang dipinjam dari kerusakan atau kehilangan.'
      ]
    },
    {
      id: 'pasal-3',
      title: 'Pasal 3 — Prosedur Penggunaan Aset',
      intro: 'Penggunaan aset yang difasilitasi oleh perusahaan tunduk pada aturan operasional berikut:',
      points: [
        'Aset hanya boleh digunakan untuk kepentingan pekerjaan dan dilarang keras digunakan untuk aktivitas ilegal atau melanggar hukum.',
        'Pengembalian aset wajib dilakukan selambat-lambatnya pada tanggal jatuh tempo yang telah disetujui di dalam sistem oleh Manager.',
        'Perpanjangan durasi pinjam harus diajukan sebelum masa pinjam aktif berakhir dan harus mendapatkan persetujuan ulang.'
      ]
    },
    {
      id: 'pasal-4',
      title: 'Pasal 4 — Sanksi dan Ganti Rugi',
      intro: 'Perusahaan berhak memberikan sanksi atas pelanggaran syarat dan ketentuan ini, yang meliputi:',
      points: [
        'Keterlambatan pengembalian tanpa konfirmasi dapat mengakibatkan penangguhan (suspend) hak peminjaman pengguna di masa mendatang.',
        'Segala bentuk kerusakan fisik, malfungsi akibat kelalaian penggunaan, atau kehilangan aset sepenuhnya menjadi tanggung jawab pengguna yang bersangkutan.',
        'Pengguna wajib melakukan penggantian unit yang sama atau membayar ganti rugi sesuai nilai depresiasi aset berdasarkan SOP Perusahaan yang berlaku.'
      ]
    }
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-300/40 p-8 md:p-14">
      <div className="space-y-12 text-sm text-slate-700 leading-relaxed">
        {sections.map((s, i) => (
          <section key={s.id}>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 pb-2 mb-4 border-b-2 border-[#00664b]/15">
              {s.title}
            </h2>
            <p className="text-sm leading-relaxed mb-4">{s.intro}</p>
            {s.points.length > 0 && (
              <ul className="space-y-3">
                {s.points.map((p, idx) => (
                  <li key={idx} className="flex gap-4 text-sm">
                    <span className="text-[#00664b] font-bold shrink-0 mt-0.5">
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

      <div className="mt-16 pt-8 border-t border-dashed border-slate-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-emerald-50/50 border border-emerald-100/80 p-6 rounded-2xl">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">Pernyataan Persetujuan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dengan mendaftar, mengakses, dan menggunakan sistem BSNetOps, Anda secara otomatis menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan dalam dokumen ini tanpa paksaan dari pihak mana pun.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <span className="inline-flex items-center gap-2 bg-[#00533d] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-3 h-3 rounded-full bg-emerald-400 flex items-center justify-center text-[#00533d] text-[8px]">✓</span>
              Disetujui Oleh Sistem
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-medium">Doc Ref: TOS/BSN-OPS/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}