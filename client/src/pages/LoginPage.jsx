import { useState } from "react";
import { FaXmark, FaEye, FaEyeSlash } from "react-icons/fa6";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom"; // 🔥 IMPOR INI untuk navigasi halaman

export default function LoginPage() {
  const navigate = useNavigate(); // 🔥 INISIALISASI NAVIGATE
=======

export default function LoginPage() {
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
  const [showPassword, setShowPassword] = useState(false);

  // CONTROL MODAL FLOW
  const [showForgot, setShowForgot] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const [forgotEmail, setForgotEmail] = useState("");

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

    setError({
      ...error,
      [name]: "",
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    let newError = {
      username: "",
      password: "",
    };

    if (!form.username) newError.username = "Masukkan username atau email";
    if (!form.password) newError.password = "Masukkan password";

<<<<<<< HEAD
    // 🔴 VALIDASI PASSWORD DUMMY
=======
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
    if (form.password && form.password !== "123456") {
      newError.password = "Username atau password salah";
    }

    setError(newError);

    if (newError.username || newError.password) return;

<<<<<<< HEAD
    // 🔥 LOGIKA REDIRECT BERDASARKAN USERNAME (Simulasi Role Base Login)
    const inputUser = form.username.toLowerCase();

    if (inputUser === "admin") {
      navigate("/admin");
    } else if (inputUser === "manager") {
      navigate("/manager");
    } else {
      // Jika diisi nama lain (misal: chico, staff, dll) otomatis masuk sebagai User/Staff biasa
      navigate("/user");
    }
=======
    alert("Login berhasil");
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
  };

  // RESET PASSWORD SUBMIT
  const handleForgot = (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      alert("Email wajib diisi");
      return;
    }

    alert("Link reset password dikirim ke email (dummy)");

<<<<<<< HEAD
    // CLOSE RESET POPUP
    setShowForgot(false);

    // RESET INPUT
=======
    // 🔥 CLOSE RESET POPUP
    setShowForgot(false);

    // 🔥 RESET INPUT
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
    setForgotEmail("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center blur-sm"
        style={{ backgroundImage: "url('/images/landingpage-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/35" />

      {/* LOGIN MODAL (HIDE WHEN FORGOT ACTIVE) */}
      {!showForgot && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">

          <div className="relative w-full max-w-[400px] rounded-2xl bg-white px-8 py-8 shadow-2xl">

            {/* CLOSE */}
            <a
              href="/"
              className="absolute right-5 top-5 cursor-pointer text-xl text-slate-900 transition hover:scale-110 hover:text-[#00634b]"
            >
              <FaXmark />
            </a>

            {/* TITLE */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#00634b]">
                Selamat Datang!
              </h1>
              <p className="text-sm text-[#4a9b7c]">
                Masuk untuk mengakses akun anda
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* USERNAME */}
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Username / Email
                </label>

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
<<<<<<< HEAD
                  placeholder="Ketik 'admin', 'manager', atau nama kamu"
=======
                  placeholder="Masukkan username atau email"
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />

                {error.username && (
                  <p className="mt-1 text-xs text-red-500">
                    {error.username}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <label className="mb-1 block text-sm font-semibold">
                  Password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
<<<<<<< HEAD
                  placeholder="Password bawaan: 123456"
=======
                  placeholder="Masukkan password"
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 cursor-pointer text-slate-600 hover:text-[#00634b] active:scale-90"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

                {error.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {error.password}
                  </p>
                )}
              </div>

              {/* REMEMBER + FORGOT */}
              <div className="flex items-center justify-between text-xs">

                <label className="flex cursor-pointer items-center gap-2 font-medium select-none">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="cursor-pointer accent-[#00634b]"
                  />
                  Ingat Saya
                </label>

                {/* FORGOT PASSWORD */}
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="cursor-pointer text-[#00634b] hover:underline"
                >
                  Lupa password?
                </button>

              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-[#00634b] py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-[#004d3a]"
              >
                Log in
              </button>

            </form>

            <p className="mt-5 text-center text-sm">
            Belum punya akun?{" "}
            <a
                href="/register"
                className="font-semibold text-[#00634b] hover:underline cursor-pointer"
            >
                Daftar Sekarang
            </a>
            </p>

          </div>
        </section>
      )}

<<<<<<< HEAD
      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
=======
      {/* FORGOT PASSWORD MODAL (HIDE LOGIN WHEN ACTIVE) */}
      {showForgot && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-6">

          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">

            {/* HEADER */}
>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#00634b]">
                Reset Password
              </h2>
<<<<<<< HEAD
=======

>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
              <button
                onClick={() => setShowForgot(false)}
                className="cursor-pointer text-xl"
              >
                <FaXmark />
              </button>
            </div>
<<<<<<< HEAD
            <form onSubmit={handleForgot} className="space-y-3">
=======

            {/* FORM */}
            <form onSubmit={handleForgot} className="space-y-3">

>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
              <input
                type="email"
                placeholder="Masukkan email kamu"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
              />
<<<<<<< HEAD
=======

>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-[#00634b] py-2 text-sm font-bold text-white hover:bg-[#004d3a]"
              >
                Kirim Link Reset
              </button>
<<<<<<< HEAD
            </form>
=======

            </form>

>>>>>>> 04a7edbcff2dfc95e437a8dd4169afd100df5539
          </div>
        </div>
      )}

    </main>
  );
}