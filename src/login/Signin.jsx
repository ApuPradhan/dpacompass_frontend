import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dpacompassBg from "../assets/background_landingpage.jpeg";
import { API_BASE_URL } from "../config";


const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

const Signin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        provider: "local",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [captchaKey, setCaptchaKey] = useState("");
    const [captchaImage, setCaptchaImage] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    const fetchCaptcha = async () => {
        try {
            setCaptchaLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/auth/captcha/`,
                {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch CAPTCHA");
            }

            const data = await response.json();

            setCaptchaKey(data.captcha_key);
            setCaptchaImage(`${API_BASE_URL}${data.captcha_image}`);
            setCaptchaInput("");
        } catch (error) {
            console.error("CAPTCHA error:", error);
            toast.error("Unable to load CAPTCHA. Please try again.");
        } finally {
            setCaptchaLoading(false);
        }
    };

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!captchaKey) {
            toast.warn("CAPTCHA is not loaded. Please refresh it.");
            return;
        }

        if (!captchaInput.trim()) {
            toast.warn("Please enter the CAPTCHA.");
            return;
        }

        try {
            setLoginLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/auth/login/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        provider: "local",
                        captcha_key: captchaKey,
                        captcha_value: captchaInput.trim(),
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                localStorage.setItem("user", JSON.stringify(data.user));

                const role = data.user?.role;

                if (role === 3) {
                    navigate("/devdashboard");
                } else if (role === 1) {
                    navigate("/admindashboard");
                } else if (role === 2) {
                    navigate("/auditdashboard");
                } else {
                    navigate("/dashboard");
                }
            } else if (response.status === 403) {
                const message = Array.isArray(data?.message)
                    ? data.message[0]
                    : data?.message || data?.detail || data?.error || "";

                if (
                    message.toLowerCase().includes("account not approved")
                ) {
                    navigate("/pending");
                } else {
                    toast.error(message || "Forbidden");
                }

                fetchCaptcha();
            } else {
                toast.error(
                    data?.message ||
                    data?.detail ||
                    data?.error ||
                    "Invalid credentials"
                );

                fetchCaptcha();
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Server error. Try again after some time.");
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <main
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-contain bg-center bg-no-repeat bg-[#eaf7ff] px-4 py-8 sm:px-6"
            style={{ backgroundImage: `url(${dpacompassBg})` }}
        >
            <div
                className="absolute inset-0 bg-white/25"
                aria-hidden="true"
            />

            <section className="relative z-10 w-full max-w-lg rounded-2xl border border-white/80 bg-white/90 p-7 shadow-2xl shadow-sky-900/20 backdrop-blur-xl sm:p-9">
                <header className="mb-6 text-center">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                        CDAC · MeitY
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        DPACOMPASS
                    </h1>

                    <div className="mx-auto my-4 h-1 w-14 rounded-full bg-linear-to-r from-sky-500 to-blue-700" />

                    <h2 className="text-lg font-semibold text-slate-800">
                        Sign in to your account
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-slate-600">
                        Access your DPDP compliance dashboard securely.
                    </p>
                </header>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="signin-username"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Username
                        </label>

                        <input
                            id="signin-username"
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            className={inputClass}
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="signin-password"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                className={`${inputClass} pr-11`}
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:text-sky-700"
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <FiEyeOff size={18} />
                                ) : (
                                    <FiEye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Security verification
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="flex min-h-14 items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                                {captchaLoading ? (
                                    <span className="text-sm text-slate-500">
                                        Loading CAPTCHA...
                                    </span>
                                ) : captchaImage ? (
                                    <img
                                        src={captchaImage}
                                        alt="CAPTCHA challenge"
                                        className="h-10 min-w-0 flex-1 object-contain"
                                    />
                                ) : (
                                    <span className="text-sm text-slate-500">
                                        CAPTCHA unavailable
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={fetchCaptcha}
                                    disabled={captchaLoading}
                                    className="shrink-0 rounded-md p-2 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50"
                                    title="Refresh CAPTCHA"
                                    aria-label="Refresh CAPTCHA"
                                >
                                    <FiRefreshCw
                                        size={17}
                                        className={
                                            captchaLoading ? "animate-spin" : ""
                                        }
                                    />
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Enter CAPTCHA"
                                aria-label="Enter CAPTCHA"
                                className={inputClass}
                                value={captchaInput}
                                onChange={(e) =>
                                    setCaptchaInput(e.target.value)
                                }
                                autoComplete="off"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loginLoading || captchaLoading}
                        className="flex w-full items-center justify-center rounded-lg bg-linear-to-r from-sky-600 to-blue-700 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-900/20 transition hover:from-sky-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loginLoading ? "Signing in..." : "Sign In"}
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        New user?{" "}
                        <a
                            href="/signup"
                            className="font-semibold text-sky-700 underline-offset-4 hover:text-blue-800 hover:underline"
                        >
                            Create an account
                        </a>
                    </p>
                </form>

                <footer className="mt-6 border-t border-slate-200 pt-4 text-center">
                    <p className="text-xs leading-5 text-slate-500">
                        Data Privacy · Security · Compliance
                    </p>
                </footer>
            </section>
        </main>
    );
};

export default Signin;