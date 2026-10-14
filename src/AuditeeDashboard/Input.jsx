export default function Input({ label, name, value, onChange }) {
    return (
        <div>
            <label className="block text-sm mb-1 text-gray-400">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg bg-[#1f2937] border border-gray-600 focus:border-indigo-500 outline-none"
            />
        </div>
    );
}