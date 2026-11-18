
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  User,
  FileText,
  X,
  AlertCircle,
  Eye,
  ArrowLeft,
  Layers,
  Hash,
  Activity,
} from "lucide-react";

import { fetchWithAuth } from "../utilities/fetchWithAuth";
import { useNavigate } from "react-router-dom";
const ASSIGNED_PROGRESS_ENDPOINT = "/api/audits/assigned-progress/";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const normalizeStatus = (status) =>
  String(status || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "assigned") return "Assigned";
  if (normalized === "in_progress") return "In Progress";

  return status || "Unknown";
};

const getStatusStyle = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === "assigned") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized === "in_progress") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
};

// --------------------------------------------------
// Audit Details Modal
// --------------------------------------------------

const AuditDetailsModal = ({ audit, onClose }) => {
  if (!audit) return null;

  const details = [
    {
      label: "Application Name",
      value: audit.application_name,
      icon: FileText,
    },
    {
      label: "Application ID",
      value: audit.application_id,
      icon: Hash,
    },
    {
      label: "Public Audit ID",
      value: audit.public_audit_id,
      icon: ClipboardList,
    },
    {
      label: "Auditor Name",
      value: audit.auditor_name,
      icon: User,
    },
    {
      label: "Auditor ID",
      value: audit.auditor_id,
      icon: Hash,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#075EB5]">
              <ClipboardList size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#14213D]">
                Audit Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Assigned audit information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#075EB5]">
              Application
            </p>

            <h3 className="mt-1 text-lg font-semibold text-[#14213D]">
              {audit.application_name || "Unnamed Application"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {audit.public_audit_id || "Audit ID not generated"}
            </p>

            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  audit.audit_status
                )}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {getStatusLabel(audit.audit_status)}
              </span>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Layers size={17} className="text-[#075EB5]" />

            <h4 className="text-sm font-semibold text-[#14213D]">
              Audit Information
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {details.map((detail) => {
              const Icon = detail.icon;

              return (
                <div key={detail.label}>
                  <p className="mb-1.5 text-xs font-medium text-slate-500">
                    {detail.label}
                  </p>

                  <div className="flex items-center gap-2 break-all text-sm font-medium text-slate-800">
                    <Icon
                      size={15}
                      className="shrink-0 text-slate-400"
                    />

                    {detail.value ?? "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-[#075EB5] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#064D94]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// Summary Card
// --------------------------------------------------

const SummaryCard = ({
  title,
  count,
  description,
  icon: Icon,
  color,
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-3xl font-bold tabular-nums text-[#14213D]">
          {count}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${color}`}
      >
        <Icon size={23} />
      </div>
    </div>
  </div>
);

// --------------------------------------------------
// Main In-Progress Audits Component
// --------------------------------------------------

const OnProgressAudits = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedAudit, setSelectedAudit] = useState(null);
  const navigate = useNavigate();
  // --------------------------------------------------
  // Fetch assigned and in-progress audits
  // --------------------------------------------------

  const fetchAudits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchWithAuth(
        ASSIGNED_PROGRESS_ENDPOINT,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch assigned audits.");
      }

      const result = await response.json();

      const auditList = Array.isArray(result)
        ? result
        : result.data || result.results || [];

      // Keep only assigned and in-progress audits.
      const filteredAudits = auditList.filter((audit) => {
        const status = normalizeStatus(audit.audit_status);

        return (
          status === "assigned" ||
          status === "in_progress"
        );
      });

      setAudits(filteredAudits);
    } catch (err) {
      console.error("Assigned audits error:", err);

      setError(
        err.message ||
        "Something went wrong while loading audits."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  // --------------------------------------------------
  // Counts
  // --------------------------------------------------

  const assignedCount = useMemo(
    () =>
      audits.filter(
        (audit) =>
          normalizeStatus(audit.audit_status) === "assigned"
      ).length,
    [audits]
  );

  const inProgressCount = useMemo(
    () =>
      audits.filter(
        (audit) =>
          normalizeStatus(audit.audit_status) === "in_progress"
      ).length,
    [audits]
  );

  // --------------------------------------------------
  // Search and filters
  // --------------------------------------------------

  const filteredAudits = useMemo(() => {
    let result = [...audits];

    if (activeFilter !== "all") {
      result = result.filter(
        (audit) =>
          normalizeStatus(audit.audit_status) === activeFilter
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((audit) => {
        const searchableFields = [
          audit.application_name,
          audit.public_audit_id,
          audit.application_id,
          audit.auditor_name,
          audit.auditor_id,
          audit.audit_status,
        ];

        return searchableFields.some(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [audits, search, activeFilter]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px]">

        {/* Page Heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#075EB5]">
              <ClipboardList size={16} />
              Auditee Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#14213D] sm:text-3xl">
              Assigned & In-Progress Audits
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track audits assigned to auditors and monitor their progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/devdashboard")}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#075EB5]"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <button
              onClick={fetchAudits}
              disabled={loading}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#075EB5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Total Audits"
            count={audits.length}
            description="Assigned and in-progress audits"
            icon={ClipboardList}
            color="border-blue-100 bg-blue-50 text-[#075EB5]"
          />

          <SummaryCard
            title="Assigned Audits"
            count={assignedCount}
            description="Auditor has been assigned"
            icon={User}
            color="border-amber-100 bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="In-Progress Audits"
            count={inProgressCount}
            description="Auditing work has started"
            icon={Activity}
            color="border-indigo-100 bg-indigo-50 text-indigo-600"
          />
        </div>

        {/* Audit Records */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#14213D]">
                  Audit Records
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredAudits.length} audit(s) found
                </p>
              </div>

              <div className="relative w-full sm:max-w-md">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search application, audit ID, auditor..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#075EB5] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "All Audits", value: "all" },
                { label: "Assigned", value: "assigned" },
                { label: "In Progress", value: "in_progress" },
              ].map((filter) => {
                const isActive = activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-semibold transition ${isActive
                        ? "border-[#075EB5] bg-[#075EB5] text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#075EB5]"
                      }`}
                  >
                    {filter.label}

                    {filter.value === "all" && (
                      <span className="ml-2 opacity-75">
                        {audits.length}
                      </span>
                    )}

                    {filter.value === "assigned" && (
                      <span className="ml-2 opacity-75">
                        {assignedCount}
                      </span>
                    )}

                    {filter.value === "in_progress" && (
                      <span className="ml-2 opacity-75">
                        {inProgressCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw
                size={28}
                className="animate-spin text-[#075EB5]"
              />

              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading audits...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle size={28} />
              </div>

              <p className="mt-3 font-semibold text-[#14213D]">
                Failed to load audits
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {error}
              </p>

              <button
                onClick={fetchAudits}
                className="mt-5 cursor-pointer rounded-lg bg-[#075EB5] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#064D94]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAudits.length === 0 && (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                {search || activeFilter !== "all" ? (
                  <Search
                    size={24}
                    className="text-slate-400"
                  />
                ) : (
                  <CheckCircle2
                    size={25}
                    className="text-emerald-500"
                  />
                )}
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#14213D]">
                {search || activeFilter !== "all"
                  ? "No matching audits"
                  : "No assigned or in-progress audits"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search || activeFilter !== "all"
                  ? "Try changing your search keywords or status filter."
                  : "There are currently no audits assigned or in progress."}
              </p>
            </div>
          )}

          {/* Audit Table */}
          {!loading && !error && filteredAudits.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#EAF3FF]">
                  <tr className="border-b border-blue-100">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                      Application
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                      Audit ID
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                      Assigned Auditor
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#173B70]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#173B70]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAudits.map((audit, index) => (
                    <tr
                      key={`${audit.public_audit_id || audit.application_id}-${index}`}
                      className="transition hover:bg-blue-50/60"
                    >
                      {/* Application */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#075EB5]">
                            <FileText size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#14213D]">
                              {audit.application_name || "Unnamed Application"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Application ID: {audit.application_id ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Audit ID */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-[#075EB5]">
                          {audit.public_audit_id || "Not generated"}
                        </span>
                      </td>

                      {/* Auditor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600">
                            <User size={15} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {audit.auditor_name || "Not assigned"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Auditor ID: {audit.auditor_id ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            audit.audit_status
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />

                          {getStatusLabel(audit.audit_status)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedAudit(audit)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-[#075EB5] transition hover:border-[#075EB5] hover:bg-[#075EB5] hover:text-white"
                        >
                          <Eye size={15} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Audit information is retrieved from the assigned progress service.
        </p>
      </div>

      {/* Audit Details Modal */}
      {selectedAudit && (
        <AuditDetailsModal
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
        />
      )}
    </div>
  );
};

export default OnProgressAudits;
