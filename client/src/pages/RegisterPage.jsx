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

  // STATE UNTUK TOKEN & POPUP VALIDASI KODE
  const [currentVerifyToken, setCurrentVerifyToken] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

  // DETEKSI TOKEN DARI LINK EMAIL DAN BUKA POPUP INPUT KODE
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("verifyToken");

    if (token) {
      setCurrentVerifyToken(token);
      setShowCodeModal(true);
    }
  }, [location.search]);

  // HANDLE VALIDASI KODE REGISTRASI & TOKEN EMAIL
  const handleVerifyWithCode = async (e) => {
    e.preventDefault();
    if (!registrationCode.trim()) {
      toast.error("Kode validasi registrasi wajib diisi");
      return;
    }

    setIsVerifyingCode(true);
    const loadingToast = toast.loading("Memvalidasi kode...");

    try {
      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: currentVerifyToken,
          registrationCode: registrationCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        setShowCodeModal(false);
        setVerifyStatus("success");
        window.history.replaceState(null, "", "/register");
      } else {
        if (
          data.message?.toLowerCase().includes("kedaluwarsa") ||
          data.message?.toLowerCase().includes("sesi")
        ) {
          setShowCodeModal(false);
          setVerifyStatus("fail");
        } else {
          toast.error(data.message || "Kode validasi tidak valid");
        }
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    const loadingToast = toast.loading("Meminta link baru...");

    try {
      const res = await fetch(`${API_URL}/auth/resend-verification-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: currentVerifyToken }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Link verifikasi baru telah dikirim ke email Anda!");
        setVerifyStatus(null);
      } else {
        toast.error(data.message || "Gagal mengirim link verifikasi baru");
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Gagal terhubung ke server");
    } finally {
      setIsResending(false);
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
                Registrasi berhasil! Link aktivasi telah dikirim ke
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

      {/* POPUP 1: INPUT KODE VALIDASI REGISTRASI */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] rounded-[24px] bg-white px-8 py-9 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowCodeModal(false);
                window.history.replaceState(null, "", "/register");
              }}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 transition"
            >
              <FaXmark size={20} />
            </button>

            <div className="mb-6 text-center">
              <h2 className="text-[22px] font-bold text-[#00634b] leading-tight">
                Validasi Akun Anda
              </h2>
              <p className="text-[13px] text-[#4a9b7c] mt-1 font-medium">
                masukkan kode validasi dari admin kantor
              </p>
            </div>

            <form onSubmit={handleVerifyWithCode}>
              <div className="mb-5">
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                  Kode Validasi Registrasi
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value.toUpperCase())}
                  placeholder="CONTOH: 7K9X2P"
                  autoFocus
                  className="w-full rounded-xl bg-[#dce9e3] px-4 py-3.5 text-[14px] text-center uppercase tracking-widest font-mono font-bold text-[#00634b] outline-none focus:ring-2 focus:ring-[#00634b]/30 placeholder:text-slate-400 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingCode}
                className="w-full flex justify-center items-center cursor-pointer rounded-xl bg-[#00634b] py-3.5 text-[14px] font-bold text-white shadow-md shadow-[#00634b]/20 hover:bg-[#004d3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingCode ? "Memvalidasi..." : "Aktivasi Akun Saya"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 2: SUKSES VERIFIKASI */}
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
              Aktivasi Berhasil!
            </h2>
            <p className="mt-2 text-[13px] text-slate-500 font-medium">
              Akun Anda telah aktif dan siap digunakan.
            </p>
            <button
              className="mt-6 w-full rounded-xl bg-[#00634b] py-3 text-[13px] font-bold text-white hover:bg-[#004d3a] transition"
              onClick={() => navigate("/login")}
            >
              Masuk ke Aplikasi Sekarang
            </button>
          </div>
        </div>
      )}

      {/* POPUP 3: GAGAL / TOKEN EXPIRED */}
      {verifyStatus === "fail" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[380px] rounded-[16px] bg-white px-8 py-9 shadow-2xl text-center">
            <button
              onClick={() => setVerifyStatus(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800"
            >
              <FaXmark size={20} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
              <FaXmark className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-[20px] font-bold text-red-500">Sesi Kedaluwarsa</h2>
            <p className="mt-2 text-[13px] text-slate-700 font-medium leading-relaxed px-2">
              Link aktivasi email sudah kedaluwarsa (lewat 5 menit).
            </p>

            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="mt-7 w-full flex justify-center items-center rounded-xl bg-[#00634b] py-3.5 text-[14px] font-bold text-white shadow-md hover:bg-[#004d3a] transition-colors disabled:opacity-50"
            >
              {isResending ? "Memproses..." : "Kirim Ulang Email Aktivasi"}
            </button>
          </div>
        </div>
      )}

      {/* FORM UTAMA PENDAFTARAN */}
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
                        className={`w-full flex items-center cursor-pointer transition-colors duration-150 ease-out px-4 py-2.5 ${
                          isActive
                            ? "bg-[#00634b] text-white font-semibold text-[12.5px]"
                            : `text-slate-800 font-medium text-[12px] ${
                                !isLast ? "border-b border-white/60" : ""
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

            {/* INFO KODE VALIDASI DI BAWAH PILIH UNIT */}
            <div className="md:col-span-2 -mt-1 text-center">
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                Hubungi <span className="font-semibold text-[#00634b]">Admin Kantor</span> untuk mendapatkan kode validasi registrasi akun Anda.
              </p>
            </div>

            <div className="md:col-span-2 pt-1">
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