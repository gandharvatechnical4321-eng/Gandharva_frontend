import axios from "axios";
import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  Headphones,
  Quote,
  ShieldCheck,
  UserRound,
  UsersRound,
  Wifi,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const statistics = [
  {
    label: "Active Tutors",
    value: "1,248",
    icon: UsersRound,
  },
  {
    label: "Open Tasks",
    value: "320",
    icon: ClipboardCheck,
  },
  {
    label: "Quality Score",
    value: "92.6%",
    icon: ShieldCheck,
  },
  {
    label: "Daily Productivity",
    value: "78.4%",
    icon: BarChart3,
  },
];

function LoginPage() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const saveSession = (data) => {
    const loggedInUser = data.user || {};
    const cookieOptions = {
      expires: rememberMe ? 10 : 1,
      secure: window.location.protocol === "https:",
      sameSite: "Strict",
    };

    Cookies.set("token", data.token, cookieOptions);
    Cookies.set("fullName", loggedInUser.fullName || "", cookieOptions);
    Cookies.set("email", loggedInUser.email || identifier.trim(), cookieOptions);
    Cookies.set("role", loggedInUser.role || "operation executive", cookieOptions);
    Cookies.set("employeeCode", loggedInUser.employeeCode || "", cookieOptions);
    Cookies.set("employeeRole", loggedInUser.employeeRole || "", cookieOptions);
    Cookies.set("employeeStatus", loggedInUser.status || "ACTIVE", cookieOptions);
    Cookies.set("profileImageUrl", loggedInUser.profileImageUrl || "", cookieOptions);

    navigate("/dashboard", { replace: true });
    window.location.reload();
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!identifier.trim() || !password.trim()) {
      alert(isRegistering
        ? "Please enter your full name, email, and password."
        : "Please enter your email and password.");
      return;
    }

    if (!BACKEND_URL) {
      alert("Backend URL is missing. Check your .env file.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/${isRegistering ? "register" : "login"}`,
        isRegistering
          ? { fullName: fullName.trim(), email: identifier.trim(), password }
          : { email: identifier.trim(), password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        saveSession(res.data);
      } else {
        alert(res.data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error);

      alert(
        error.response?.data?.message ||
          "Something went wrong while authenticating."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") return;
    handleSubmit();
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-900"
      onKeyDown={handleKeyDown}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px]">
        {/* Left information panel */}
        <section className="relative hidden flex-1 flex-col px-8 py-8 lg:flex xl:px-12 xl:py-10">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <img
                  src="/logo.png"
                  alt="BrandName Logo"
                  className="h-full w-full object-cover scale-110 "
                  
                />
            </div>

            <div>
              <h1 className="text-[31px] font-black leading-none tracking-[-0.04em] text-black">
                BrandName
              </h1>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-8">
            <h2 className="text-[34px] font-extrabold tracking-[-0.035em] text-[#12387b] xl:text-[39px]">
              OPERATIONS DASHBOARD
            </h2>

            <p className="mt-1 text-lg text-slate-600">
              Centralized Operations Management System
            </p>

            <div className="mt-3 h-[3px] w-14 rounded-full bg-amber-500" />
          </div>

          {/* Network illustration */}
          <div className="relative mt-6 m-4 flex min-h-[200px] flex-1 items-center justify-center overflow-hidden  px-6 py-10 ">
           

            <div className="relative z-10 text-center">
              <h3 className="text-3xl font-black leading-tight tracking-[-0.035em] text-[#12387b] sm:text-4xl">
                Precision in Process.
                <span className="mt-2 block bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Excellence in Delivery.
                </span>
              </h3>

              
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 border-b border-slate-200 pb-6">
            {statistics.map(
              ({ label, value, icon: Icon }, index) => (
                <div
                  key={label}
                  className={`px-4 text-center ${
                    index !== statistics.length - 1
                      ? "border-r border-slate-200"
                      : ""
                  }`}
                >
                  <Icon
                    size={29}
                    strokeWidth={2.5}
                    className="mx-auto text-[#0756d6]"
                  />

                  <p className="mt-2 text-[21px] font-bold text-[#16469a]">
                    {value}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {label}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Quote */}
          <div className="mt-5 flex max-w-[560px] items-start gap-5 rounded-xl border border-slate-200 bg-white/75 px-6 py-4 shadow-sm backdrop-blur">
            <Quote
              size={35}
              fill="currentColor"
              className="mt-1 shrink-0 text-amber-500"
            />

            <div>
              <p className="font-bold text-[#16469a]">
                Execution turns plans into results.
              </p>

              <p className="mt-2 text-sm text-slate-600">
                – Today&apos;s Focus, Tomorrow&apos;s Impact.
              </p>
            </div>
          </div>

          {/* Status cards */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white/75 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />

                <h3 className="text-sm font-bold text-[#16469a]">
                  SYSTEM STATUS: OPERATIONAL
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200">
                {[
                  ["Database", "Online"],
                  ["Task Engine", "Running"],
                  ["Notifications", "Active"],
                ].map(([title, status]) => (
                  <div
                    key={title}
                    className="px-2 text-center"
                  >
                    <CheckCircle2
                      size={16}
                      className="mx-auto text-emerald-500"
                    />

                    <p className="mt-2 text-[10px] text-slate-700">
                      {title}
                    </p>

                    <p className="text-[10px] text-slate-500">
                      {status}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/75 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={19}
                  className="text-[#0756d6]"
                />

                <h3 className="text-sm font-bold text-[#16469a]">
                  SECURE LOGIN
                </h3>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  "Role Based Access Control",
                  "Encrypted Authentication",
                  "Activity Logging Enabled",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-xs text-slate-600"
                  >
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      className="text-[#0756d6]"
                    />

                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right authentication panel */}
        <section className="flex w-full items-center justify-center px-4 py-6 sm:px-7 lg:w-[46%] lg:min-w-[520px] xl:px-10">
          <div className="w-full max-w-[500px] rounded-[22px] border border-white/90 bg-white/90 px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-10 sm:py-10 xl:px-12 xl:py-12">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0756d6] text-xl font-black text-white">
                G
              </div>

              <div>
                <p className="text-xl font-black text-slate-950">
                  BrandName
                </p>

                <p className="text-xs text-slate-500">
                  Operations Dashboard
                </p>
              </div>
            </div>

            <>
              <div className="text-center">
                <h2 className="text-3xl font-extrabold tracking-[-0.025em] text-[#12387b]">
                  {isRegistering ? "Create your account" : "Welcome Back!"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {isRegistering
                    ? "Register securely with Firebase to access your dashboard"
                    : "Please sign in to access your dashboard"}
                </p>
              </div>

              <div className="mt-10 space-y-7">
                {isRegistering && (
                  <div>
                    <label htmlFor="fullName" className="mb-3 block text-sm font-semibold text-slate-900">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      onChange={(event) => setFullName(event.target.value)}
                      className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0756d6] focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="identifier" className="mb-3 block text-sm font-semibold text-slate-900">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="identifier"
                      type="email"
                      value={identifier}
                      placeholder="you@example.com"
                      autoComplete="email"
                      onChange={(event) => setIdentifier(event.target.value)}
                      className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0756d6] focus:ring-4 focus:ring-blue-100"
                    />
                    <UserRound size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-3 block text-sm font-semibold text-slate-900">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="At least 6 characters"
                      autoComplete={isRegistering ? "new-password" : "current-password"}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0756d6] focus:ring-4 focus:ring-blue-100"
                    />
                    <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#0756d6]">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {!isRegistering && (
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                      <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#0756d6]" />
                      Remember Me
                    </label>
                    <button type="button" onClick={() => alert("Use your Firebase account email and password, or contact an administrator.")} className="text-sm font-medium text-[#0756d6] hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button type="button" disabled={isLoading} onClick={handleSubmit} className="flex h-14 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#0756d6] to-[#145de0] text-sm font-bold text-white shadow-[0_10px_25px_rgba(7,86,214,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                  {isLoading ? "AUTHENTICATING..." : isRegistering ? "CREATE ACCOUNT" : "LOGIN TO DASHBOARD"}
                </button>
              </div>

              <button type="button" disabled={isLoading} onClick={() => setIsRegistering((current) => !current)} className="mt-6 w-full text-sm font-semibold text-[#0756d6] transition hover:text-[#12387b] disabled:opacity-60">
                {isRegistering ? "Already have an account? Sign in" : "Need an account? Register"}
              </button>
            </>
            {/*
            {step === 1 ? (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold tracking-[-0.025em] text-[#12387b]">
                    Welcome Back!
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Please sign in to access your dashboard
                  </p>
                </div>

                <div className="mt-10 space-y-7">
                  <div>
                    <label
                      htmlFor="identifier"
                      className="mb-3 block text-sm font-semibold text-slate-900"
                    >
                      Employee ID / Email
                    </label>

                    <div className="relative">
                      <input
                        id="identifier"
                        type="text"
                        value={identifier}
                        placeholder="Enter your employee ID or email"
                        autoComplete="fullName"
                        onChange={(event) =>
                          setIdentifier(
                            event.target.value
                          )
                        }
                        className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0756d6] focus:ring-4 focus:ring-blue-100"
                      />

                      <UserRound
                        size={20}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-3 block text-sm font-semibold text-slate-900"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        onChange={(event) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        className="h-14 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0756d6] focus:ring-4 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#0756d6]"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(
                            event.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 accent-[#0756d6]"
                      />

                      Remember Me
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          "Please contact your administrator to reset your password."
                        )
                      }
                      className="text-sm font-medium text-[#0756d6] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleLogin}
                    className="flex h-14 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#0756d6] to-[#145de0] text-sm font-bold text-white shadow-[0_10px_25px_rgba(7,86,214,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(7,86,214,0.28)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading
                      ? "VERIFYING CREDENTIALS..."
                      : "LOGIN TO DASHBOARD"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0756d6]">
                    <LockKeyhole size={30} />
                  </div>

                  <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.025em] text-[#12387b]">
                    Verify Your Login
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter the 6-digit security code generated
                    for
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-[#16469a]">
                    {verifiedEmail}
                  </p>
                </div>

                <div className="mt-9">
                  <label
                    htmlFor="otp"
                    className="mb-3 block text-sm font-semibold text-slate-900"
                  >
                    Security Code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    onChange={handleOtpChange}
                    className="h-16 w-full rounded-lg border border-slate-300 bg-white px-5 text-center text-2xl font-bold tracking-[0.55em] text-[#12387b] outline-none transition placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#0756d6] focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    disabled={
                      isLoading ||
                      otp.length !== 6
                    }
                    onClick={verifyOtp}
                    className="mt-6 flex h-14 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#0756d6] to-[#145de0] text-sm font-bold text-white shadow-[0_10px_25px_rgba(7,86,214,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading
                      ? "VERIFYING..."
                      : "VERIFY & CONTINUE"}
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleBackToLogin}
                    className="mt-4 w-full text-sm font-semibold text-slate-500 transition hover:text-[#0756d6] disabled:opacity-60"
                  >
                    Back to login
                  </button>
                </div>
              </>
            )}
            */}

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-500">
                or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-200">
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Please contact the administrator to request dashboard access."
                  )
                }
                className="flex items-center justify-center gap-3 px-2 py-2 text-sm font-medium text-[#0756d6] transition hover:text-[#12387b]"
              >
                <UserRound size={20} />
                Need Access?
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Contact your administrator for login support."
                  )
                }
                className="flex items-center justify-center gap-3 px-2 py-2 text-sm font-medium text-[#0756d6] transition hover:text-[#12387b]"
              >
                <Headphones size={20} />
                Contact Admin
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 lg:hidden">
              <Wifi size={14} />
              System operational
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;