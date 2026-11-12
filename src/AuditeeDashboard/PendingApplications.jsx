
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  X,
  Globe,
  Database,
  CalendarDays,
  Clock,
  FileText,
  Building2,
  User,
  Lock,
  Server,
  Layers,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  EyeOff,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

import { fetchWithAuth } from "../utilities/fetchWithAuth";

const PENDING_APPLICATIONS_ENDPOINT =
  "/api/applications/applications/pending/";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

const getStatusStyle = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "pending") {
    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }

  if (normalized === "approved") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  }

  if (normalized === "rejected") {
    return "bg-red-500/10 text-red-400 border-red-500/30";
  }

  return "bg-gray-700/50 text-gray-300 border-gray-600";
};

const getTypeIcon = (typeName) => {
  const type = String(typeName || "").toLowerCase();

  if (type.includes("database")) return Database;

  return Globe;
};

const getValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getCredentials = (application) => {
  const username =
    application.username ??
    application.db_username ??
    application.database_username ??
    application.credentials?.username ??
    application.credentials?.db_username;

  const password =
    application.password ??
    application.db_password ??
    application.database_password ??
    application.credentials?.password ??
    application.credentials?.db_password;

  return { username, password };
};

// --------------------------------------------------
// Reusable detail item
// --------------------------------------------------

const DetailItem = ({
  icon: Icon,
  label,
  value,
  fullWidth = false,
}) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <p className="mb-1.5 text-xs font-medium text-gray-400">
      {label}
    </p>

    <div className="flex items-start gap-2 break-words text-sm text-gray-200">
      {Icon && (
        <Icon
          size={15}
          className="mt-0.5 shrink-0 text-gray-500"
        />
      )}

      <span className="font-medium">
        {getValue(value)}
      </span>
    </div>
  </div>
);

// --------------------------------------------------
// Application details modal
// --------------------------------------------------

const ApplicationDetailsModal = ({
  application,
  onClose,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!application) return null;

  const credentials = getCredentials(application);

  const hasCredentials =
    credentials.username !== undefined ||
    credentials.password !== undefined;

  const TypeIcon = getTypeIcon(application.type_name);

  const detailSections = [
    {
      title: "Application Information",
      icon: Layers,
      items: [
        {
          label: "Application Name",
          value: application.name,
          icon: FileText,
        },
        {
          label: "Application Type",
          value: application.type_name,
          icon: TypeIcon,
        },
        {
          label: "Environment",
          value: application.environment,
          icon: Server,
        },
        {
          label: "Version",
          value: application.version,
          icon: Layers,
        },
        {
          label: "Department",
          value: application.department,
          icon: Building2,
        },
        {
          label: "Application URL",
          value: application.url,
          icon: Globe,
          fullWidth: true,
        },
        {
          label: "Description",
          value: application.description,
          icon: FileText,
          fullWidth: true,
        },
        {
          label: "Data Categories",
          value: application.data_categories,
          icon: ShieldCheck,
          fullWidth: true,
        },
        {
          label: "Remarks",
          value: application.remarks,
          icon: ClipboardList,
          fullWidth: true,
        },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-700 bg-[#0f172a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-700 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <FileText size={21} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Application Details
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Complete information submitted for this application
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto px-6 py-5">

          {/* Application Summary */}
          <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">
                  Application
                </p>

                <h3 className="mt-1 text-lg font-semibold text-white">
                  {application.name || "Unnamed Application"}
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Application ID: {application.id}
                </p>
              </div>

              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                  application.status
                )}`}
              >
                {application.status || "Unknown"}
              </span>
            </div>
          </div>

          {/* Application Information */}
          {detailSections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <div key={section.title} className="mb-6">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
                  <SectionIcon
                    size={17}
                    className="text-indigo-400"
                  />

                  <h4 className="text-sm font-semibold text-white">
                    {section.title}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <DetailItem
                      key={item.label}
                      {...item}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Credentials */}
          {hasCredentials && (
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
                <Lock
                  size={17}
                  className="text-indigo-400"
                />

                <h4 className="text-sm font-semibold text-white">
                  Access Credentials
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:grid-cols-2">

                {credentials.username !== undefined && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-gray-400">
                      Username
                    </p>

                    <div className="flex items-center gap-2 break-all text-sm font-medium text-gray-200">
                      <User
                        size={15}
                        className="shrink-0 text-gray-500"
                      />

                      {getValue(credentials.username)}
                    </div>
                  </div>
                )}

                {credentials.password !== undefined && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-gray-400">
                      Password
                    </p>

                    <div className="flex items-center gap-2">
                      <Lock
                        size={15}
                        className="shrink-0 text-gray-500"
                      />

                      <span className="break-all text-sm font-medium text-gray-200">
                        {showPassword
                          ? getValue(credentials.password)
                          : "••••••••••••"}
                      </span>

                      <button
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className="ml-auto rounded-md p-1.5 text-gray-400 transition hover:bg-gray-700 hover:text-white"
                        title={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-2 text-xs text-amber-400/80">
                Handle these credentials securely.
              </p>
            </div>
          )}

          {/* Submission Information */}
          <div className="mb-2">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
              <Clock
                size={17}
                className="text-indigo-400"
              />

              <h4 className="text-sm font-semibold text-white">
                Submission Information
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem
                icon={CalendarDays}
                label="Submitted On"
                value={formatDateTime(application.created_at)}
              />

              <DetailItem
                icon={User}
                label="Owner ID"
                value={application.owner}
              />

              <DetailItem
                icon={User}
                label="Assigned Auditor ID"
                value={application.auditor}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
// Main Pending Applications Component
// --------------------------------------------------

const PendingApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState(null);

  // Fetch pending applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchWithAuth(
        PENDING_APPLICATIONS_ENDPOINT,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to fetch pending applications."
        );
      }

      const data = await response.json();

      // Supports direct array and paginated API responses.
      const applicationList = Array.isArray(data)
        ? data
        : data.results || data.data || [];

      setApplications(applicationList);
    } catch (err) {
      console.error("Pending applications error:", err);

      setError(
        err.message ||
          "Something went wrong while loading applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Search filtering
  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter((application) => {
      return [
        application.name,
        application.type_name,
        application.url,
        application.environment,
        application.status,
        application.description,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [applications, search]);

  // Unique application types
  const applicationTypeCount = useMemo(() => {
    return new Set(
      applications
        .map((app) => app.type_name)
        .filter(Boolean)
    ).size;
  }, [applications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] to-[#1e293b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Heading */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-400">
              <ClipboardList size={16} />
              Auditee Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Pending Applications
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              View and track applications submitted for audit.
            </p>
          </div>

          <button
            onClick={fetchApplications}
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
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Pending Count */}
          <div className="rounded-xl border border-gray-700 bg-[#111827]/80 p-5 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Total Pending Applications
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {applications.length}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Applications awaiting further processing
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <Clock size={23} />
              </div>
            </div>
          </div>

          {/* Application Types */}
          <div className="rounded-xl border border-gray-700 bg-[#111827]/80 p-5 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Application Types
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {applicationTypeCount}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Different application categories
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                <Layers size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* Application Records */}
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-[#111827]/80 shadow-xl shadow-black/10">

          {/* Table Toolbar */}
          <div className="flex flex-col gap-4 border-b border-gray-700 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Application Records
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {filteredApplications.length} application(s) found
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
                placeholder="Search applications..."
                className="w-full rounded-lg border border-gray-700 bg-[#1f2937] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
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
                Loading applications...
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
                Failed to load applications
              </p>

              <p className="mt-1 text-sm text-gray-400">
                {error}
              </p>

              <button
                onClick={fetchApplications}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            filteredApplications.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-700 bg-[#1f2937]">
                  {search ? (
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
                  {search
                    ? "No matching applications"
                    : "No pending applications"}
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-400">
                  {search
                    ? "Try changing your search keywords."
                    : "You currently have no applications awaiting processing."}
                </p>
              </div>
            )}

          {/* Applications Table */}
          {!loading &&
            !error &&
            filteredApplications.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">

                  <thead className="bg-[#0f172a]/90">
                    <tr className="border-b border-gray-700">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Application
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Type
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Application URL
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Submission Date
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
                    {filteredApplications.map((application) => {
                      const TypeIcon = getTypeIcon(
                        application.type_name
                      );

                      return (
                        <tr
                          key={application.id}
                          className="transition hover:bg-[#2a3446]/60"
                        >
                          {/* Application Name */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                                <TypeIcon size={19} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {application.name ||
                                    "Unnamed Application"}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  ID: {application.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Application Type */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-300">
                              {application.type_name || "—"}
                            </span>
                          </td>

                          {/* Application URL */}
                          <td className="px-5 py-4">
                            {application.url ? (
                              <a
                                href={application.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-[190px] items-center gap-1.5 truncate text-sm text-indigo-400 transition hover:text-indigo-300 hover:underline"
                                title={application.url}
                              >
                                <span className="truncate">
                                  {application.url}
                                </span>

                                <ExternalLink
                                  size={13}
                                  className="shrink-0"
                                />
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500">
                                —
                              </span>
                            )}
                          </td>

                          {/* Submission Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <CalendarDays
                                size={15}
                                className="text-gray-500"
                              />

                              {formatDate(application.created_at)}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                                application.status
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {application.status || "Unknown"}
                            </span>
                          </td>

                          {/* View Details */}
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-sm font-semibold text-indigo-400 transition hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
                            >
                              <Eye size={15} />
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Application information is retrieved from the pending
          applications service.
        </p>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default PendingApplications;
