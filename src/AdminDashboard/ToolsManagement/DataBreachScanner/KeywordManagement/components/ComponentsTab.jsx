import { FiDatabase, FiGlobe, FiShield } from "react-icons/fi";

const COMPONENTS = [
    {
        key: "personal_data_discovery",
        label: "Personal Data Discovery",
        icon: FiDatabase,
    },
    {
        key: "crawler",
        label: "Crawler",
        icon: FiGlobe,
    },
    {
        key: "privacy_policy",
        label: "Privacy Policy",
        icon: FiShield,
    },
];

const ComponentTabs = ({ selected, onChange }) => {
    return (
        <div className="flex flex-wrap gap-3 mb-6">
            {COMPONENTS.map((item) => {
                const Icon = item.icon;
                const active = selected === item.key;

                return (
                    <button
                        key={item.key}
                        onClick={() => onChange(item.key)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-semibold transition ${
                            active
                                ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                        }`}
                    >
                        <Icon size={19} />
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
};

export default ComponentTabs;