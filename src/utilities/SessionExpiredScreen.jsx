import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, LogIn } from "lucide-react";
import { SESSION_EXPIRED_EVENT } from "../utilities/fetchWithAuth";

const SessionExpiredScreen = () => {
    const [expired, setExpired] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleSessionExpired = () => {
            setExpired(true);
        };

        window.addEventListener(
            SESSION_EXPIRED_EVENT,
            handleSessionExpired
        );

        return () => {
            window.removeEventListener(
                SESSION_EXPIRED_EVENT,
                handleSessionExpired
            );
        };
    }, []);

    const handleSignIn = () => {
        setExpired(false);
        navigate("/signin", { replace: true });
    };

    if (!expired) return null;

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-[#070711]/95 px-4 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl border border-violet-500/30 bg-[#11111f] p-8 text-center shadow-2xl shadow-violet-950/40">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
                    <ShieldAlert
                        size={32}
                        className="text-red-400"
                    />
                </div>

                <h2 className="mb-3 text-2xl font-bold text-white">
                    Session Expired
                </h2>

                <p className="mb-7 text-sm leading-6 text-gray-400">
                    Your session has expired or is no longer valid.
                    Please sign in again to continue using DPACOMPASS.
                </p>

                <button
                    onClick={handleSignIn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#11111f]"
                >
                    <LogIn size={18} />
                    Sign In Again
                </button>

                <p className="mt-4 text-xs text-gray-500">
                    Your access session is no longer active.
                </p>
            </div>
        </div>
    );
};

export default SessionExpiredScreen;