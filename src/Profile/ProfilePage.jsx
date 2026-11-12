
import { useEffect, useState } from "react";

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
    const [profile, setProfile] = useState(INITIAL_PROFILE);

    const [loading, setLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });

    // Fetch profile when the page loads
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
    // Handle profile input changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Update profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        setProfileSaving(true);
        setNotification({ type: "", message: "" });

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

    // Change password
    const handlePasswordSubmit = async (passwordData) => {
        setPasswordSaving(true);
        setNotification({ type: "", message: "" });

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

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-9 h-9 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />

                    <p className="text-sm text-slate-400 mt-4">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1220] text-slate-100 p-5 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Page Header */}
                <div className="mb-7">
                    <h1 className="text-2xl font-bold text-white">
                        My Profile
                    </h1>

                    <p className="text-sm text-slate-400 mt-1">
                        Manage your personal information and account security.
                    </p>
                </div>

                {/* Notification */}
                {notification.message && (
                    <div
                        className={`mb-5 p-4 rounded-lg text-sm border ${notification.type === "success"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-red-500/10 text-red-400 border-red-500/30"
                            }`}
                    >
                        {notification.message}
                    </div>
                )}

                <div className="space-y-6">

                    <ProfileHeader profile={profile} />

                    <ProfileInformation
                        profile={profile}
                        onChange={handleProfileChange}
                        onSubmit={handleProfileSubmit}
                        saving={profileSaving}
                    />

                    <AccountSecurity
                        onChangePassword={() => {
                            setNotification({
                                type: "",
                                message: "",
                            });

                            setShowPasswordModal(true);
                        }}
                    />

                </div>
            </div>

            {/* Change Password Modal */}
            <ChangePasswordModal
                open={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handlePasswordSubmit}
                saving={passwordSaving}
            />
        </div>
    );
}
