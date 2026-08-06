import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Bantuan() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      q: "Bagaimana cara mengajukan peminjaman aset/perangkat?",
      a: "Masuk ke Dashboard akun Anda, pilih menu 'Aset', tentukan perangkat yang ingin dipinjam, lalu isi formulir 'Ajukan Permintaan'. Permintaan Anda akan dikirim ke Manager untuk persetujuan."
    },
    {
      id: 2,
      q: "Berapa lama proses persetujuan (approval) peminjaman?",
      a: "Proses persetujuan oleh Manager dan Admin IT Operations biasanya memakan waktu maksimal 1x24 jam kerja."
    },
    {
      id: 3,
      q: "Apa yang harus dilakukan jika perangkat mengalami masalah teknis?",
      a: "Segera laporkan kendala melalui menu 'Lapor Kendala' di Dashboard atau hubungi Helpdesk IT Operations melalui nomor ekstensi internal."
    },
    {
      id: 4,
      q: "Bagaimana prosedur pengembalian barang?",
      a: "Bawa fisik perangkat ke meja IT Operations, lalu pastikan Admin melakukan verifikasi pengembalian pada sistem BSNetOps."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003d2d] via-[#00533d] to-[#00664b] text-white py-12 px-6 shadow-md relative">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-200 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm mb-6"
          >
            ← Kembali ke Landing Page
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Pusat Bantuan & Helpdesk</h1>
          <p className="text-emerald-100 text-sm mt-2 max-w-xl">
            Punya pertanyaan seputar penggunaan aplikasi BSNetOps atau peminjaman inventaris? Temukan solusinya di sini.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-[#00533d] rounded-xl font-bold text-xl">📧</div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Email Support IT Ops</h3>
              <p className="text-xs text-slate-500 mt-0.5">Layanan bantuan resmi via email</p>
              <a href="mailto:it-ops@bsnetops.internal" className="text-xs font-semibold text-[#00533d] mt-2 inline-block hover:underline">
                it-ops@bsnetops.internal
              </a>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-[#00533d] rounded-xl font-bold text-xl">☎️</div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Ekstensi Internal Hotline</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hubungi langsung telepon kantor</p>
              <span className="text-xs font-semibold text-[#00533d] mt-2 inline-block">
                Ext. 404 / 405 (Jam Kerja)
              </span>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00533d]"></span>
            Pertanyaan Sering Diajukan (FAQ)
          </h2>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.id} className="py-4">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center text-left font-medium text-slate-800 text-sm hover:text-[#00533d] transition"
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 text-slate-400 font-bold text-lg">
                    {openFaq === faq.id ? '−' : '+'}
                  </span>
                </button>
                {openFaq === faq.id && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}