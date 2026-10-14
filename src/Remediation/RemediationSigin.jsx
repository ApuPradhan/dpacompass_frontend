import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

const RemediationSignin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState("");
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    function generateCaptcha() {
        return Math.floor(100000 + Math.random() * 90000); // 4 digit
    }

    const handleRefreshCaptcha = () => {
        setCaptcha(generateCaptcha());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // captcha validation
        if (captchaInput !== captcha.toString()) {
            // alert("Invalid Captcha");
            toast.error("Invalid Captcha");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                // console.log(data.cookies);

                localStorage.setItem("user", JSON.stringify(data.user));

                const role = data.user.role;

                if (role === 3) {
                    console.log("Entered remediation gate");
                    
                    navigate("/remediation/gate");
                } else {
                    navigate("/signin"); // fallback
                }

            } else if (
                response.status === 400 &&
                data?.Message[0] === "Account pending admin approval"
            ) {
                navigate("/pending");
            }
            else {
                console.error(data);
                // alert("Invalid credentials");
                toast.error("Invalid credentials");

            }

        } catch (error) {
            console.error(error);
            toast.error("Server error, try again");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#1e293b] px-4">
            <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-700">

                {/* Header */}
                <div className="text-center mb-5">
                    <h1 className="text-3xl font-bold text-white">DPACOMPASS</h1>
                    <h2 className="text-lg font-semibold text-white mt-1">
                        Sign In
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Access your DPDP compliance dashboard
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>

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
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password *"
                            className={inputClass}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>

                    {/* Captcha */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* LEFT: Captcha */}
                        <div className="flex items-center justify-between border border-gray-600 rounded-lg px-4 py-2 bg-white">
                            <span className="text-black font-bold tracking-widest text-lg">
                                {captcha}
                            </span>

                            <button
                                type="button"
                                onClick={handleRefreshCaptcha}
                                className="text-gray-600 hover:text-indigo-500 transition"
                            >
                                <FiRefreshCw size={16} />
                            </button>
                        </div>

                        {/* RIGHT: Input */}
                        <input
                            type="text"
                            placeholder="Enter Captcha *"
                            className={inputClass}
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            required
                        />

                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:scale-[1.01] transition-all duration-200"
                    >
                        Remediation Sign In
                    </button>

                </form>
            </div>
        </div>
    );
};

export default RemediationSignin;