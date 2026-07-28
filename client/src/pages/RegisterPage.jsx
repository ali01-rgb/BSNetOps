import { useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); 

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    staffId: "",
    unit: "",
  });

  const [error, setError] = useState({});
  const [serverError, setServerError] = useState(""); 

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
    setServerError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newError = {};

    if (!form.username) newError.username = "Username wajib diisi";
    if (!form.email) newError.email = "Email wajib diisi";
    if (!form.password) newError.password = "Password wajib diisi";
    if (!form.confirmPassword) newError.confirmPassword = "Konfirmasi password wajib diisi";
    if (!form.staffId) newError.staffId = "ID Staff wajib diisi";
    if (!form.unit) newError.unit = "Unit wajib diisi";

    if (form.password && form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        newError.confirmPassword = "Password tidak sama";
      }
    }

    if (form.staffId && !form.staffId.toUpperCase().startsWith("BSN")) {
      newError.staffId = "ID Staff tidak valid (harus diawali BSN)";
    }

    setError(newError);
    if (Object.keys(newError).length > 0) return;

    setIsLoading(true);
    setServerError("");

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: form.staffId.toUpperCase(), 
          username: form.username,
          email: form.email,
          password: form.password,
          // Unit/Divisi dan Role tidak dikirim karena backend akan pakai data asli dari inputan Admin
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi");
      }

      alert("Aktivasi akun berhasil! Silakan login dengan akun Anda.");
      navigate("/login"); 

    } catch (err) {
      setServerError(err.message); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm"
        style={{ backgroundImage: "url('/images/landingpage-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/35" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="relative w-full max-w-[520px] rounded-2xl bg-white px-8 py-8 shadow-2xl">
          <a
            href="/"
            className="absolute right-5 top-5 text-xl text-slate-900 transition hover:scale-110 hover:text-[#00634b]"
          >
            <FaXmark />
          </a>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#00634b]">
              Buat Akun Baru
            </h1>
            <p className="text-sm text-[#4a9b7c]">
              Aktivasi data untuk akses sistem BSN
            </p>
          </div>

          {serverError && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 text-center border border-red-200">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Masukkan username"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
                {error.username && (
                  <p className="text-xs text-red-500">{error.username}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
                {error.password && (
                  <p className="text-xs text-red-500">{error.password}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Masukkan email resmi"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
                {error.email && (
                  <p className="text-xs text-red-500">{error.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40"
                />
                {error.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {error.confirmPassword}
                  </p>
                )}
              </div>

              <div className="text-sm font-semibold">
                <label className="text-sm font-semibold">ID Staff</label>
                <input
                  name="staffId"
                  value={form.staffId}
                  onChange={handleChange}
                  placeholder="Contoh: BSN-001"
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 uppercase"
                />
                {error.staffId && (
                  <p className="text-xs text-red-500">{error.staffId}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold">Unit Verifikasi</label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-[#e7f0ec] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00634b]/40 cursor-pointer"
                >
                  <option value="" disabled hidden>Pilih Unit Asal</option>
                  <option value="KC Semarang">KC Semarang</option>
                  <option value="KCP Majapahit">KCP Majapahit</option>
                  <option value="KCP Ngaliyan">KCP Ngaliyan</option>
                  <option value="KCP Ungaran">KCP Ungaran</option>
                  <option value="KCP Kendal">KCP Kendal</option>
                  <option value="KCP Kudus">KCP Kudus</option>
                  <option value="KCP Magelang">KCP Magelang</option>
                </select>
                {error.unit && (
                  <p className="text-xs text-red-500">{error.unit}</p>
                )}
              </div>

            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center cursor-pointer rounded-lg bg-[#00634b] py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#004d3a] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? "Memproses Data..." : "Aktivasi Akun"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm">
            Sudah punya akun aktif?{" "}
            <a
              href="/login"
              className="font-semibold text-[#00634b] hover:underline"
            >
              Masuk Sekarang
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}