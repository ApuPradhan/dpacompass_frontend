import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

export default function ReqField({ field, index, updateField, removeField }) {
  
  const handleRemove = () => {
    removeField(index);
    toast.info("Field removed");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-700 rounded-xl p-4 mb-3 bg-[#0f172a]/70 backdrop-blur"
    >

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4">

        {/* Label */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Field Label
          </label>
          <input
            className={inputClass}
            placeholder="Enter label"
            value={field.label}
            onChange={(e) => updateField(index, "label", e.target.value)}
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Field Type
          </label>
          <select
            className={inputClass}
            value={field.type}
            onChange={(e) => updateField(index, "type", e.target.value)}
          >
            <option value="">Select Type</option>
            <option>text</option>
            <option>textarea</option>
            <option>select</option>
            <option>checkbox</option>
            <option>date</option>
            <option>number</option>
            <option>file</option>
          </select>
        </div>

        {/* Placeholder */}
        <div className="col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">
            Placeholder
          </label>
          <input
            className={inputClass}
            placeholder="Enter placeholder text"
            value={field.placeholder}
            onChange={(e) =>
              updateField(index, "placeholder", e.target.value)
            }
          />
        </div>

        {/* Required Toggle */}
        <div className="col-span-2 flex items-center justify-between bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-300">
            Required Field
          </span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                updateField(index, "required", e.target.checked)
              }
              className="sr-only peer"
            />

            {/* Toggle UI */}
            <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 transition"></div>
            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </div>

      </div>

      {/* REMOVE BUTTON */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleRemove}
          className="flex items-center gap-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 px-3 py-1 rounded transition"
        >
          <Trash2 size={16} />
          Remove
        </button>
      </div>

    </motion.div>
  );
}