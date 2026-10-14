export default function Textarea({ label, name, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-sm mb-1 text-gray-400">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-[#1f2937] border border-gray-600 focus:border-indigo-500 outline-none"
            />
        </div>
    );
}