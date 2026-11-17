
import { useEffect, useState } from "react";
import {
    FiLoader,
    FiEdit,
    FiX,
    FiLayers,
    FiFileText,
    FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";

const EditDomain = ({ domain, onClose, onSuccess }) => {

    const [form, setForm] = useState({
        name: "",
        description: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(false);

    // --------------------------------------------------
    // LOCAL STYLES
    // --------------------------------------------------

    const styles = {
        card: "w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",

        header:
            "flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8",

        heading: "text-xl font-bold text-[#14213D]",

        subtitle: "mt-1 text-sm text-slate-500",

        closeButton:
            "rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer",

        body: "space-y-6 p-6 sm:p-8",

        label: "mb-2 block text-sm font-semibold text-slate-700",

        input:
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

        textarea:
            "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

        footer:
            "flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8",

        cancelButton:
            "rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer",

        submitButton:
            "inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#064D94] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
    };

    // --------------------------------------------------
    // INITIALIZE FORM
    // --------------------------------------------------

    useEffect(() => {
        if (domain) {
            setForm({
                name: domain.name || "",
                description: domain.description || "",
                is_active: domain.is_active ?? true,
            });
        }
    }, [domain]);

    // --------------------------------------------------
    // CLOSE HANDLER
    // --------------------------------------------------

    const handleClose = () => {
        if (!loading && typeof onClose === "function") {
            onClose();
        }
    };

    // --------------------------------------------------
    // FORM HANDLING
    // --------------------------------------------------

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // --------------------------------------------------
    // UPDATE DOMAIN
    // --------------------------------------------------

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error("Domain name is required.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetchWithAuth(
                `/api/checklists/domains/${domain.id}/`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...domain,
                        ...form,
                        name: form.name.trim(),
                        description: form.description.trim(),
                    }),
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.detail ||
                    "Failed to update domain."
                );
            }

            toast.success("Domain updated successfully.");

            if (typeof onSuccess === "function") {
                await onSuccess();
            }

            onClose();

        } catch (error) {
            console.error("Error updating domain:", error);
            toast.error(error.message || "Unable to update domain.");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    if (!domain) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !loading
                ) {
                    handleClose();
                }
            }}
        >

            <div className={styles.card}>

                {/* HEADER */}

                <div className={styles.header}>

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#075EB5]">
                            <FiEdit size={23} />
                        </div>

                        <div>
                            <h2 className={styles.heading}>
                                Edit Domain
                            </h2>

                            <p className={styles.subtitle}>
                                Update domain information and configuration
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className={styles.closeButton}
                        aria-label="Close"
                    >
                        <FiX size={21} />
                    </button>

                </div>

                {/* FORM */}

                <form onSubmit={handleUpdate}>

                    <div className={styles.body}>

                        {/* DOMAIN NAME */}

                        <div>
                            <label className={styles.label}>
                                Domain Name
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <FiLayers
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter domain name"
                                    className={`${styles.input} pl-11`}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div>
                            <label className={styles.label}>
                                Description
                            </label>

                            <div className="relative">
                                <FiFileText
                                    className="absolute left-4 top-4 text-slate-400"
                                    size={18}
                                />

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Enter domain description..."
                                    rows={4}
                                    className={`${styles.textarea} pl-11`}
                                    disabled={loading}
                                />
                            </div>

                            <p className="mt-2 text-xs text-slate-400">
                                Provide a brief explanation of the compliance area covered by this domain.
                            </p>
                        </div>

                        {/* ACTIVE STATUS */}

                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="flex items-center gap-3">

                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    form.is_active
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-amber-50 text-amber-600"
                                }`}>
                                    <FiCheckCircle size={20} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Active Domain
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {form.is_active
                                            ? "This domain is available for use."
                                            : "This domain is currently inactive."}
                                    </p>
                                </div>

                            </div>

                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="peer sr-only"
                                />

                                <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus:ring-4 peer-focus:ring-emerald-100 after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
                            </label>

                        </div>

                    </div>

                    {/* FOOTER */}

                    <div className={styles.footer}>

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !form.name.trim()}
                            className={styles.submitButton}
                        >
                            {loading ? (
                                <>
                                    <FiLoader
                                        className="animate-spin"
                                        size={17}
                                    />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiEdit size={17} />
                                    Update Domain
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default EditDomain;
