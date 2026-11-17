
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiUser,
    FiRefreshCw,
    FiCheckCircle,
    FiAlertCircle,
} from "react-icons/fi";

import ProfileHeader from "./components/ProfileHeader";
import ProfileInformation from "./components/ProfileInformation";
import AccountSecurity from "./components/AccountSecurity";
import ChangePasswordModal from "./components/ChangePasswordModal";

import {
    getProfile,
    updateProfile,
    changePassword,
} from "./services/ProfileService";

const INITIAL_PROFILE = {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    organization: "",
    designation: "",
    role: "",
    status: "",
};

export default function ProfilePage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(INITIAL_PROFILE);

    const [loading, setLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });

    // ================= FETCH PROFILE =================

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);

            try {
                const profileData = await getProfile();

                setProfile({
                    ...INITIAL_PROFILE,
                    ...profileData,
                });
            } catch (error) {
                console.error("PROFILE FETCH ERROR:", error);

                setNotification({
                    type: "error",
                    message: error.message || "Unable to load profile.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // ================= PROFILE INPUT CHANGE =================

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ================= UPDATE PROFILE =================

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        setProfileSaving(true);
        setNotification({
            type: "",
            message: "",
        });

        try {
            const updatedProfile = await updateProfile({
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email,
                organization: profile.organization,
                designation: profile.designation,
            });

            setProfile((prev) => ({
                ...prev,
                ...updatedProfile,
            }));

            setNotification({
                type: "success",
                message: "Profile updated successfully.",
            });
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Unable to update profile.",
            });
        } finally {
            setProfileSaving(false);
        }
    };

    // ================= CHANGE PASSWORD =================

    const handlePasswordSubmit = async (passwordData) => {
        setPasswordSaving(true);

        setNotification({
            type: "",
            message: "",
        });

        try {
            await changePassword(passwordData);

            setShowPasswordModal(false);

            setNotification({
                type: "success",
                message: "Password changed successfully.",
            });
        } catch (error) {
            throw error;
        } finally {
            setPasswordSaving(false);
        }
    };

    // ================= LOADING STATE =================

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#F4F7FB] flex items-center justify-center p-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                    <div className="relative w-12 h-12 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />

                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#075EB5] animate-spin" />
                    </div>

                    <h3 className="text-base font-semibold text-[#173B70] mt-5">
                        Loading your profile
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                        Please wait while we retrieve your account information.
                    </p>
                </div>
            </div>
        );
    }

    // ================= MAIN UI =================

    return (
        <div className="min-h-screen w-full bg-[#F4F7FB] p-4 md:p-6 xl:p-8">

            <div className="w-full mx-auto">

                {/* ================= PAGE HEADER ================= */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

                    <div className="flex items-start gap-4">

                        <button
                            type="button"
                            onClick={() => navigate("/admindashboard")}
                            title="Back to dashboard"
                            className="mt-1 p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer shadow-sm"
                        >
                            <FiArrowLeft size={21} />
                        </button>

                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                                    <FiUser size={22} />
                                </div>

                                <h1 className="text-2xl md:text-3xl font-bold text-[#14213D]">
                                    My Profile
                                </h1>
                            </div>

                            <p className="text-sm md:text-base text-slate-500 mt-3">
                                Manage your personal information and account security.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ================= NOTIFICATION ================= */}

                {notification.message && (
                    <div
                        role="alert"
                        className={`mb-6 flex items-start gap-3 rounded-xl border p-5 shadow-sm ${
                            notification.type === "success"
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-red-50 border-red-200"
                        }`}
                    >
                        {notification.type === "success" ? (
                            <FiCheckCircle
                                size={21}
                                className="mt-0.5 shrink-0 text-emerald-600"
                            />
                        ) : (
                            <FiAlertCircle
                                size={21}
                                className="mt-0.5 shrink-0 text-red-600"
                            />
                        )}

                        <div className="flex-1">
                            <p
                                className={`text-sm font-bold ${
                                    notification.type === "success"
                                        ? "text-emerald-700"
                                        : "text-red-700"
                                }`}
                            >
                                {notification.type === "success"
                                    ? "Success"
                                    : "Something went wrong"}
                            </p>

                            <p
                                className={`text-sm mt-1 ${
                                    notification.type === "success"
                                        ? "text-emerald-700"
                                        : "text-red-600"
                                }`}
                            >
                                {notification.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* ================= PROFILE CONTENT ================= */}

                <div className="space-y-7">

                    {/* PROFILE HEADER */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <ProfileHeader profile={profile} />
                    </section>

                    {/* PROFILE INFORMATION */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <ProfileInformation
                            profile={profile}
                            onChange={handleProfileChange}
                            onSubmit={handleProfileSubmit}
                            saving={profileSaving}
                        />
                    </section>

                    {/* ACCOUNT SECURITY */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <AccountSecurity
                            onChangePassword={() => {
                                setNotification({
                                    type: "",
                                    message: "",
                                });

                                setShowPasswordModal(true);
                            }}
                        />
                    </section>
                </div>
            </div>

            {/* ================= CHANGE PASSWORD MODAL ================= */}

            <ChangePasswordModal
                open={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handlePasswordSubmit}
                saving={passwordSaving}
            />
        </div>
    );
}
