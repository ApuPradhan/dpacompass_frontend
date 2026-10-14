
/* META CARD COMPONENT */
const MetaCard = ({ label, value, highlight, icon }) => {
    return (
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>

            <div className="flex items-center gap-2">
                {icon && <span className="text-gray-400">{icon}</span>}

                <p
                    className={`text-lg font-medium ${highlight ? "text-violet-400 capitalize" : "text-white"
                        }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
};

export default MetaCard;