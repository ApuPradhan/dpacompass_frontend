import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

const getColor = (status) => {
  if (status === "COMPLIANT") return "text-green-400";
  if (status === "PARTIAL") return "text-yellow-400";
  if (status === "NON_COMPLIANT") return "text-red-400";
  return "text-gray-400";
};

const PageCard = ({ page }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-xl bg-[#111827] overflow-hidden">

      {/* HEADER */}
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#1e293b]"
      >
        <div>
          <p className="text-indigo-300 text-sm font-medium break-all">
            🔗 {page.url}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Fields: {page.summary.total_fields}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${getColor(page.status)}`}>
            {page.status}
          </span>

          {open ? <FiChevronDown /> : <FiChevronRight />}
        </div>
      </div>

      {/* BODY */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 border-t border-gray-700 space-y-4">

          {/* SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Total</p>
              <p className="text-white">{page.summary.total_fields}</p>
            </div>
            <div>
              <p className="text-green-400">Compliant</p>
              <p>{page.summary.compliant}</p>
            </div>
            <div>
              <p className="text-yellow-400">Partial</p>
              <p>{page.summary.partial}</p>
            </div>
            <div>
              <p className="text-red-400">Non-Compliant</p>
              <p>{page.summary.non_compliant}</p>
            </div>
          </div>

          {/* FIELDS */}
          <div className="space-y-2">
            {page.fields.map((f, i) => (
              <div
                key={i}
                className="bg-[#0b1120] border border-gray-700 rounded p-3 flex justify-between items-center"
              >
                <p className="text-sm text-violet-300">
                  {f.field_name}
                </p>

                <div className="flex items-center gap-4 text-xs">

                  <span className={getColor(f.status)}>
                    {f.status}
                  </span>

                  <span className="text-gray-400">
                    Implicit Consent Present: {f.consent?.implicit ? "Yes" : "No"}
                  </span>

                  <span className="text-gray-400">
                    Explicit Consent Present: {f.consent?.explicit ? "Yes" : "No"}
                  </span>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PageCard;