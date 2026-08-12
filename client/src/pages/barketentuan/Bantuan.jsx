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
      a: "Segera laporkan kendala melalui menu 'Lapor Kendala' di Dashboard atau hubungi Helpdesk IT Operations melalui nomor ekstensi internal atau kontak yang tersedia."
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
    <div className="min-h-screen bg-gradient-to-b from-[#40725a] via-[#c1d3ca] to-[#f8faf9] text-slate-800 pb-20 font-sans">
      
      {/* 1. Header: Warna solid hijau gelap kontras */}
      <div className="pt-12 pb-28 px-6 md:px-12 text-center bg-[#00664b] shadow-md border-b border-[#003d2d]">
        <p className="text-emerald-200 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
          Pusat Layanan & Dukungan
        </p>

        <div className="relative w-full flex items-center justify-center">
          <Link
            to="/"
            className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 text-xs font-medium text-emerald-100 hover:text-white transition bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
          >
            ← Kembali
          </Link>
          
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
            Bantuan & FAQ
          </h1>
        </div>
      </div>

      {/* 2. Main Content: Kertas melayang */}
      <div className="px-6 md:px-12 flex justify-center -mt-16 relative z-10">
        <div className="w-full max-w-4xl bg-white/75 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl shadow-slate-400/20 p-8 md:p-14">

          {/* Kotak Pencarian */}
          <div className="mb-10 max-w-xl mx-auto">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-[#00533d] focus-within:ring-4 focus-within:ring-[#00533d]/10 transition-all">
              <svg className="w-5 h-5 text-slate-400 shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik kendala Anda di sini (misal: pengembalian barang)..."
                className="bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 w-full font-medium"
              />
            </div>
          </div>

          <div className="space-y-12">
            
            {/* Quick Contact Cards */}
            <section>
              <h2 className="font-serif text-lg font-bold text-slate-900 pb-2 mb-4 border-b-2 border-[#00533d]/15">
                Kontak Darurat (IT Support)
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Card Email */}
                <a 
                  href="mailto:inventory.bsn@gmail.com"
                  className="group p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex items-start gap-4 cursor-pointer"
                >
                  <div className="p-3 bg-emerald-50 text-[#00533d] rounded-xl font-bold text-xl group-hover:bg-[#00533d] group-hover:text-white transition-colors shrink-0">
                    📧
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#00533d] transition-colors">Email Support</h3>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        Tiket Bantuan
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-2">inventory.bsn@gmail.com</p>
                  </div>
                </a>

                {/* Card Telepon */}
                <a 
                  href="tel:+6281234567890"
                  className="group p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex items-start gap-4 cursor-pointer"
                >
                  <div className="p-3 bg-emerald-50 text-[#00533d] rounded-xl font-bold text-xl group-hover:bg-[#00533d] group-hover:text-white transition-colors shrink-0">
                    ☎️
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#00533d] transition-colors">Hotline (Budi Santoso)</h3>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        Respon Cepat
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-2">+62 812-3456-7890</p>
                  </div>
                </a>
              </div>
            </section>

            {/* FAQ Section */}
            <section>
              <div className="flex items-center justify-between flex-wrap gap-3 pb-2 mb-4 border-b-2 border-[#00533d]/15">
                <h2 className="font-serif text-lg font-bold text-slate-900">
                  Pertanyaan Sering Diajukan
                </h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{filteredFaqs.length} Hasil</span>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                      activeCategory === cat
                        ? 'bg-[#00533d] border-[#00533d] text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-[#00533d]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Accordion FAQ */}
              <div className="divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/80 px-2 shadow-sm">
                {filteredFaqs.length === 0 && (
                  <p className="text-sm font-medium text-slate-400 py-8 text-center">
                    Pertanyaan tidak ditemukan. Coba gunakan kata kunci lain.
                  </p>
                )}

                {filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div key={faq.id} className="py-2">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex justify-between items-center text-left gap-4 p-4 group rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${categoryDot[faq.category]}`} />
                          <span className="font-bold text-slate-700 text-sm group-hover:text-[#00533d] transition-colors">
                            {faq.q}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full border text-xs font-black transition-all duration-300 ${
                            isOpen
                              ? 'bg-[#00533d] border-[#00533d] text-white rotate-180 shadow-md'
                              : 'border-slate-300 text-slate-400 group-hover:border-[#00533d] group-hover:text-[#00533d]'
                          }`}
                        >
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-in-out px-4 ${
                          isOpen ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm leading-relaxed text-slate-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Bottom CTA */}
          <div className="mt-16 pt-8 border-t border-dashed border-slate-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#00533d] text-white rounded-2xl p-6 shadow-md">
              <div className="text-center sm:text-left">
                <p className="text-base font-bold">Masih butuh bantuan teknis?</p>
                <p className="text-xs text-emerald-100/80 mt-1">Jangan ragu, tim IT Operations kami siap membantu Anda 24/7.</p>
              </div>
              <a
                href="mailto:inventory.bsn@gmail.com"
                className="text-xs font-bold bg-white text-[#00533d] px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm whitespace-nowrap"
              >
                Buat Tiket Bantuan
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}