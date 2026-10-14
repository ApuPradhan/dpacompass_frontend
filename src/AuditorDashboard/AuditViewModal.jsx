import { useState } from "react";
import {
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiZap
} from "react-icons/fi";

const AuditViewModal = ({ audit, onClose }) => {
  const [openChecklist, setOpenChecklist] = useState(null);

  if (!audit) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-[#0f172a] w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-700 p-6 text-white">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-indigo-300">
            {audit.name}
          </h2>

          <button onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* APPLICATION INFO */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-400">Auditor</p>
            <p>{audit.auditor_name}</p>
          </div>

          <div>
            <p className="text-gray-400">Status</p>
            <p>{audit.status}</p>
          </div>

          <div>
            <p className="text-gray-400">URL</p>
            <p>{audit.url}</p>
          </div>
        </div>

        {/* 🔥 DOMAINS */}
        {audit.domains?.map((domain, dIndex) => (
          <div
            key={domain.domain_id}
            className="bg-[#020617] border border-gray-800 rounded-lg p-4 mb-5"
          >

            {/* DOMAIN HEADER */}
            <h3 className="text-indigo-300 font-semibold mb-3">
              {dIndex + 1}. {domain.domain_name}
            </h3>

            {/* CHECKLISTS */}
            {domain.checklists.map((chk, cIndex) => (
              <div key={chk.id} className="mb-3">

                {/* ACCORDION HEADER */}
                <div
                  onClick={() =>
                    setOpenChecklist(
                      openChecklist === chk.id ? null : chk.id
                    )
                  }
                  className="flex justify-between items-center cursor-pointer px-3 py-2 bg-[#0f172a] rounded-lg border border-gray-700 hover:bg-[#1e293b]"
                >
                  <div className="flex items-center gap-2">
                    {openChecklist === chk.id ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronRight />
                    )}

                    <div>
                      <p className="text-white">
                        {dIndex + 1}.{cIndex + 1} {chk.clause}
                      </p>
                      <p className="text-xs text-gray-400">
                        Version: {chk.version}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BODY */}
                {openChecklist === chk.id && (
                  <div className="mt-2 bg-[#020617] border border-gray-800 rounded-lg p-4 space-y-4">

                    {chk.evidence.map((ev, eIndex) => (
                      <div key={ev.mapping_id} className="space-y-1">

                        {/* LABEL */}
                        <div className="flex justify-between">
                          <span className="text-indigo-300 text-sm">
                            {dIndex + 1}.{cIndex + 1}.{eIndex + 1} {ev.name}
                          </span>

                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              ev.severity === "high"
                                ? "bg-red-500/20 text-red-400"
                                : ev.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {ev.severity}
                          </span>
                        </div>

                        {/* FIELD TYPES */}
                        {ev.field_type === "text" && (
                          <input className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-sm" />
                        )}

                        {ev.field_type === "textarea" && (
                          <textarea className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-sm" />
                        )}

                        {ev.field_type === "number" && (
                          <input type="number" className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-sm" />
                        )}

                        {ev.field_type === "boolean" && (
                          <div className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="text-gray-400 text-sm">
                              Yes / No
                            </span>
                          </div>
                        )}

                        {ev.field_type === "file" && (
                          <input type="file" className="text-sm" />
                        )}

                      </div>
                    ))}

                  </div>
                )}
              </div>
            ))}

          </div>
        ))}

      </div>
    </div>
  );
};

export default AuditViewModal;