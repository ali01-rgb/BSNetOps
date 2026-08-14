import { useState, useEffect } from "react";
import { FaXmark, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from '@/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [forgotStep, setForgotEmailStep] = useState(0); 
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [form, setForm] = useState({ username: "", password: "", remember: false });
  const [error, setError] = useState({ username: "", password: "" });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    
    if (token && email) {
      setResetToken(token);
      setForgotEmail(email);
      setForgotEmailStep(3); 
      
      window.history.replaceState(null, '', '/login');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setError({ ...error, [name]: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    let newError = { username: "", password: "" };
    if (!form.username) newError.username = "Masukkan username atau email";
    if (!form.password) newError.password = "Masukkan password";

    setError(newError);
    if (newError.username || newError.password) return;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        const rawRole = data.role || (data.user && data.user.role) || "USER";
        const userRole = rawRole.toUpperCase();

        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userProfile", JSON.stringify(data.user || { username: form.username, role: userRole }));

        toast.success("Login berhasil! Mengalihkan ke dashboard...");

        if (userRole === "ADMIN") navigate("/admin");
        else if (userRole === "MANAGER") navigate("/manager");
        else navigate("/user");
      } else {
        setError({ ...error, password: data.message || "Username atau password salah" });
        toast.error(data.message || "Gagal masuk. Periksa kredensial Anda.");
      }
    } catch (err) {
      toast.error("Gagal terhubung ke server. Pastikan Backend aktif!");
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error("Alamat email wajib diisi!");
      return;
    }

    const allowedDomains = ["@btn.co.id", "@bankbsn.co.id", "@bsn.co.id", "@gmail.com"];
    const isDomainValid = allowedDomains.some(domain => forgotEmail.toLowerCase().endsWith(domain));

    if (!isDomainValid) {
      toast.error("Gunakan email resmi institusi (@btn.co.id, @bankbsn.co.id, @bsn.co.id)");
      return;
    }

    const loadingToast = toast.loading("Mencari email di database...");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        setForgotEmailStep(0);
        
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-in slide-in-from-top-5' : 'animate-out slide-out-to-top-5 fade-out'} max-w-sm w-full bg-white shadow-lg rounded-xl border border-slate-200 p-4 flex items-center gap-4`}>
            <div className="w-10 h-10 rounded-lg border-2 border-slate-800 flex items-center justify-center shrink-0 bg-white">
              <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#00634b]">Link Terkirim!</p>
              <p className="text-[11px] text-slate-600 leading-tight mt-0.5">silahkan cek kotak masuk email anda.</p>
            </div>
          </div>
        ), { position: "top-center", duration: 5000 });

      } else {
        toast.error(data.message || "Email tidak ditemukan di database.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server saat memproses reset password.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      toast.error("Semua kolom password wajib diisi!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    const loadingToast = toast.loading("Menyimpan password baru...");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          newPassword: newPassword,
          token: resetToken 
        }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        setForgotEmailStep(0);
        setForgotEmail("");
        setNewPassword("");
        setConfirmNewPassword("");
        setResetToken("");

        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-in slide-in-from-top-5' : 'animate-out slide-out-to-top-5 fade-out'} max-w-sm w-full bg-white shadow-lg rounded-xl border border-slate-200 p-4 flex items-center gap-4`}>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0 bg-white">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-600">Password Berhasil!</p>
              <p className="text-[11px] text-slate-600 leading-tight mt-0.5">Password Anda berhasil diperbarui.</p>
            </div>
          </div>
        ), { position: "top-center", duration: 5000 });

      } else {
        toast.error(data.message || "Gagal memperbarui password.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server saat menyimpan password.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      <div className="absolute inset-0 scale-105 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('/images/landingpage-bg.jpeg')" }} />
      <div className="absolute inset-0 bg-black/35" />

      {forgotStep === 0 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[420px] rounded-[24px] bg-white px-8 py-10 shadow-2xl animate-in fade-in duration-200 border border-slate-100">
            <a href="/" className="absolute right-5 top-5 cursor-pointer text-xl text-slate-400 transition hover:scale-110 hover:text-slate-700">
              <FaXmark />
            </a>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-[#00634b]">Selamat Datang!</h1>
              <p className="text-sm text-[#4a9b7c] mt-1 font-medium">Masuk untuk mengakses akun anda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Email</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="contoh@bsn.go.id"
                  className="w-full rounded-xl bg-[#e7f0ec] px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 font-medium placeholder:text-slate-400"
                />
              </div>

              <div className="relative">
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="•••••"
                  className="w-full rounded-xl bg-[#e7f0ec] px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 font-medium placeholder:text-slate-400 tracking-widest"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] cursor-pointer text-[#00634b]">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
                {error.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{error.password}</p>}
              </div>

              <div className="flex justify-between items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#00634b] focus:ring-[#00634b]" />
                  <span className="text-xs font-bold text-slate-700">Ingat Saya</span>
                </label>
                <button type="button" onClick={() => setForgotEmailStep(1)} className="text-xs font-bold text-[#4a9b7c] hover:text-[#00634b] transition-colors cursor-pointer">
                  Lupa password?
                </button>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-sm font-bold text-white shadow-md shadow-[#00634b]/20 transition-all hover:-translate-y-0.5 hover:bg-[#004d3a]">
                  Log in
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-[13px] font-bold text-slate-700">
              Belum punya akun? <a href="/register" className="text-[#00634b] hover:underline cursor-pointer">Daftar Sekarang</a>
            </p>
          </div>
        </section>
      )}

      {forgotStep === 1 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[420px] rounded-[24px] bg-white px-8 py-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <button type="button" onClick={() => setForgotEmailStep(0)} className="absolute right-5 top-5 cursor-pointer text-xl text-slate-400 transition hover:scale-110 hover:text-slate-700">
              <FaXmark />
            </button>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
              <p className="text-[13px] text-slate-500 mt-1 font-medium">kami akan mengirimkan link untuk memulihkan akunmu</p>
            </div>

            <form onSubmit={handleForgotRequest} className="space-y-6">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Email Terdaftar</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Admin@bsn.go.id"
                  className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#00634b] focus:ring-1 focus:ring-[#00634b] font-medium placeholder:text-slate-400"
                />
              </div>

              <button type="submit" className="w-full cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-sm font-bold text-white shadow-md shadow-[#00634b]/20 transition-all hover:-translate-y-0.5 hover:bg-[#004d3a]">
                Kirim Link Reset
              </button>
            </form>
          </div>
        </section>
      )}

      {forgotStep === 3 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[420px] rounded-[24px] bg-white px-8 py-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <button type="button" onClick={() => setForgotEmailStep(0)} className="absolute right-5 top-5 cursor-pointer text-xl text-slate-400 transition hover:scale-110 hover:text-slate-700">
              <FaXmark />
            </button>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-[#00634b]">Buat Password Baru</h1>
              <p className="text-[13px] text-[#4a9b7c] mt-1 font-medium">masukan password baru untuk akun anda</p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
              <div className="relative">
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">Password Baru</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="contoh@bsn.go.id"
                  className="w-full rounded-xl bg-[#e7f0ec] px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 font-medium placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-[38px] cursor-pointer text-[#00634b]">
                  {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>

              <div className="relative">
                <label className="mb-1.5 block text-[13px] font-bold text-slate-800">konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="•••••"
                  className="w-full rounded-xl bg-[#e7f0ec] px-4 py-3.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 font-medium placeholder:text-slate-400 tracking-widest"
                />
                <div className="absolute right-4 top-[38px] text-[#00634b]">
                  <FaEye size={16} />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-sm font-bold text-white shadow-md shadow-[#00634b]/20 transition-all hover:-translate-y-0.5 hover:bg-[#004d3a]">
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}