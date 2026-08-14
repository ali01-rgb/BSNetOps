import { useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; 
import { API_URL } from '@/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); 

  const [form, setForm] = useState({
    fullName: "", 
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    unit: "",
  });

  const [error, setError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    setError({
      ...error,
      [name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newError = {};

    if (!form.fullName) newError.fullName = "Nama Lengkap wajib diisi";
    if (!form.email) newError.email = "Email wajib diisi";
    if (!form.password) newError.password = "Password wajib diisi";
    if (!form.confirmPassword) newError.confirmPassword = "Konfirmasi password wajib diisi";
    if (!form.unit) newError.unit = "Unit wajib diisi";

    if (form.password && form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        newError.confirmPassword = "Password tidak sama";
      }
    }

    if (form.email) {
      const allowedDomains = ["@btn.co.id", "@bankbsn.co.id", "@bsn.co.id", "@gmail.com"];
      const isDomainValid = allowedDomains.some(domain => form.email.toLowerCase().endsWith(domain));
      
      if (!isDomainValid) {
        newError.email = "Gunakan email resmi BSN";
      }
    }

    setError(newError);
    if (Object.keys(newError).length > 0) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName, 
          username: form.email.split('@')[0], 
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi");
      }

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-top-5' : 'animate-out slide-out-to-top-5 fade-out'} max-w-sm w-full bg-white shadow-lg rounded-xl border border-slate-200 p-3 flex items-center gap-4`}>
          <div className="w-8 h-8 rounded-full bg-[#00634b] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-slate-800 leading-snug">
              registrasi berhasil! Link verifikasi telah dikirim ke <br />
              <span className="font-extrabold">{form.email}</span>
            </p>
          </div>
        </div>
      ), { position: "top-center", duration: 5000 });

      navigate("/login"); 

    } catch (err) {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-top-5' : 'animate-out slide-out-to-top-5 fade-out'} max-w-sm w-full bg-white shadow-lg rounded-xl border border-slate-200 p-3 flex items-center gap-4 justify-center`}>
          <div className="w-6 h-6 rounded-md bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-[13px] font-bold text-slate-700">
            {err.message === "Gagal melakukan registrasi" ? "Email sudah terdaftar" : err.message}
          </p>
        </div>
      ), { position: "top-center", duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm"
        style={{ backgroundImage: "url('/images/landingpage-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/35" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="relative w-full max-w-[640px] rounded-[24px] bg-white px-8 md:px-10 py-10 shadow-2xl animate-in fade-in duration-200 border border-slate-100">
          <a
            href="/"
            className="absolute right-5 top-5 text-xl text-slate-400 transition hover:scale-110 hover:text-slate-700"
          >
            <FaXmark />
          </a>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#00634b]">
              Buat Akun Baru
            </h1>
            <p className="text-[13px] text-[#4a9b7c] mt-1 font-medium">
              Lengkapi data berikut untuk membuat akun
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Nama Lengkap</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Masukan Nama"
                  className="w-full rounded-xl bg-[#e7f0ec] px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 font-medium placeholder:text-slate-400"
                />
                {error.fullName && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">{error.fullName}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="•••••"
                  className="w-full rounded-xl bg-[#e7f0ec] px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 font-medium placeholder:text-slate-400 tracking-widest"
                />
                {error.password && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">{error.password}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contoh @gmail.com"
                  className="w-full rounded-xl bg-[#e7f0ec] px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 font-medium placeholder:text-slate-400"
                />
                {error.email && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">{error.email}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Konfirmasi Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi Password"
                  className="w-full rounded-xl bg-[#e7f0ec] px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 font-medium placeholder:text-slate-400 tracking-widest"
                />
                {error.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">
                    {error.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-1">
              <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Pilih Unit</label>
              <div className="relative">
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-xl bg-[#e7f0ec] px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 cursor-pointer font-medium text-slate-700"
                >
                  <option value="" disabled hidden>pilih unit</option>
                  <option value="KC Semarang" className="bg-blue-600 text-white font-bold">KC Semarang</option>
                  <option value="KCP Majapahit" className="bg-[#e7f0ec] text-slate-800 font-bold">KCP Majapahit</option>
                  <option value="KCP Ngaliyan" className="bg-[#e7f0ec] text-slate-800 font-bold">KCP Ngaliyan</option>
                  <option value="KCP Ungaran" className="bg-[#e7f0ec] text-slate-800 font-bold">KCP Ungaran</option>
                  <option value="KCP Kendal" className="bg-[#e7f0ec] text-slate-800 font-bold">KCP Kendal</option>
                  <option value="KCP Kudus" className="bg-[#e7f0ec] text-slate-800 font-bold">KCP Kudus</option>
                  <option value="KCP Magelang" className="bg-[#e7f0ec] text-slate-800 font-bold">KCP Magelang</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {error.unit && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">{error.unit}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-[14px] font-bold text-white shadow-md shadow-[#00634b]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#004d3a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses Data..." : "Daftar"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-[13px] font-bold text-slate-800">
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="text-[#00634b] hover:underline"
            >
              Masuk Sekarang
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}