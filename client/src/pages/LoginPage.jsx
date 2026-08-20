import { useState, useEffect } from "react";
import { FaXmark, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from '@/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [forgotStep, setForgotEmailStep] = useState(0); 
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [form, setForm] = useState({ username: "", password: "", remember: false });
  const [error, setError] = useState({ username: "", password: "" });

  const [resetExpired, setResetExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // 🔥 DETEKSI "INGAT SAYA" & VALIDASI EXPIRED TOKEN URL SECARA LANGSUNG
  useEffect(() => {
    const savedEmail = localStorage.getItem("bsn_remembered_email");
    const savedPassword = localStorage.getItem("bsn_remembered_password");
    const savedRemember = localStorage.getItem("bsn_remember_me") === "true";

    if (savedRemember && savedEmail) {
      setForm((prev) => ({
        ...prev,
        username: savedEmail,
        password: savedPassword || "",
        remember: true
      }));
    }

    // Tangani parameter URL reset password
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    
    if (token && email) {
      setForgotEmail(email);
      setResetToken(token);

      // Cek apakah token JWT kedaluwarsa langsung dari payload token
      let isTokenExpired = false;
      try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            isTokenExpired = true;
          }
        }
      } catch (e) {
        isTokenExpired = true;
      }

      if (isTokenExpired) {
        setForgotEmailStep(0); // Jangan tampilkan form buat password
        setResetExpired(true);  // Langsung munculkan popup verifikasi gagal
      } else {
        setForgotEmailStep(3); // Tampilkan form jika token masih valid
      }

      window.history.replaceState(null, '', '/login');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    let newError = { username: "", password: "" };
    if (!form.username) newError.username = "Masukkan email Anda";
    if (!form.password) newError.password = "Masukkan password";

    setError(newError);
    if (newError.username || newError.password) return;

    const loadingToast = toast.loading("Sedang masuk...");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.username, password: form.password }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        if (form.remember) {
          localStorage.setItem("bsn_remembered_email", form.username);
          localStorage.setItem("bsn_remembered_password", form.password);
          localStorage.setItem("bsn_remember_me", "true");
        } else {
          localStorage.removeItem("bsn_remembered_email");
          localStorage.removeItem("bsn_remembered_password");
          localStorage.removeItem("bsn_remember_me");
        }

        localStorage.setItem("token", data.access_token);
        const rawRole = data.role || (data.user && data.user.role) || "USER";
        const userRole = rawRole.toUpperCase();

        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userProfile", JSON.stringify(data.user || { email: form.username, role: userRole }));

        toast.success("Login berhasil!");

        setTimeout(() => {
          if (userRole === "ADMIN") navigate("/admin");
          else if (userRole === "MANAGER") navigate("/manager");
          else navigate("/user");
        }, 600);
      } else {
        setError({ ...error, password: data.message || "Email atau password salah" });
        toast.error(data.message || "Gagal masuk. Periksa kredensial Anda.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server. Pastikan Backend aktif!");
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error("Alamat email wajib diisi!");
      return;
    }

    const loadingToast = toast.loading("Mengirim link reset password...");

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
        setForgotEmail(""); 
        
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-in slide-in-from-top-2 fade-in' : 'animate-out slide-out-to-top-2 fade-out'} max-w-[340px] w-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[12px] border border-slate-100 p-4 flex items-center gap-4`}>
            <div className="flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[14px] font-semibold text-[#00634b] leading-tight">Link Terkirim!</p>
              <p className="text-[12px] text-slate-700 leading-tight mt-1">silahkan cek kotak masuk email anda.</p>
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

  const handleResendExpiredReset = async () => {
    setIsResending(true);
    const loadingToast = toast.loading("Mengirim link baru...");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        setResetExpired(false);
        setForgotEmailStep(0);
        setForgotEmail(""); 
        setResetToken("");
        
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-in slide-in-from-top-2 fade-in' : 'animate-out slide-out-to-top-2 fade-out'} max-w-[340px] w-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[12px] border border-slate-100 p-4 flex items-center gap-4`}>
            <div className="flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[14px] font-semibold text-[#00634b] leading-tight">Link Baru Terkirim!</p>
              <p className="text-[12px] text-slate-700 leading-tight mt-1">silahkan cek kotak masuk email anda.</p>
            </div>
          </div>
        ), { position: "top-center", duration: 5000 });
      } else {
        toast.error(data.message || "Gagal mengirim link baru.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server.");
    } finally {
      setIsResending(false);
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
          <div className={`${t.visible ? 'animate-in slide-in-from-top-2 fade-in' : 'animate-out slide-out-to-top-2 fade-out'} max-w-[340px] w-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[12px] border border-slate-100 p-4 flex items-center gap-4`}>
            <div className="flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00634b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
                <polyline points="9 12 12 15 16 9"></polyline>
              </svg>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[14px] font-semibold text-[#00634b] leading-tight">Password Berhasil!</p>
              <p className="text-[12px] text-slate-700 leading-tight mt-1">Password Anda berhasil diperbarui.</p>
            </div>
          </div>
        ), { position: "top-center", duration: 5000 });

      } else {
        // 🔥 JIKA BACKEND MENOLAK KARENA EXPIRED, TUTUP FORM DAN MUNCULKAN POPUP
        setForgotEmailStep(0);
        setResetExpired(true);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server saat menyimpan password.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        input::-ms-reveal, input::-ms-clear { display: none !important; }
        input::-webkit-credentials-auto-fill-button { visibility: hidden; position: absolute; right: 0; }
      `}</style>

      <div className="absolute inset-0 scale-105 bg-cover bg-center blur-[2px]" style={{ backgroundImage: "url('/images/landingpage-bg.jpeg')" }} />
      <div className="absolute inset-0 bg-black/40" /> 

      {/* POPUP: MODAL RESET PASSWORD KEDALUWARSA */}
      {resetExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[380px] rounded-[24px] bg-white px-8 py-9 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <button onClick={() => setResetExpired(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-800 transition">
              <FaXmark size={20} />
            </button>
            
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <FaXmark className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-[20px] font-bold text-red-500">Verifikasi Gagal</h2>
            <p className="mt-2 text-[13px] text-slate-700 font-medium leading-relaxed px-2">
              Link verifikasi sudah kadaluarsa.
            </p>

            <button 
              onClick={handleResendExpiredReset}
              disabled={isResending}
              className="mt-7 w-full flex justify-center items-center rounded-xl bg-[#00634b] py-3.5 text-[14px] font-bold text-white shadow-md hover:bg-[#004d3a] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isResending ? "Memproses..." : "Kirim Ulang Email Verifikasi"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 0: LOGIN */}
      {forgotStep === 0 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[430px] rounded-[20px] bg-white px-8 py-9 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => window.location.href = '/'} className="absolute right-5 top-5 cursor-pointer text-xl text-slate-500 transition hover:text-slate-800">
              <FaXmark />
            </button>

            <div className="mb-7 text-center">
              <h1 className="text-[24px] font-bold text-[#00634b] tracking-tight">Selamat Datang!</h1>
              <p className="text-[13px] text-[#00634b]/80 mt-1 font-medium">Masuk untuk mengakses akun anda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">Email</label>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="contoh@gmail.com"
                  className="w-full rounded-xl bg-[#dce9e3] px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="•••••"
                    className="w-full rounded-xl bg-[#dce9e3] px-4 py-3 pr-11 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500 tracking-wider"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3.5 flex items-center justify-center text-[#00634b] hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {error.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{error.password}</p>}
              </div>

              <div className="flex justify-between items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-[#00664b] focus:ring-[#00664b] accent-[#00664b] cursor-pointer" 
                  />
                  <span className="text-[12px] font-semibold text-slate-700">Ingat Saya</span>
                </label>
                <button type="button" onClick={() => setForgotEmailStep(1)} className="text-[12px] font-semibold text-[#00634b] hover:underline transition-all cursor-pointer">
                  Lupa password ?
                </button>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full cursor-pointer rounded-xl bg-[#00634b] py-3 text-[14px] font-semibold text-white shadow-md shadow-[#00634b]/20 transition-all hover:bg-[#004d3a]">
                  Log in
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-[12px] font-medium text-slate-700">
              Belum punya akun? <a href="/register" className="font-semibold text-[#00634b] hover:underline cursor-pointer">Daftar Sekarang</a>
            </p>
          </div>
        </section>
      )}

      {/* STEP 1: REQUEST FORGOT PASSWORD */}
      {forgotStep === 1 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[430px] rounded-[20px] bg-white px-8 py-9 shadow-2xl animate-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setForgotEmailStep(0)} className="absolute right-5 top-5 cursor-pointer text-xl text-slate-500 transition hover:text-slate-800">
              <FaXmark />
            </button>

            <div className="mb-6 border-b border-slate-100 pb-4 text-left">
              <h1 className="text-[19px] font-bold text-slate-900">Reset Password</h1>
              <p className="text-[12px] text-slate-500 mt-0.5 font-medium">kami akan mengirimkan link untuk memulihkan akunmu</p>
            </div>

            <form onSubmit={handleForgotRequest} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">Email Terdaftar</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                  className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3 text-[13px] outline-none focus:border-[#00664b] focus:ring-1 focus:ring-[#00664b] font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <button type="submit" className="w-full cursor-pointer rounded-xl bg-[#00634b] py-3 text-[14px] font-semibold text-white shadow-md transition-all hover:bg-[#004d3a]">
                Kirim Link Reset
              </button>
            </form>
          </div>
        </section>
      )}

      {/* STEP 3: FORM PASSWORD BARU */}
      {forgotStep === 3 && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[430px] rounded-[24px] bg-white px-8 py-9 shadow-2xl animate-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setForgotEmailStep(0)} className="absolute right-5 top-5 cursor-pointer text-xl text-slate-500 transition hover:text-slate-800">
              <FaXmark />
            </button>

            <div className="mb-6 text-center">
              <h1 className="text-[22px] font-bold text-[#00634b]">Buat Password Baru</h1>
              <p className="text-[12px] text-[#00634b]/80 mt-1 font-medium">masukan password baru untuk akun anda</p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">Password Baru</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="•••••"
                    className="w-full rounded-xl bg-[#dce9e3] px-4 py-3 pr-11 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)} 
                    className="absolute right-3.5 flex items-center justify-center text-[#00634b] cursor-pointer"
                  >
                    {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">Konfirmasi Password Baru</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="•••••"
                    className="w-full rounded-xl bg-[#dce9e3] px-4 py-3 pr-11 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500 tracking-wider"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3.5 flex items-center justify-center text-[#00634b] cursor-pointer"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-[14px] font-semibold text-white shadow-md transition-all hover:bg-[#004d3a]">
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