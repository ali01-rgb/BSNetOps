import React from 'react';

export default function SyaratKetentuan() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-gray-700">
      <h1 className="text-3xl font-bold text-gray-800">Syarat & Ketentuan Penggunaan</h1>
      <p className="text-sm text-gray-500">Terakhir diperbarui: August 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">1. Ketentuan Akun Pengguna</h2>
        <p className="text-sm leading-relaxed">
          Akses ke sistem BSNetOps hanya diberikan kepada personel terotorisasi. Pengguna bertanggung jawab penuh atas kerahasiaan kredensial akun masing-masing dan wajib melaporkan jika indikasi kebocoran akun terjadi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">2. Tanggung Jawab Aset & Inventaris</h2>
        <ul className="list-disc ml-6 text-sm space-y-2">
          <li>Perangkat yang dipinjam harus dikembalikan tepat waktu sesuai durasi yang diajukan.</li>
          <li>Pengguna wajib menjaga kondisi fisik dan fungsi perangkat agar tetap baik selama masa peminjaman.</li>
          <li>Dilarang memindahtangankan barang yang dipinjam kepada pihak lain tanpa tercatat di dalam sistem BSNetOps.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">3. Kerusakan dan Kehilangan</h2>
        <p className="text-sm leading-relaxed">
          Segala bentuk kerusakan akibat kelalaian penggunaan atau kehilangan aset akan diproses sesuai dengan Standar Operasional Prosedur (SOP) ganti rugi dan tata tertib internal yang berlaku.
        </p>
      </section>
    </div>
  );
}