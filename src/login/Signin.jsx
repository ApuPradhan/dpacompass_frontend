import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

const Signin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        provider: "local",
    });

    const [showPassword, setShowPassword] = useState(false);

    // Backend CAPTCHA states
    const [captchaKey, setCaptchaKey] = useState("");
    const [captchaImage, setCaptchaImage] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");

    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    /*
     * Fetch CAPTCHA from backend
     */
    const fetchCaptcha = async () => {
        try {
            setCaptchaLoading(true);

            const response = await fetch(
                `${BASE_URL}/api/auth/captcha`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch captcha");
            }

            const data = await response.json();

            setCaptchaKey(data.captcha_key);

            /*
             * Backend returns:
             * /captcha/image/<captcha_key>/
             *
             * We prepend BASE_URL.
             */
            setCaptchaImage(
                `${BASE_URL}${data.captcha_image}`
            );

            // Clear previous CAPTCHA input
            setCaptchaInput("");

        } catch (error) {
            console.error("Captcha error:", error);

            toast.error(
                "Unable to load CAPTCHA. Please try again."
            );
        } finally {
            setCaptchaLoading(false);
        }
    };

    /*
     * Fetch CAPTCHA when page loads
     */
    useEffect(() => {
        fetchCaptcha();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    /*
     * Refresh CAPTCHA
     */
    const handleRefreshCaptcha = () => {
        fetchCaptcha();
    };

    /*
     * Login
     */
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
                `${BASE_URL}/api/auth/login/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        provider: "local",
                        // Backend generated CAPTCHA key
                        captcha_key: captchaKey,

                        // User entered CAPTCHA
                        captcha_value: captchaInput.trim()
                    })
                }
            );

            const data = await response.json();


            if (response.ok) {

                localStorage.setItem(
                    "access",
                    data.access
                );

                localStorage.setItem(
                    "refresh",
                    data.refresh
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                const role = data.user.role;

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

                let msg = "";

                if (Array.isArray(data?.message)) {
                    msg = data.message[0];

                } else {
                    msg =
                        data?.message ||
                        data?.detail ||
                        data?.error ||
                        "";
                }

                if (
                    msg &&
                    msg
                        .toLowerCase()
                        .includes("account not approved")
                ) {
                    navigate("/pending");

                } else {
                    toast.error(msg || "Forbidden");
                }

                // Refresh CAPTCHA after failed login
                fetchCaptcha();

            } else {

                console.error(data);

                let msg =
                    data?.message ||
                    data?.detail ||
                    data?.error ||
                    "Invalid credentials";

                toast.error(msg);

                // Refresh CAPTCHA
                fetchCaptcha();
            }

        } catch (error) {

            console.error("Login error:", error);

            toast.error(
                "Server error. Try again after sometime."
            );

        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#1e293b] px-4">

            <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-700">

                {/* Header */}
                <div className="text-center mb-5">

                    <h1 className="text-3xl font-bold text-white">
                        DPACOMPASS
                    </h1>

                    <h2 className="text-lg font-semibold text-white mt-1">
                        Sign In
                    </h2>

                    <p className="text-gray-400 text-sm mt-1">
                        Access your DPDP compliance dashboard
                    </p>

                </div>

                {/* Form */}
                <form
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >

                    {/* Username */}
                    <input
                        type="text"
                        name="username"
                        placeholder="Username *"
                        className={inputClass}
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    {/* Password */}
                    <div className="relative">

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            name="password"
                            placeholder="Password *"
                            className={inputClass}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                            {showPassword ? (
                                <FiEyeOff size={18} />
                            ) : (
                                <FiEye size={18} />
                            )}
                        </button>

                    </div>

                    {/* Backend CAPTCHA */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* CAPTCHA IMAGE */}
                        <div className="flex items-center justify-between border border-gray-600 rounded-lg px-3 py-2 bg-white min-h-[48px]">

                            {captchaLoading ? (

                                <span className="text-gray-500 text-sm">
                                    Loading...
                                </span>

                            ) : captchaImage ? (

                                <img
                                    src={captchaImage}
                                    alt="CAPTCHA"
                                    className="h-10 w-[160px] object-contain"
                                />

                            ) : (

                                <span className="text-gray-500 text-sm">
                                    CAPTCHA unavailable
                                </span>

                            )}

                            <button
                                type="button"
                                onClick={handleRefreshCaptcha}
                                disabled={captchaLoading}
                                className="text-gray-600 hover:text-indigo-500 transition disabled:opacity-50"
                                title="Refresh CAPTCHA"
                            >
                                <FiRefreshCw
                                    size={18}
                                    className={
                                        captchaLoading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                            </button>

                        </div>

                        {/* CAPTCHA INPUT */}
                        <input
                            type="text"
                            placeholder="Enter Captcha *"
                            className={inputClass}
                            value={captchaInput}
                            onChange={(e) =>
                                setCaptchaInput(e.target.value)
                            }
                            required
                            autoComplete="off"
                        />

                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full py-2.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:scale-[1.01] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loginLoading
                            ? "Signing In..."
                            : "Sign In"}
                    </button>

                    {/* Register Link */}
                    <p className="text-center text-sm text-gray-400">

                        New User?{" "}

                        <a
                            href="/signup"
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            Register
                        </a>

                    </p>

                </form>

            </div>

        </div>
    );
};

export default Signin;