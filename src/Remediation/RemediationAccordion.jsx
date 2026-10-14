import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import RemediationRow from "./RemediationRow";

const RemediationAccordion = ({ title, data }) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="border border-gray-700 rounded-xl mb-5 bg-[#1e293b] overflow-hidden">

            {/* Header */}
            <div
                onClick={() => setOpen(!open)}
                className="flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-[#0f172a]/50 transition"
            >
                <h2 className="text-white font-semibold">{title}</h2>

                <FiChevronDown
                    className={`transition-transform duration-300 ${open ? "rotate-180" : ""
                        }`}
                />
            </div>

            {/* Content */}
            <div
                className={`transition-all duration-300 overflow-hidden ${open ? "max-h-125" : "max-h-0"
                    }`}
            >
                {data.length === 0 ? (
                    <p className="px-5 py-4 text-gray-500 text-sm">
                        No records found
                    </p>
                ) : (
                    data.map((item, index) => (
                        <RemediationRow key={item.id} item={item} index={index} />
                    ))
                )}
            </div>

        </div>
    );
};

export default RemediationAccordion;