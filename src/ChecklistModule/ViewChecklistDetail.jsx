import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit,
  FiCalendar,
  FiLayers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import MetaCard from "./MetaCard";
import { fetchWithAuth } from "../utilities/fetchWithAuth";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


export default function ViewChecklistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChecklist = async () => {
    try {
      const res = await fetchWithAuth(
        `/api/checklists/checklists/${id}/`,
        {
          method: "GET",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setChecklist(data.data);
      } else {
        toast.error("Failed to fetch checklist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="text-center text-red-400 mt-10">
        Checklist not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-200 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {checklist.clause}
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            {checklist.description}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
          >
            <FiArrowLeft size={16} /> Back
          </button>

          <button
            onClick={() => navigate(`/admin/editChecklist/${id}`)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            <FiEdit size={16} /> Edit
          </button>
        </div>
      </div>

      {/* META */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <MetaCard label="Version" value={checklist.version} />

        <MetaCard
          label="Status"
          value={checklist.status}
          highlight
        />

        <MetaCard
          label="Created"
          value={new Date(checklist.created_at).toLocaleDateString()}
          icon={<FiCalendar />}
        />

        <div className="bg-[#111827] border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">Application Types</p>
          <div className="flex flex-wrap gap-2">
            {checklist.application_types.map((t) => (
              <span
                key={t.id}
                className="px-3 py-1 text-xs rounded-full bg-violet-600/20 text-violet-400"
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* REQUIREMENTS */}
      <div className="space-y-6">

        <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
          <FiLayers /> Requirements
        </h2>

        {checklist.requirements.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No requirements available
          </p>
        ) : (
          checklist.requirements.map((req) => (
            <div
              key={req.id}
              className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:shadow-md transition"
            >

              {/* HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {req.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {req.description}
                  </p>
                </div>

                <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-400 capitalize">
                  {req.severity}
                </span>
              </div>

              {/* VALIDATION */}
              <p className="text-sm text-violet-400 mb-4 capitalize">
                {req.validation_type} validation
              </p>

              {/* FIELDS */}
              {Array.isArray(req.fields) && req.fields.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {req.fields.map((field) => (
                    <div
                      key={field.id}
                      className="bg-[#0f172a] border border-gray-700 rounded-lg p-4"
                    >
                      <p className="text-sm font-medium text-white mb-2">
                        {field.label}
                      </p>

                      <div className="text-xs text-gray-400 space-y-1">
                        <p>
                          Type:{" "}
                          <span className="text-gray-200">
                            {field.field_type}
                          </span>
                        </p>

                        <p>
                          Required:{" "}
                          <span
                            className={
                              field.is_required
                                ? "text-red-400"
                                : "text-gray-400"
                            }
                          >
                            {field.is_required ? "Yes" : "No"}
                          </span>
                        </p>

                        {field.placeholder && (
                          <p>
                            Placeholder:{" "}
                            <span className="text-gray-200">
                              {field.placeholder}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              )}

            </div>
          ))
        )}

      </div>
    </div>
  );
}
