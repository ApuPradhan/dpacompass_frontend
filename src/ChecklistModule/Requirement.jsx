import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FileText, Layers } from "lucide-react";
import { toast } from "react-toastify";
import ReqField from "./ReqField";

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

export default function Requirement({ req, index, updateReq, removeReq }) {

  const addField = () => {
    updateReq(index, "fields", [
      ...req.fields,
      { label: "", type: "", placeholder: "", required: false },
    ]);
    toast.success("Field added");
  };

  const updateField = (i, key, value) => {
    const updated = [...req.fields];
    updated[i][key] = value;
    updateReq(index, "fields", updated);
  };

  const removeField = (i) => {
    const updated = req.fields.filter((_, idx) => idx !== i);
    updateReq(index, "fields", updated);
    toast.info("Field removed");
  };

  const handleRemoveRequirement = () => {
    removeReq(index);
    toast.error("Requirement removed");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-gray-700 p-5 rounded-2xl mb-4 bg-[#0f172a]/70 backdrop-blur"
    >

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2 text-white">
          <FileText size={18} className="text-indigo-400" />
          Requirement {index + 1}
        </h3>

        <button
          onClick={handleRemoveRequirement}
          className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-2 gap-4">

        {/* Title */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Title
          </label>
          <input
            className={inputClass}
            placeholder="Enter requirement title"
            value={req.title}
            onChange={(e) => updateReq(index, "title", e.target.value)}
          />
        </div>

        {/* Severity */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Severity
          </label>
          <select
            className={inputClass}
            value={req.severity}
            onChange={(e) => updateReq(index, "severity", e.target.value)}
          >
            <option value="">Select Severity</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">
            Description
          </label>
          <textarea
            className={inputClass}
            placeholder="Enter description"
            value={req.description}
            onChange={(e) =>
              updateReq(index, "description", e.target.value)
            }
          />
        </div>
        {/* Recommendation */}
        <div className="col-span-2">
          <label className="text-xs text-gray-400 mb-1 block">
            Recommendation
          </label>
          <textarea
            className={inputClass}
            placeholder="Enter Recommendation"
            value={req.recommendation || ""}
            onChange={(e) => updateReq(index, "recommendation", e.target.value)}
          />
        </div>

        {/* Validation */}
        <div className="col-span-2 flex gap-6 mt-2">

          {/* Manual */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={req.validation.includes("Manual")}
              onChange={(e) => {
                const val = e.target.checked
                  ? [...req.validation, "Manual"]
                  : req.validation.filter((v) => v !== "Manual");
                updateReq(index, "validation", val);
              }}
              className="accent-indigo-600"
            />
            Manual
          </label>

          {/* Automated */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={req.validation.includes("Automated")}
              onChange={(e) => {
                const val = e.target.checked
                  ? [...req.validation, "Automated"]
                  : req.validation.filter((v) => v !== "Automated");
                updateReq(index, "validation", val);
              }}
              className="accent-indigo-600"
            />
            Automated
          </label>

        </div>
      </div>

      {/* FIELDS SECTION */}
      <div className="mt-5">

        <h4 className="font-medium flex items-center gap-2 mb-3 text-gray-200">
          <Layers size={16} className="text-purple-400" />
          Fields
        </h4>

        <AnimatePresence>
          {req.fields.map((field, i) => (
            <ReqField
              key={i}
              field={field}
              index={i}
              updateField={updateField}
              removeField={removeField}
            />
          ))}
        </AnimatePresence>

        {/* Add Field Button */}
        <button
          onClick={addField}
          className="mt-3 bg-linear-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] transition px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
        >
          <Plus size={16} />
          Add Field
        </button>

      </div>
    </motion.div>
  );
}