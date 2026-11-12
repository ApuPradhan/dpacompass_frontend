import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ClipboardList,
  Clock,
  CheckCircle2,
  User,
  FileText,
  X,
  AlertCircle,
  Eye,
  Layers,
  Hash,
  ArrowUpRight,
  Activity,
  ShieldCheck,
} from "lucide-react";

import { fetchWithAuth } from "../utilities/fetchWithAuth";

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
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }

  if (normalized === "in_progress") {
    return "border-indigo-500/30 bg-indigo-500/10 text-indigo-400";
  }

  return "border-gray-600 bg-gray-700/50 text-gray-300";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-700 bg-[#0f172a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <ClipboardList size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Audit Details
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Assigned audit information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">
              Application
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              {audit.application_name || "Unnamed Application"}
            </h3>

            <p className="mt-1 text-xs text-gray-400">
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

          <div className="mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
            <Layers size={17} className="text-indigo-400" />

            <h4 className="text-sm font-semibold text-white">
              Audit Information
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {details.map((detail) => {
              const Icon = detail.icon;

              return (
                <div key={detail.label}>
                  <p className="mb-1.5 text-xs font-medium text-gray-400">
                    {detail.label}
                  </p>

                  <div className="flex items-center gap-2 break-all text-sm font-medium text-gray-200">
                    <Icon
                      size={15}
                      className="shrink-0 text-gray-500"
                    />

                    {detail.value ?? "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-700 bg-[#111827] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
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
  <div className="rounded-xl border border-gray-700 bg-[#111827]/80 p-5 shadow-lg shadow-black/10">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400">
          {title}
        </p>

        <p className="mt-2 text-3xl font-bold text-white">
          {count}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${color}`}
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
    <div className="min-h-screen bg-linear-to-br from-[#0b1120] to-[#1e293b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-400">
              <ClipboardList size={16} />
              Auditee Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Assigned & In-Progress Audits
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Track audits assigned to auditors and monitor their progress.
            </p>
          </div>

          <button
            onClick={fetchAudits}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#111827] px-4 py-2.5 text-sm font-medium text-gray-300 shadow-sm transition hover:border-indigo-500 hover:bg-[#1f2937] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Audits"
            count={audits.length}
            description="Assigned and in-progress audits"
            icon={ClipboardList}
            color="border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
          />

          <SummaryCard
            title="Assigned Audits"
            count={assignedCount}
            description="Auditor has been assigned"
            icon={User}
            color="border-amber-500/20 bg-amber-500/10 text-amber-400"
          />

          <SummaryCard
            title="In-Progress Audits"
            count={inProgressCount}
            description="Auditing work has started"
            icon={Activity}
            color="border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
          />
        </div>

        {/* Audit Records */}
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-[#111827]/80 shadow-xl shadow-black/10">

          {/* Toolbar */}
          <div className="flex flex-col gap-4 border-b border-gray-700 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Audit Records
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {filteredAudits.length} audit(s) found
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search application, audit ID, auditor..."
                  className="w-full rounded-lg border border-gray-700 bg-[#1f2937] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                    className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-gray-700 bg-[#1f2937] text-gray-400 hover:border-gray-500 hover:text-white"
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
                className="animate-spin text-indigo-400"
              />

              <p className="mt-3 text-sm text-gray-400">
                Loading audits...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <AlertCircle
                size={32}
                className="text-red-400"
              />

              <p className="mt-3 font-semibold text-white">
                Failed to load audits
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {error}
              </p>

              <button
                onClick={fetchAudits}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAudits.length === 0 && (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-700 bg-[#1f2937]">
                {search || activeFilter !== "all" ? (
                  <Search
                    size={24}
                    className="text-gray-400"
                  />
                ) : (
                  <CheckCircle2
                    size={25}
                    className="text-emerald-400"
                  />
                )}
              </div>

              <h3 className="mt-4 text-base font-semibold text-white">
                {search || activeFilter !== "all"
                  ? "No matching audits"
                  : "No assigned or in-progress audits"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-400">
                {search || activeFilter !== "all"
                  ? "Try changing your search keywords or status filter."
                  : "There are currently no audits assigned or in progress."}
              </p>
            </div>
          )}

          {/* Audit Table */}
          {!loading && !error && filteredAudits.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left">
                <thead className="bg-[#0f172a]/90">
                  <tr className="border-b border-gray-700">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Application
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Audit ID
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Assigned Auditor
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-700">
                  {filteredAudits.map((audit, index) => (
                    <tr
                      key={`${audit.public_audit_id || audit.application_id}-${index}`}
                      className="transition hover:bg-[#2a3446]/60"
                    >
                      {/* Application */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <FileText size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white">
                              {audit.application_name || "Unnamed Application"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Application ID: {audit.application_id ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Audit ID */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-indigo-400">
                          {audit.public_audit_id || "Not generated"}
                        </span>
                      </td>

                      {/* Auditor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-gray-300">
                            <User size={15} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-200">
                              {audit.auditor_name || "Not assigned"}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
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
                          className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-sm font-semibold text-indigo-400 transition hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
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

        <p className="mt-4 text-xs text-gray-500">
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
