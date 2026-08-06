import React from 'react';

export default function Bantuan() {
  const faqs = [
    {
      q: "Bagaimana cara mengajukan peminjaman perangkat/inventaris?",
      a: "Masuk ke menu Dashboard, pilih katalog perangkat yang tersedia, pilih jumlah dan durasi peminjaman, lalu klik 'Ajukan Peminjaman'."
    },
    {
      q: "Berapa lama proses persetujuan (approval) alat?",
      a: "Persetujuan dilakukan oleh Admin IT Operations maksimal 1x24 jam kerja."
    },
    {
      q: "Apa yang harus dilakukan jika terjadi kendala jaringan/alat rusak?",
      a: "Buka menu 'Lapor Kendala', sertakan foto/detail kerusakan, atau hubungi langsung Tim IT Ops melalui kontak emergency di bawah."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Pusat Bantuan & FAQ</h1>
        <p className="text-gray-600 mt-2">Temukan jawaban atas pertanyaan umum seputar operasional BSNetOps.</p>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Pertanyaan Sering Diajukan</h2>
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold text-gray-800">{faq.q}</h3>
            <p className="text-gray-600 mt-1 text-sm">{faq.a}</p>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900">Butuh Bantuan Lebih Lanjut?</h2>
        <p className="text-blue-700 text-sm mt-1">Tim IT Operations siap membantu kendala operasional Anda.</p>
        <div className="mt-4 text-sm text-blue-800 space-y-1">
          <p>📧 Email: <strong>it-ops@bsnetops.internal</strong></p>
          <p>☎️ Ext. Office: <strong>404 / 405</strong></p>
        </div>
      </div>
    </div>
  );
}