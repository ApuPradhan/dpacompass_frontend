import { useState, useEffect } from "react";
import { inputClass, primaryBtn, secondaryBtn } from "../theme";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, isValid } from "date-fns";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AssignAuditorModal({ audit, onClose, onAssign }) {
    const [auditors, setAuditors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState("");
    const [deadline, setDeadline] = useState(null); // now Date object
    const [assigning, setAssigning] = useState(false);

    const navigate = useNavigate();

    const fetchAuditors = async () => {
        try {
            const token = localStorage.getItem("access");

            const res = await fetch(
                `${BASE_URL}/api/auth/admin/get/auditors`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                setAuditors(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditors();
    }, []);

    if (!audit) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-[#0f172a]/80 border border-gray-700 p-6 rounded-2xl w-96">

                    <h2 className="text-lg text-indigo-300 mb-4">
                        Assign Auditor
                    </h2>

                    {/* Auditor Select */}
                    <select
                        className={inputClass}
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        <option value="">Select Auditor</option>
                        {loading ? (
                            <option>Loading...</option>
                        ) : (
                            auditors.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.full_name} ({a.username})
                                </option>
                            ))
                        )}
                    </select>

                    {/* ✅ THEMED DATE PICKER */}
                    <div className="mt-3">
                        <DatePicker
                            selected={deadline}
                            onChange={(date) => setDeadline(date)}
                            onChangeRaw={(e) => {
                                if (!e || !e.target) return; // ✅ CRITICAL FIX

                                const value = e.target.value;

                                if (!value) return;

                                const parsedDate = parse(value, "dd-MM-yyyy", new Date());

                                if (isValid(parsedDate)) {
                                    setDeadline(parsedDate);
                                }
                            }}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="DD-MM-YYYY"
                            minDate={new Date()}
                            className={inputClass}
                            popperClassName="custom-datepicker"
                        />
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <button onClick={onClose} className={secondaryBtn}>
                            Cancel
                        </button>

                        <button
                            onClick={async () => {
                                if (!selected) {
                                    alert("Please select an auditor");
                                    return;
                                }

                                if (!deadline) {
                                    alert("Please select a deadline");
                                    return;
                                }

                                setAssigning(true);

                                await onAssign(
                                    audit.id,
                                    selected,
                                    deadline.toISOString().split("T")[0] // send only date
                                );

                                setAssigning(false);
                            }}
                            className={primaryBtn}
                        >
                            {assigning ? "Assigning..." : "Assign"}
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}