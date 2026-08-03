import { useState, useEffect } from "react";
import { FaXmark, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // State Kontrol Modal Reset Password (0: Hidden, 1: Input Email, 2: Sukses Kirim, 3: Form Password Baru)
  const [forgotStep, setForgotEmailStep] = useState(0); 
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [form, setForm] = useState({ username: "", password: "", remember: false });
  const [error, setError] = useState({ username: "", password: "" });

  // 🔥 TANGKAP URL DARI EMAIL SAAT USER KLIK LINK
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    
    // Jika url memiliki parameter token dan email, otomatis buka modal password baru
    if (token && email) {
      setResetToken(token);
      setForgotEmail(email);
      setForgotEmailStep(3); // Langsung Buka Form Tahap 3
      
      // Rapikan URL di browser agar token tidak tampil terus
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
      const res = await fetch("http://localhost:3000/auth/login", {
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

  // ✉️ TAHAP 1: REQUEST FORGOT PASSWORD
  const handleForgotRequest = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error("Alamat email wajib diisi!");
      return;
    }

    // Validasi domain resmi BSN (Ditambah gmail untuk testing)
    const allowedDomains = ["@btn.co.id", "@bankbsn.co.id", "@bsn.co.id", "@gmail.com"];
    const isDomainValid = allowedDomains.some(domain => forgotEmail.toLowerCase().endsWith(domain));

    if (!isDomainValid) {
      toast.error("Gunakan email resmi institusi (@btn.co.id, @bankbsn.co.id, @bsn.co.id)");
      return;
    }

    const loadingToast = toast.loading("Mencari email di database...");

    try {
      const res = await fetch("http://localhost:3000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        setForgotEmailStep(2); // Pindah ke Notif Sukses Kirim
      } else {
        toast.error(data.message || "Email tidak ditemukan di database.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server saat memproses reset password.");
    }
  };

  // 🔑 TAHAP 3: EKSEKUSI UPDATE PASSWORD BARU
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
      const res = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          newPassword: newPassword,
          token: resetToken // 🔥 PASTIKAN TOKEN TERKIRIM KE BACKEND
        }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Password berhasil diperbarui! Silakan login.");
        setForgotEmailStep(0);
        setForgotEmail("");
        setNewPassword("");
        setConfirmNewPassword("");
        setResetToken("");
      } else {
        toast.error(data.message || "Gagal memperbarui password.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server saat menyimpan password.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="absolute inset-0 scale-105 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('/images/landingpage-bg.jpeg')" }} />
      <div className="absolute inset-0 bg-black/35" />

      {/* FORM LOGIN UTAMA */}
      {forgotStep === 0 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[400px] rounded-2xl bg-white px-8 py-8 shadow-2xl animate-in fade-in duration-200">
            <a href="/" className="absolute right-5 top-5 cursor-pointer text-xl text-slate-900 transition hover:scale-110 hover:text-[#00634b]">
              <FaXmark />
            </a>

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#00634b]">Selamat Datang!</h1>
              <p className="text-sm text-[#4a9b7c]">Masuk untuk mengakses akun anda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Username / Email</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username atau Email"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
              </div>

              <div className="relative">
                <label className="mb-1 block text-sm font-semibold">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 cursor-pointer text-slate-600">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {error.password && <p className="mt-1 text-xs text-red-500">{error.password}</p>}
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setForgotEmailStep(1)} className="text-xs font-semibold text-[#00634b] hover:underline cursor-pointer">
                  Lupa Password?
                </button>
              </div>

              <button type="submit" className="w-full cursor-pointer rounded-lg bg-[#00634b] py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-[#004d3a]">
                Log in
              </button>
            </form>

            <p className="mt-5 text-center text-sm">
              Belum punya akun? <a href="/register" className="font-semibold text-[#00634b] hover:underline cursor-pointer">Daftar Sekarang</a>
            </p>
          </div>
        </section>
      )}

      {/* MODAL LUPA PASSWORD - TAHAP 1: INPUT EMAIL */}
      {forgotStep === 1 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[400px] rounded-2xl bg-white px-8 py-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setForgotEmailStep(0)} className="absolute right-5 top-5 cursor-pointer text-xl text-slate-900 transition hover:scale-110 hover:text-[#00634b]">
              <FaXmark />
            </button>

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#00634b]">Reset Password</h1>
              <p className="text-sm text-[#4a9b7c]">Masukkan email BSN terdaftar untuk verifikasi</p>
            </div>

            <form onSubmit={handleForgotRequest} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Email Pengguna BSN</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="budi@bsn.go.id"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
              </div>

              <button type="submit" className="w-full cursor-pointer rounded-lg bg-[#00634b] py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-[#004d3a]">
                Kirim Link Reset
              </button>
            </form>
          </div>
        </section>
      )}

      {/* MODAL LUPA PASSWORD - TAHAP 2: SUCCESS MSG */}
      {forgotStep === 2 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[400px] rounded-2xl bg-white px-8 py-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setForgotEmailStep(0)} className="absolute right-5 top-5 cursor-pointer text-xl text-slate-900 transition hover:scale-110 hover:text-[#00634b]">
              <FaXmark />
            </button>

            <div className="w-16 h-16 bg-emerald-100 text-[#00634b] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>

            <h1 className="text-xl font-bold text-[#00634b] mb-2">Email Terkirim!</h1>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Link reset password telah dikirimkan ke <span className="font-bold text-slate-900">{forgotEmail}</span>. Silakan periksa pesan masuk (atau folder spam) untuk melanjutkan.
            </p>

            <button 
              type="button" 
              onClick={() => setForgotEmailStep(0)}
              className="w-full cursor-pointer rounded-lg bg-[#00634b] py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-[#004d3a]"
            >
              Kembali ke Login
            </button>
          </div>
        </section>
      )}

      {/* MODAL LUPA PASSWORD - TAHAP 3: FORM INPUT PASSWORD BARU */}
      {forgotStep === 3 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[400px] rounded-2xl bg-white px-8 py-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setForgotEmailStep(0)} className="absolute right-5 top-5 cursor-pointer text-xl text-slate-900 transition hover:scale-110 hover:text-[#00634b]">
              <FaXmark />
            </button>

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#00634b]">Password Baru</h1>
              <p className="text-xs text-[#4a9b7c]">Buat password baru untuk akun <span className="font-bold">{forgotEmail}</span></p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="relative">
                <label className="mb-1 block text-sm font-semibold">Password Baru</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-9 cursor-pointer text-slate-600">
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
              </div>

              <button type="submit" className="w-full cursor-pointer rounded-lg bg-[#00634b] py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-[#004d3a]">
                Simpan Password Baru
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}