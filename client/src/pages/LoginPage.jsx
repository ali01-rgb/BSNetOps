import { useState, useEffect } from "react";
import { FaXmark, FaEye, FaEyeSlash, FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from '@/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({ username: "", password: "", remember: false });
  const [error, setError] = useState({ username: "", password: "" });

  const [showForgotModal, setShowForgotModal] = useState(false);
  
  // 🔥 STATE UNTUK FIRST LOGIN PASSWORD CHANGE
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [tempUser, setTempUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("bsn_remembered_username");
    const savedPassword = localStorage.getItem("bsn_remembered_password");
    const savedRemember = localStorage.getItem("bsn_remember_me") === "true";

    if (savedRemember && savedUsername) {
      setForm((prev) => ({
        ...prev,
        username: savedUsername,
        password: savedPassword || "",
        remember: true
      }));
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
    if (!form.username) newError.username = "Kolom ini tidak boleh kosong";
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
        // 🔥 LOGIKA FIRST LOGIN
        if (data.isFirstLogin) {
          setTempToken(data.access_token);
          setTempUser(data);
          setShowFirstLoginModal(true);
          return;
        }

        proceedToDashboard(data, form.remember, form.username, form.password);
      } else {
        setError({ ...error, password: data.message || "Nama atau password salah" });
        toast.error(data.message || "Gagal masuk. Periksa kembali data Anda.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server.");
    }
  };

  const proceedToDashboard = (data, remember, inputUsername, inputPassword) => {
    if (remember) {
      localStorage.setItem("bsn_remembered_username", inputUsername);
      localStorage.setItem("bsn_remembered_password", inputPassword);
      localStorage.setItem("bsn_remember_me", "true");
    } else {
      localStorage.removeItem("bsn_remembered_username");
      localStorage.removeItem("bsn_remembered_password");
      localStorage.removeItem("bsn_remember_me");
    }

    localStorage.setItem("token", data.access_token);
    const rawRole = data.role || (data.user && data.user.role) || "USER";
    const userRole = rawRole.toUpperCase();

    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userProfile", JSON.stringify(data.user));

    toast.success("Login berhasil!");
    setTimeout(() => {
      if (userRole === "ADMIN") navigate("/admin");
      else if (userRole === "MANAGER") navigate("/manager");
      else navigate("/user");
    }, 600);
  };

  const submitFirstTimePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter!"); return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Konfirmasi password tidak cocok!"); return;
    }

    setIsChangingPass(true);
    const toastId = toast.loading("Memperbarui password Anda...");

    try {
      const res = await fetch(`${API_URL}/auth/first-time-change-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}` 
        },
        body: JSON.stringify({ newPassword: newPassword }),
      });

      if (res.ok) {
        toast.dismiss(toastId);
        setShowFirstLoginModal(false);
        proceedToDashboard(tempUser, form.remember, form.username, newPassword);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.message || "Gagal memperbarui password");
    } finally {
      setIsChangingPass(false);
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

      {/* 🔥 MODAL 1: LUPA PASSWORD */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[380px] rounded-[24px] bg-white px-8 py-9 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowForgotModal(false)} className="absolute right-5 top-5 text-slate-400 hover:text-slate-800 transition cursor-pointer">
              <FaXmark size={20} />
            </button>
            
            <h2 className="text-[20px] font-bold text-slate-900 mt-2">Lupa Password?</h2>
            <p className="text-[12px] text-slate-500 font-medium mb-5 pb-5 border-b border-slate-100">
              Informasi pemulihan akun BSN
            </p>

            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-5 mb-7 text-center">
              <p className="text-[13px] text-amber-900 font-medium leading-relaxed">
                Untuk mereset password akun Anda, silakan hubungi <b>Administrator / HRD BSN</b> secara langsung.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowForgotModal(false)}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 MODAL 2: GANTI PASSWORD PERTAMA KALI LOGIN */}
      {showFirstLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute top-[10%] lg:top-8 bg-white border border-slate-200 shadow-xl rounded-xl p-4 flex items-center gap-3 w-full max-w-sm animate-in slide-in-from-top-10 duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#00634b] flex items-center justify-center shrink-0">
              <FaCircleCheck size={18} />
            </div>
            <p className="text-[12px] font-semibold text-slate-700 leading-tight">
              Akun baru terdeteksi. Silakan ubah password Anda.
            </p>
          </div>

          <div className="relative w-full max-w-[380px] rounded-[24px] bg-white px-8 py-9 shadow-2xl animate-in zoom-in-95 duration-200 mt-16">
            <div className="mb-6 text-center">
              <h2 className="text-[22px] font-bold text-[#00634b]">Buat Password Baru</h2>
              <p className="text-[12px] text-slate-500 mt-1.5 font-medium leading-relaxed">
                Demi keamanan, silakan ganti password bawaan sistem dengan password Anda sendiri.
              </p>
            </div>

            <form onSubmit={submitFirstTimePassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-slate-800">Password Baru</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 pr-11 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500"
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
                <label className="mb-1.5 block text-[12px] font-bold text-slate-800">Konfirmasi Password Baru</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 pr-11 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500 tracking-wider"
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

              <div className="pt-3">
                <button type="submit" disabled={isChangingPass} className="w-full cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-[14px] font-bold text-white shadow-md transition-all hover:bg-[#004d3a] disabled:opacity-50">
                  {isChangingPass ? "Menyimpan..." : "Simpan & Lanjutkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM LOGIN UTAMA */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="relative w-full max-w-[420px] rounded-[24px] bg-white px-8 py-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          
          {/* 🔥 TOMBOL X UNTUK KEMBALI KE LANDING PAGE */}
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            title="Kembali ke Halaman Utama"
          >
            <FaXmark size={18} />
          </button>

          <div className="mb-8 text-center">
            <h1 className="text-[26px] font-bold text-[#00634b] tracking-tight leading-tight mb-1">Selamat Datang!</h1>
            <p className="text-[13px] text-slate-500 font-medium">Masuk untuk mengakses aplikasi BSNetOps</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-[13px] font-bold text-slate-800">Nama Karyawan / ID Pegawai</label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Contoh: Raden Mas Fatah"
                className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-bold text-slate-800">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 pr-11 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500 tracking-wider"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 flex items-center justify-center text-[#00634b] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {error.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{error.password}</p>}
            </div>

            <div className="flex justify-between items-center pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-[#00664b] focus:ring-[#00664b] accent-[#00664b] cursor-pointer" 
                />
                <span className="text-[12px] font-bold text-slate-700">Ingat Saya</span>
              </label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)} 
                className="text-[12px] font-bold text-[#00634b] hover:underline transition-all cursor-pointer"
              >
                Lupa password?
              </button>
            </div>

            <div className="pt-3">
              <button type="submit" className="w-full cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-[14px] font-bold text-white shadow-lg shadow-[#00634b]/20 transition-all hover:bg-[#004d3a] hover:-translate-y-0.5 active:translate-y-0">
                Masuk Sistem
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}