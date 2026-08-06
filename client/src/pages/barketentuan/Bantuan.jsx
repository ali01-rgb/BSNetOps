import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function Bantuan() {
  const [openFaq, setOpenFaq] = useState(1);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const faqs = [
    {
      id: 1,
      category: 'Peminjaman',
      q: 'Bagaimana cara mengajukan peminjaman aset/perangkat?',
      a: "Masuk ke Dashboard akun Anda, pilih menu 'Aset', tentukan perangkat yang ingin dipinjam, lalu isi formulir 'Ajukan Permintaan'. Permintaan Anda akan dikirim ke Manager untuk persetujuan."
    },
    {
      id: 2,
      category: 'Approval',
      q: 'Berapa lama proses persetujuan (approval) peminjaman?',
      a: 'Proses persetujuan oleh Manager dan Admin IT Operations biasanya memakan waktu maksimal 1x24 jam kerja.'
    },
    {
      id: 3,
      category: 'Teknis',
      q: 'Apa yang harus dilakukan jika perangkat mengalami masalah teknis?',
      a: "Segera laporkan kendala melalui menu 'Lapor Kendala' di Dashboard atau hubungi Helpdesk IT Operations melalui nomor ekstensi internal."
    },
    {
      id: 4,
      category: 'Pengembalian',
      q: 'Bagaimana prosedur pengembalian barang?',
      a: 'Bawa fisik perangkat ke meja IT Operations, lalu pastikan Admin melakukan verifikasi pengembalian pada sistem BSNetOps.'
    }
  ];

  const categories = ['Semua', 'Peminjaman', 'Approval', 'Teknis', 'Pengembalian'];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchCategory = activeCategory === 'Semua' || f.category === activeCategory;
      const matchQuery =
        query.trim() === '' ||
        f.q.toLowerCase().includes(query.toLowerCase()) ||
        f.a.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [query, activeCategory]);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const categoryDot = {
    Peminjaman: 'bg-sky-400',
    Approval: 'bg-amber-400',
    Teknis: 'bg-rose-400',
    Pengembalian: 'bg-violet-400'
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003d2d] via-[#00533d] to-[#00664b] text-white py-12 px-6 shadow-md relative overflow-hidden">
        {/* subtle decorative grid, like a network/ops backdrop */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />
        <div className="max-w-4xl mx-auto relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-200 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm mb-6"
          >
            ← Kembali ke Landing Page
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-400/15 text-emerald-200 border border-emerald-300/25 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Helpdesk Online
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Pusat Bantuan & Helpdesk</h1>
          <p className="text-emerald-100 text-sm mt-2 max-w-xl">
            Punya pertanyaan seputar penggunaan aplikasi BSNetOps atau peminjaman inventaris? Temukan solusinya di sini.
          </p>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 backdrop-blur-sm focus-within:bg-white/15 focus-within:border-white/30 transition">
              <svg className="w-4 h-4 text-emerald-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari pertanyaan, misal: pengembalian barang..."
                className="bg-transparent outline-none text-sm text-white placeholder:text-emerald-200/70 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="group p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-[#00533d] rounded-xl font-bold text-xl group-hover:bg-emerald-100 transition-colors shrink-0">
              📧
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Email Support IT Ops</h3>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  SLA ~4 jam
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Layanan bantuan resmi via email</p>
              <a
                href="mailto:it-ops@bsnetops.internal"
                className="text-xs font-semibold text-[#00533d] mt-2 inline-flex items-center gap-1 hover:gap-1.5 hover:underline transition-all"
              >
                it-ops@bsnetops.internal
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>

          <div className="group p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-[#00533d] rounded-xl font-bold text-xl group-hover:bg-emerald-100 transition-colors shrink-0">
              ☎️
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Ekstensi Internal Hotline</h3>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Hubungi langsung telepon kantor</p>
              <span className="text-xs font-semibold text-[#00533d] mt-2 inline-block">
                Ext. 404 / 405 (Jam Kerja)
              </span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00533d]" />
              Pertanyaan Sering Diajukan
            </h2>
            <span className="text-xs text-slate-400">{filteredFaqs.length} pertanyaan</span>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#00533d] border-[#00533d] text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-[#00533d]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFaqs.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">
                Tidak ada pertanyaan yang cocok dengan pencarian Anda.
              </p>
            )}

            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="py-4">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-center text-left gap-4 group"
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${categoryDot[faq.category]}`} />
                      <span className="font-medium text-slate-800 text-sm group-hover:text-[#00533d] transition-colors">
                        {faq.q}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-all duration-300 ${
                        isOpen
                          ? 'bg-[#00533d] border-[#00533d] text-white rotate-180'
                          : 'border-slate-200 text-slate-400 group-hover:border-emerald-300'
                      }`}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs leading-relaxed text-slate-600 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-[#00533d] text-white rounded-2xl px-6 py-5">
          <div>
            <p className="text-sm font-bold">Belum menemukan jawaban?</p>
            <p className="text-xs text-emerald-100 mt-0.5">Tim IT Operations siap membantu Anda langsung.</p>
          </div>
          <a
            href="mailto:it-ops@bsnetops.internal"
            className="text-xs font-semibold bg-white text-[#00533d] px-4 py-2 rounded-xl hover:bg-emerald-50 transition whitespace-nowrap"
          >
            Hubungi Support
          </a>
        </div>
      </div>
    </div>
  );
}