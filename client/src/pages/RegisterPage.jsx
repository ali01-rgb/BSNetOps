import { useState, useEffect, useRef } from "react";
import { FaXmark, FaEye, FaEyeSlash, FaChevronDown } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "@/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const dropdownRef = useRef(null);

  const [verifyStatus, setVerifyStatus] = useState(null);
  const [error, setError] = useState({});

  const unitList = [
    "KC Semarang",
    "KCP Majapahit",
    "KCP Ngaliyan",
    "KCP Ungaran",
    "KCP Kendal",
    "KCP Kudus",
    "KCP Magelang",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("verifyToken");

    if (token) {
      handleVerifyEmail(token);
    }
  }, [location.search]);

  const handleVerifyEmail = async (token) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
        method: "GET",
      });
      if (res.ok) {
        setVerifyStatus("success");
      } else {
        setVerifyStatus("fail");
      }
    } catch {
      setVerifyStatus("fail");
    } finally {
      window.history.replaceState(null, "", "/register");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newError = {};

    if (!form.fullName) newError.fullName = "Nama Lengkap wajib diisi";
    if (!form.email) newError.email = "Email wajib diisi";
    if (!form.password) newError.password = "Password wajib diisi";
    if (!form.confirmPassword)
      newError.confirmPassword = "Konfirmasi password wajib diisi";
    if (!selectedUnit) newError.unit = "Unit wajib dipilih";

    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newError.confirmPassword = "Password tidak sama";
    }

    if (form.email) {
      const allowedDomains = [
        "@btn.co.id",
        "@bankbsn.co.id",
        "@bsn.co.id",
        "@gmail.com",
      ];
      if (
        !allowedDomains.some((domain) =>
          form.email.toLowerCase().endsWith(domain)
        )
      ) {
        newError.email = "Gunakan email resmi BSN";
      }
    }

    setError(newError);
    if (Object.keys(newError).length > 0) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Memproses pendaftaran...");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          unit: selectedUnit,
        }),
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error(data.message || "Gagal melakukan registrasi");
      }

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible
                ? "animate-in slide-in-from-top-2 fade-in"
                : "animate-out slide-out-to-top-2 fade-out"
            } max-w-[380px] w-full bg-white shadow-lg rounded-[12px] border border-slate-100 p-4 flex items-center gap-3`}
          >
            <div className="flex items-center justify-center shrink-0 w-8 h-8 bg-[#00634b] rounded-full">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[13px] font-bold text-slate-800 leading-tight">
                registrasi berhasil! Link verifikasi telah dikirim ke
              </p>
              <p className="text-[13px] font-bold text-slate-800 leading-tight mt-0.5">
                {form.email}
              </p>
            </div>
          </div>
        ),
        { position: "top-center", duration: 6000 }
      );

      setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
      setSelectedUnit("");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(
        err.message === "Gagal melakukan registrasi"
          ? "Email sudah terdaftar"
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <style>{`
        input::-ms-reveal, input::-ms-clear { display: none !important; }
        input::-webkit-credentials-auto-fill-button { visibility: hidden; position: absolute; right: 0; }
      `}</style>

      <div
        className="absolute inset-0 scale-105 bg-cover bg-center blur-[2px]"
        style={{ backgroundImage: "url('/images/landingpage-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* MODAL VERIFIKASI BERHASIL */}
      {verifyStatus === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[400px] rounded-[16px] bg-white px-8 py-10 shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4ade80] mb-5 shadow-lg shadow-[#4ade80]/40">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-[#00634b]">
              Verifikasi Berhasil
            </h2>
            <p className="mt-2 text-[13px] text-slate-500 font-medium">
              Email berhasil diverifikasi. Akun sudah aktif
            </p>
            <p
              className="mt-6 text-[13px] font-bold text-[#00634b] cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Anda akan diarahkan ke halaman login...
            </p>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI GAGAL */}
      {verifyStatus === "fail" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[400px] rounded-[16px] bg-white px-8 py-10 shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffccd5] mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4d4f] shadow-lg shadow-[#ff4d4f]/40">
                <FaXmark className="h-5 w-5 text-white" />
              </div>
            </div>
            <h2 className="text-[20px] font-bold text-[#ff4d4f]">
              Verifikasi Gagal
            </h2>
            <p className="mt-2 text-[13px] text-slate-700 font-medium leading-relaxed">
              Link verifikasi sudah kedaluwarsa. Email belum diverifikasi
            </p>
            <button
              onClick={() => {
                setVerifyStatus(null);
                toast.success(
                  "Silakan daftar ulang untuk meminta token baru."
                );
              }}
              className="mt-6 w-full rounded-xl bg-[#00634b] py-3 text-[14px] font-bold text-white shadow-md hover:bg-[#004d3a] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* FORM REGISTRASI */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-[650px] rounded-[20px] bg-white px-10 py-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <button
            onClick={() => navigate("/")}
            className="absolute right-6 top-6 cursor-pointer text-xl text-slate-500 transition hover:text-slate-800"
          >
            <FaXmark />
          </button>

          <div className="mb-8 text-center">
            <h1 className="text-[22px] font-bold text-[#00634b] leading-tight">
              Buat Akun Baru
            </h1>
            <p className="text-[13px] text-[#4a9b7c] mt-1 font-medium">
              Lengkapi data berikut untuk membuat akun
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
          >
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Masukan Nama"
                className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500"
              />
              {error.fullName && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {error.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="•••••"
                  className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 pr-11 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500 tracking-wider placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 flex items-center justify-center text-[#00634b] hover:opacity-80 transition-opacity"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {error.password && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {error.password}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contoh@gmail.com"
                className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500"
              />
              {error.email && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {error.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                Konfirmasi Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi Password"
                  className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 pr-11 text-[13px] outline-none focus:ring-2 focus:ring-[#00634b]/30 font-medium text-slate-900 placeholder:text-slate-500 tracking-wider placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 flex items-center justify-center text-[#00634b] hover:opacity-80 transition-opacity"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
              {error.confirmPassword && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {error.confirmPassword}
                </p>
              )}
            </div>

            {/* DROPDOWN PILIH UNIT */}
            <div className="md:col-span-2 relative" ref={dropdownRef}>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                Pilih Unit
              </label>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 text-[13px] outline-none cursor-pointer flex justify-between items-center font-medium focus:ring-2 focus:ring-[#00634b]/30 transition-colors"
              >
                <span
                  className={
                    selectedUnit
                      ? "text-slate-900 font-semibold"
                      : "text-slate-500"
                  }
                >
                  {selectedUnit || "pilih unit"}
                </span>
                <FaChevronDown
                  className={`text-slate-600 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  size={14}
                />
              </div>

              {isDropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 w-full bg-[#d7e2dc] rounded-[14px] shadow-[0_12px_36px_rgba(0,0,0,0.14)] border border-slate-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setHoveredUnit(null)}
                >
                  {unitList.map((unit, index) => {
                    const isSelected = selectedUnit === unit;
                    const isActive = isSelected || hoveredUnit === unit;
                    const isLast = index === unitList.length - 1;
                    return (
                      <div
                        key={index}
                        onMouseEnter={() => setHoveredUnit(unit)}
                        onClick={() => {
                          setSelectedUnit(unit);
                          setIsDropdownOpen(false);
                          setError({ ...error, unit: "" });
                        }}
                        className={`w-full px-4 cursor-pointer flex items-center transition-all duration-150 ease-out ${
                          isActive
                            ? "bg-[#1A5CFF] text-white font-bold text-[13.5px] py-3"
                            : `text-slate-800 font-medium text-[13px] py-2.5 ${
                                !isLast ? "border-b border-white" : ""
                              }`
                        }`}
                      >
                        {unit}
                      </div>
                    );
                  })}
                </div>
              )}
              {error.unit && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {error.unit}
                </p>
              )}
            </div>

            <div className="md:col-span-2 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-[14px] font-semibold text-white shadow-md shadow-[#00634b]/20 transition-all duration-200 hover:bg-[#004d3a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses Data..." : "Daftar"}
              </button>
            </div>
          </form>

          <p className="mt-7 text-center text-[13px] font-medium text-slate-700">
            Sudah punya akun?{" "}
            <span
              onClick={() => navigate("/login")}
              className="font-semibold text-[#00634b] hover:underline cursor-pointer"
            >
              Masuk Sekarang
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}