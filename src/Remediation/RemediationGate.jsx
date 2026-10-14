import { useNavigate } from "react-router-dom";
import Loader from "../utilities/Loader";
import { useState } from "react";

const RemediationGate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadText, setLoadText] = useState("Loading...");
    const handleYes = () => {
        setLoadText("Redirecting to Remediation Dashboard.Please wait ...");
        setLoading(true);

        setTimeout(() => {
            navigate("/remediation/dashboard");
        }, 1000);

    };

    const handleNo = () => {
        setLoadText("Redirecting to Audit Registration...");
        setLoading(true);

        setTimeout(() => {
            navigate("/user/register");
        }, 1000);
    };
    if (loading) {
        return (
            <Loader
                text={loadText}
                delay={4}
                fullScreen
            />
        );
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#1e293b]">

            <div className="bg-[#0f172a]/80 border border-gray-700 backdrop-blur-lg p-8 rounded-2xl shadow-lg text-center w-full max-w-lg">

                <h1 className="text-2xl font-bold text-white mb-4">
                    Audit Status Check
                </h1>

                <p className="text-gray-400 mb-6">
                    Has the audit for your application been completed?
                </p>

                <div className="flex gap-4 justify-center">

                    <button
                        onClick={handleYes}
                        className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition"
                    >
                        Yes, Completed
                    </button>

                    <button
                        onClick={handleNo}
                        className="px-6 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
                    >
                        Not Yet
                    </button>

                </div>
            </div>
        </div>
    );
};

export default RemediationGate;