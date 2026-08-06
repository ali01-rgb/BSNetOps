import React from 'react';

export default function KebijakanPrivasi() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-gray-700">
      <h1 className="text-3xl font-bold text-gray-800">Kebijakan Privasi</h1>
      <p className="text-sm text-gray-500">Terakhir diperbarui: August 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">1. Informasi yang Kami Kumpulkan</h2>
        <p className="text-sm leading-relaxed">
          Sistem BSNetOps mengumpulkan data aktivitas pengguna untuk kepentingan manajemen inventaris dan operasional jaringan internal, meliputi:
        </p>
        <ul className="list-disc ml-6 text-sm space-y-1">
          <li>Identitas Pengguna (Nama lengkap, NIP/ID Staf, dan Alamat Email Perusahaan).</li>
          <li>Log Aktivitas Sistem (Riwayat peminjaman aset, permintaan perubahan status jaringan, dan alamat IP perangkat).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">2. Penggunaan Informasi</h2>
        <p className="text-sm leading-relaxed">
          Data yang dikumpulkan hanya digunakan untuk:
        </p>
        <ul className="list-disc ml-6 text-sm space-y-1">
          <li>Memverifikasi hak akses pengguna terhadap fasilitas jaringan dan inventaris.</li>
          <li>Proses audit berkala atas penggunaan aset perusahaan/organisasi.</li>
          <li>Menjaga keamanan ekosistem jaringan dari akses tidak sah.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">3. Perlindungan Data</h2>
        <p className="text-sm leading-relaxed">
          Seluruh data pengguna disimpan dalam basis data terenkripsi dan tidak akan pernah dibagikan kepada pihak ketiga di luar kepentingan operasional resmi organisasi.
        </p>
      </section>
    </div>
  );
}