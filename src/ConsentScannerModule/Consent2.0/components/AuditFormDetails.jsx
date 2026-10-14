import React from "react";
import { FileText, Database } from "lucide-react";
import StatusBadge from "./StatusBadge";

const AuditFormDetails = ({ collectionPoints = [] }) => {
  if (!collectionPoints.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {collectionPoints.map((point, index) => {
        const collectionPoint = point.collection_point;
        const field = collectionPoint?.field;
        const form = collectionPoint?.form;
        const personalData = collectionPoint?.personal_data;

        return (
          <div
            key={point.index ?? index}
            className="rounded-lg border border-slate-800 bg-slate-950/30 overflow-hidden"
          >
            {/* Collection Point Header */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                  <FileText className="h-4 w-4 text-indigo-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    {field?.label ||
                      field?.name ||
                      `Collection Point ${index + 1}`}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatLabel(
                      collectionPoint?.category ||
                        "personal data"
                    )}
                  </p>
                </div>
              </div>

              {point.status && (
                <StatusBadge
                  status={point.status}
                  size="sm"
                />
              )}
            </div>

            {/* Field Details */}
            <div className="p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Field Name"
                  value={field?.name}
                />

                <DetailItem
                  label="Field Type"
                  value={field?.type}
                />

                <DetailItem
                  label="Form"
                  value={form?.id}
                />

                <DetailItem
                  label="Page"
                  value={point.page?.title}
                />

                {personalData?.confidence !== undefined && (
                  <DetailItem
                    label="Detection Confidence"
                    value={`${Math.round(
                      personalData.confidence * 100
                    )}%`}
                  />
                )}

                {personalData?.category && (
                  <DetailItem
                    label="Data Category"
                    value={formatLabel(
                      personalData.category
                    )}
                  />
                )}
              </div>

              {/* Field Properties */}
              {(field?.required !== undefined ||
                field?.placeholder ||
                field?.autocomplete) && (
                <div className="mt-4 border-t border-slate-800 pt-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Field Properties
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {field.required !== undefined && (
                      <PropertyTag
                        label="Required"
                        value={
                          field.required ? "Yes" : "No"
                        }
                      />
                    )}

                    {field.autocomplete && (
                      <PropertyTag
                        label="Autocomplete"
                        value={field.autocomplete}
                      />
                    )}

                    {field.placeholder && (
                      <PropertyTag
                        label="Placeholder"
                        value={field.placeholder}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================
   DETAIL ITEM
========================================================= */

const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-slate-300">
        {value || "—"}
      </p>
    </div>
  );
};

/* =========================================================
   PROPERTY TAG
========================================================= */

const PropertyTag = ({ label, value }) => {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-2.5 py-1.5">
      <span className="text-[10px] text-slate-500">
        {label}:
      </span>

      <span className="text-[10px] text-slate-300">
        {value}
      </span>
    </div>
  );
};

/* =========================================================
   HELPER
========================================================= */

const formatLabel = (value) => {
  if (!value) return "";

  return value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default AuditFormDetails;