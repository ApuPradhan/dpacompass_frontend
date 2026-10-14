import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

const Signup = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        organization: "",
        designation: "",
        role: 0
    });


    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/roles/`);
                const data = await res.json();
                setRoles(data);

                if (data.length > 0) {
                    setFormData((prev) => ({
                        ...prev,
                        role: data[0].name
                    }));
                }
                else{
                    toast.error("Roles could not be loaded. Something went wrong!!")
                }
            } catch (err) {
                console.error("Failed to fetch roles", err);
            }
        };

        fetchRoles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === "role" ? parseInt(value) : value
        });
    };
    const isMatch =
        confirmPassword.length > 0 &&
        formData.password === confirmPassword;

    const isMismatch =
        confirmPassword.length > 0 &&
        formData.password !== confirmPassword;
    const handleSubmit = async (e) => {
        // console.log(formData);
        e.preventDefault();

        try {
            const response = await fetch(`${BASE_URL}/api/auth/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Registration successful");
                setTimeout(() => {
                    navigate("/signin");
                }, 500);
            } else {
                // Handle field errors
                if (data.username || data.email) {
                    toast.warn(data.username?.[0] || data.email?.[0]);
                }
                // Handle generic backend errors
                else if (data.detail) {
                    toast.warn(data.detail);
                }
                // Fallback
                else {
                    toast.warn("Something went wrong");
                }
            }
        } catch (error) {
            console.error(error);
            toast.warn("Server error");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#1e293b] px-4">

            <div className="w-full max-w-3xl bg-[#0f172a]/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-700">

                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold text-white">DPACOMPASS</h1>
                    <h2 className="text-lg font-semibold text-white mt-1">
                        Create Account
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Register to access the DPDP compliance platform
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-3" onSubmit={handleSubmit}>

                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" name="first_name" placeholder="First Name *" className={inputClass} value={formData.first_name} onChange={handleChange} />
                        <input type="text" name="last_name" placeholder="Last Name *" className={inputClass} value={formData.last_name} onChange={handleChange} />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 gap-3">
                        <input type="text" name="username" placeholder="Username *" className={inputClass} value={formData.username} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <input type="email" name="email" placeholder="Email *" className={inputClass} value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <input type="text" name="organization" placeholder="Organization Name *" value={formData.organization} onChange={handleChange} className={inputClass} />
                    </div>
                    {/* Row 3 */}
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            className={inputClass}
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option key={0} value={0}>Select the type</option>
                            {roles.length > 0 ? (
                                roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))
                            ) : (
                                <option>Loading roles...</option>
                            )}
                        </select>
                        <input type="text" name="designation" placeholder="Designation" className={inputClass} value={formData.designation}
                            onChange={handleChange} />
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* Password */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password *"
                                className={inputClass}
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password *"
                                className={inputClass}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            {/* Match / Not Match Message */}
                            {confirmPassword.length > 0 && (
                                <p
                                    className={`text-xs mt-1 ${isMatch ? "text-green-400" : "text-red-400"
                                        }`}
                                >
                                    {isMatch ? "Passwords match" : "Passwords do not match"}
                                </p>
                            )}
                        </div>

                    </div>
                    {/* Button */}
                    <button
                        type="submit"
                        disabled={!isMatch}
                        className={`w-full py-2.5 rounded-lg font-semibold mt-2 transition-all duration-200
                        ${isMatch
                                ? "bg-linear-to-r from-indigo-500 to-purple-600 hover:scale-[1.01] text-white"
                                : "bg-gray-600 text-gray-300 cursor-not-allowed"
                            }
                        `}
                    >
                        Create Account
                    </button>
                </form>
                {/* Register Link */}
                <p className="text-center text-sm text-gray-400 mt-2.5">
                    Already an user?{" "}
                    <a
                        href="/signin"
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Signup;