import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePayment from "../hooks/usePayment";
import PaymentStatus from "./PaymentStatus";
import InvoiceCard from "./InvoiceCard";

export default function PaymentPage({
    amount = 499,
    title = "Payment",
    metadata = {},
}) {
    const { status, response, error, startPayment } = usePayment();
    const navigate = useNavigate();

    const [countdown, setCountdown] = useState(15);

    const handlePay = () => {
        startPayment({
            amount,
            title,
            metadata,
        });
    };

    // =========================
    // SUCCESS FLOW (FAKE BACKEND)
    // =========================
    useEffect(() => {
        if (status === "success" && response?.transactionId) {

            const paymentRecord = {
                transactionId: response.transactionId,
                amount,
                metadata,
                status: "success",
                createdAt: new Date().toISOString(),
            };

            // prevent duplicate entry
            const existingPayments =
                JSON.parse(localStorage.getItem("payments")) || [];

            const alreadyExists = existingPayments.find(
                (p) => p.transactionId === response.transactionId
            );

            if (!alreadyExists) {
                localStorage.setItem(
                    "payments",
                    JSON.stringify([...existingPayments, paymentRecord])
                );
            }

            // update application status locally
            const apps = JSON.parse(localStorage.getItem("applications")) || [];

            const updatedApps = apps.map((app) =>
                app.id === metadata?.applicationId
                    ? { ...app, status: "submitted" }
                    : app
            );

            localStorage.setItem("applications", JSON.stringify(updatedApps));
        }
    }, [status, response]);

    // =========================
    // COUNTDOWN + REDIRECT
    // =========================
    useEffect(() => {
        if (status === "success") {
            let timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate("/devdashboard");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [status]);

    // =========================
    // UI
    // =========================
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b1120] text-gray-200">
            <div className="w-full max-w-md bg-[#111827]/80 border border-gray-700 rounded-xl p-6 shadow-lg space-y-5">

                {/* Title */}
                <h2 className="text-xl font-semibold text-indigo-400">
                    {title}
                </h2>

                {/* Amount */}
                <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="text-lg font-semibold text-white">₹{amount}</p>
                </div>

                {/* Pay Button */}
                {status !== "success" && (
                    <button
                        onClick={handlePay}
                        disabled={status === "processing"}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg font-medium transition"
                    >
                        {status === "processing"
                            ? "Processing..."
                            : "Pay Now"}
                    </button>
                )}

                {/* Status */}
                <PaymentStatus
                    status={status}
                    response={response}
                    error={error}
                />

                {/* =========================
                    SUCCESS SECTION
                ========================= */}
                {status === "success" && (
                    <>
                        <InvoiceCard
                            response={response}
                            amount={amount}
                            metadata={metadata}
                            autoDownload={true}
                        />

                        <p className="text-xs text-gray-400 text-center mt-2">
                            Redirecting to dashboard in {countdown}s...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}