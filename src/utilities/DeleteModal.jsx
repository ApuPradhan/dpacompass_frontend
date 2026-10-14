import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";

export default function DeleteModal({ open, onClose, onConfirm }) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* MODAL */}
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <div className="bg-[#0f172a] border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-lg">

                            {/* ICON */}
                            <div className="flex justify-center mb-3">
                                <FiAlertTriangle className="text-red-400" size={32} />
                            </div>

                            {/* TEXT */}
                            <h2 className="text-lg font-semibold text-center text-white">
                                Delete Checklist?
                            </h2>

                            <p className="text-gray-400 text-sm text-center mt-2">
                                This action is irreversible. The checklist will be permanently deleted.
                            </p>

                            {/* ACTIONS */}
                            <div className="flex justify-center gap-3 mt-6">

                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={onConfirm}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}