import { useState } from "react";
import { FaXmark, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const [error, setError] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    setError({ ...error, [name]: "" });
  };

  // 🔥 LOGIKA LOGIN NYATA KE NESTJS
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError({
        username: !form.username ? "Masukkan username" : "",
        password: !form.password ? "Masukkan password" : "",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: form.username, 
          password: form.password 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // SUKSES: Simpan tiket (token) dan masuk
        localStorage.setItem("token", data.access_token);
        
        // Redirect sederhana (lu bisa tambah logika role di sini nanti)
        navigate("/user"); 
      } else {
        setError({ ...error, password: "Username atau password salah" });
      }
    } catch (err) {
      alert("Backend NestJS lagi mati nih, nyalain dulu!");
    }
  };

  // RESET PASSWORD (Dummy)
  const handleForgot = (e) => {
    e.preventDefault();
    if (!forgotEmail) return alert("Email wajib diisi");
    alert("Link reset password dikirim!");
    setShowForgot(false);
    setForgotEmail("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="absolute inset-0 scale-105 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('/images/landingpage-bg.jpeg')" }} />
      <div className="absolute inset-0 bg-black/35" />

      {!showForgot && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative w-full max-w-[400px] rounded-2xl bg-white px-8 py-8 shadow-2xl">
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
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 cursor-pointer text-slate-600">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {error.password && <p className="mt-1 text-xs text-red-500">{error.password}</p>}
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
      {/* ... (bagian reset password biarkan saja) ... */}
    </main>
  );
}