import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { API_BASE_URL } from "../config";


const BULK_UPLOAD_URL = `${API_BASE_URL}/api/checklists/checklist/bulk-upload/`;

const REQUIRED_COLUMNS = [
  "domain",
  "clause",
  "description",
  "version",
  "status",
  "application_types",
  "evidence_name",
  "evidence_description",
  "collection_type",
  "data_provider",
  "field_type",
  "scanner_key",
  "severity",
  "is_required",
  "order",
  "guidance",
  "dpdp_reference",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const BulkUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);

  // Complete CSV data
  const [csvData, setCsvData] = useState([]);

  // Columns
  const [headers, setHeaders] = useState([]);

  // Rows currently shown in preview
  const [previewData, setPreviewData] = useState([]);

  // Total rows in CSV
  const [totalRows, setTotalRows] = useState(0);

  // Number of rows user wants to see
  const [rowsToView, setRowsToView] = useState(10);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);

  // ============================================================
  // VALIDATE FILE
  // ============================================================

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setError("Please select a CSV file.");
      return false;
    }

    const fileName = selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".csv")) {
      setError("Only CSV files are allowed.");
      return false;
    }

    if (selectedFile.size === 0) {
      setError("The selected CSV file is empty.");
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must not exceed 10 MB.");
      return false;
    }

    return true;
  };

  // ============================================================
  // VALIDATE CSV COLUMNS
  // ============================================================

  const validateColumns = (csvHeaders) => {
    const missingColumns = REQUIRED_COLUMNS.filter(
      (column) => !csvHeaders.includes(column)
    );

    if (missingColumns.length > 0) {
      setError(
        `Invalid CSV format. Missing columns: ${missingColumns.join(", ")}`
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // PROCESS CSV
  // ============================================================

  const processCSV = (selectedFile) => {
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        try {
          if (results.errors && results.errors.length > 0) {
            console.error("CSV parsing errors:", results.errors);

            setError(
              "The CSV contains formatting errors. Please check the file."
            );

            return;
          }

          const data = results.data || [];
          const csvHeaders = results.meta?.fields || [];

          if (data.length === 0) {
            setError("The CSV file does not contain any data.");
            return;
          }

          if (!validateColumns(csvHeaders)) {
            return;
          }

          // Store complete CSV data
          setCsvData(data);

          // Store headers
          setHeaders(csvHeaders);

          // Total number of rows
          setTotalRows(data.length);

          // Default preview = 10 rows
          // But never more than total rows
          const initialRows = Math.min(10, data.length);

          setRowsToView(initialRows);

          setPreviewData(data.slice(0, initialRows));

          setError("");
        } catch (err) {
          console.error("CSV processing error:", err);

          setError("Unable to process the CSV file.");

          setCsvData([]);
          setHeaders([]);
          setPreviewData([]);
          setTotalRows(0);
        }
      },

      error: (err) => {
        console.error("CSV parsing error:", err);

        setError("Failed to read the CSV file.");

        setCsvData([]);
        setHeaders([]);
        setPreviewData([]);
        setTotalRows(0);
      },
    });
  };

  // ============================================================
  // HANDLE FILE
  // ============================================================

  const handleFile = (selectedFile) => {
    setError("");
    setUploadStatus(null);

    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);

    processCSV(selectedFile);
  };

  // ============================================================
  // FILE INPUT
  // ============================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  // ============================================================
  // DRAG OVER
  // ============================================================

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  // ============================================================
  // DRAG LEAVE
  // ============================================================

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  // ============================================================
  // DROP
  // ============================================================

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  // ============================================================
  // CHANGE NUMBER OF ROWS TO VIEW
  // ============================================================

  const handleRowsToViewChange = (event) => {
    const value = event.target.value;

    // Allow empty input temporarily
    if (value === "") {
      setRowsToView("");
      setPreviewData([]);
      return;
    }

    let number = parseInt(value, 10);

    if (isNaN(number)) {
      return;
    }

    // Minimum = 1
    if (number < 1) {
      number = 1;
    }

    // Maximum = total rows
    if (number > totalRows) {
      number = totalRows;
    }

    setRowsToView(number);

    // Update preview
    setPreviewData(csvData.slice(0, number));
  };

  // ============================================================
  // REMOVE FILE
  // ============================================================

  const removeFile = () => {
    setFile(null);

    setCsvData([]);
    setHeaders([]);
    setPreviewData([]);

    setTotalRows(0);
    setRowsToView(10);

    setError("");
    setUploadStatus(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // UPLOAD CSV
  // ============================================================

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    if (!BASE_URL) {
      setError(
        "VITE_BASE_URL is not configured. Please check your .env file."
      );

      return;
    }

    setIsProcessing(true);
    setError("");
    setUploadStatus(null);

    try {
      const formData = new FormData();

      // Send the COMPLETE CSV file
      formData.append("file", file);

      const response = await fetch(BULK_UPLOAD_URL, {
        method: "POST",

        body: formData,

        headers: {
        },
      });

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
          result?.detail ||
          result?.error ||
          `Bulk upload failed with status ${response.status}.`
        );
      }

      setUploadStatus({
        type: "success",

        message:
          result?.message ||
          "Checklist file processed and uploaded successfully. Redirecting...",

        result,
      });
      // Navigate to checklist page after successful upload
      setTimeout(() => {
        navigate("/admin/viewChecklist");
      }, 1000);
    } catch (err) {
      console.error("Bulk upload error:", err);

      setUploadStatus({
        type: "error",

        message:
          err?.message ||
          "Something went wrong during the bulk upload.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#0f0b1a] p-6 text-white">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold">
            Bulk Upload
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Upload a CSV file to bulk create checklist items.
          </p>
        </div>

        {/* ======================================================
            UPLOAD CARD
        ======================================================= */}

        <div className="rounded-xl border border-white/10 bg-[#171225] p-6 shadow-xl">

          {/* ====================================================
              DROPZONE
          ===================================================== */}

          {!file && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                cursor-pointer rounded-xl
                border-2 border-dashed
                p-12 text-center
                transition-all

                ${isDragging
                  ? "border-violet-400 bg-violet-500/10"
                  : "border-white/10 hover:border-violet-500/50 hover:bg-white/[0.02]"
                }
              `}
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                <Upload className="h-8 w-8 text-violet-400" />
              </div>

              <h3 className="text-lg font-medium">
                Upload CSV File
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Drag and drop your CSV file here, or click to browse
              </p>

              <p className="mt-3 text-xs text-gray-500">
                Supported format: CSV
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 10 MB
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* ====================================================
              SELECTED FILE
          ===================================================== */}

          {file && (
            <div className="rounded-xl border border-white/10 bg-[#100c19] p-5">

              {/* FILE INFORMATION */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                    <FileText className="h-6 w-6 text-green-400" />
                  </div>

                  <div>
                    <p className="font-medium">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                      {" • "}
                      {totalRows} rows
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={isProcessing}
                  className="
                    rounded-lg p-2
                    text-gray-400
                    transition
                    hover:bg-red-500/10
                    hover:text-red-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* =================================================
                  CSV PREVIEW
              ================================================== */}

              {csvData.length > 0 && (
                <div className="mt-6">

                  {/* PREVIEW HEADER */}

                  <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                    <div>
                      <h3 className="text-sm font-medium">
                        CSV Preview
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Showing {previewData.length} of{" "}
                        {totalRows} rows
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <label
                        htmlFor="rowsToView"
                        className="whitespace-nowrap text-sm text-gray-400"
                      >
                        Rows to view
                      </label>

                      <input
                        id="rowsToView"
                        type="number"
                        min="1"
                        max={totalRows}
                        value={rowsToView}
                        onChange={handleRowsToViewChange}
                        className="
                          w-24
                          rounded-lg
                          border border-white/10
                          bg-[#100c19]
                          px-3 py-2
                          text-sm
                          text-white
                          outline-none
                          transition
                          focus:border-violet-500
                          focus:ring-1
                          focus:ring-violet-500
                        "
                      />

                      <span className="text-xs text-gray-500">
                        / {totalRows}
                      </span>

                      <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                        {headers.length} columns
                      </span>

                    </div>

                  </div>

                  {/* TABLE */}

                  {previewData.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-white/10">

                      <table className="w-full min-w-max text-left text-sm">

                        <thead className="bg-white/[0.03]">

                          <tr>

                            {headers.map((header) => (
                              <th
                                key={header}
                                className="
                                  whitespace-nowrap
                                  border-b border-white/10
                                  px-4 py-3
                                  font-medium
                                  text-gray-300
                                "
                              >
                                {header}
                              </th>
                            ))}

                          </tr>

                        </thead>

                        <tbody>

                          {previewData.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="
                                border-b border-white/5
                                last:border-0
                                hover:bg-white/[0.02]
                              "
                            >

                              {headers.map((header) => (
                                <td
                                  key={header}
                                  className="
                                    max-w-[300px]
                                    truncate
                                    px-4 py-3
                                    text-gray-400
                                  "
                                  title={row[header]}
                                >
                                  {row[header] || "-"}
                                </td>
                              ))}

                            </tr>
                          ))}

                        </tbody>

                      </table>

                    </div>
                  )}

                </div>
              )}

              {/* =================================================
                  UPLOAD BUTTON
              ================================================== */}

              <div className="mt-6 flex justify-end">

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={
                    isProcessing ||
                    !file ||
                    csvData.length === 0
                  }
                  className="
                    flex items-center gap-2
                    rounded-lg
                    bg-violet-600
                    px-5 py-2.5
                    text-sm font-medium
                    text-white
                    transition
                    hover:bg-violet-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Process & Upload
                    </>
                  )}

                </button>

              </div>

            </div>
          )}

          {/* =====================================================
              VALIDATION ERROR
          ====================================================== */}

          {error && (
            <div
              className="
                mt-5
                flex items-start gap-3
                rounded-lg
                border border-red-500/20
                bg-red-500/10
                p-4
              "
            >

              <AlertCircle
                className="
                  mt-0.5
                  h-5 w-5
                  shrink-0
                  text-red-400
                "
              />

              <div>

                <p className="text-sm font-medium text-red-300">
                  Upload Error
                </p>

                <p className="mt-1 text-sm text-red-400/80">
                  {error}
                </p>

              </div>

            </div>
          )}

          {/* =====================================================
              UPLOAD STATUS
          ====================================================== */}

          {uploadStatus && (
            <div
              className={`
                mt-5
                flex items-start gap-3
                rounded-lg
                border
                p-4

                ${uploadStatus.type === "success"
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
                }
              `}
            >

              {uploadStatus.type === "success" ? (
                <CheckCircle2
                  className="
                    mt-0.5
                    h-5 w-5
                    shrink-0
                    text-green-400
                  "
                />
              ) : (
                <AlertCircle
                  className="
                    mt-0.5
                    h-5 w-5
                    shrink-0
                    text-red-400
                  "
                />
              )}

              <div>

                <p
                  className={`
                    text-sm font-medium

                    ${uploadStatus.type === "success"
                      ? "text-green-300"
                      : "text-red-300"
                    }
                  `}
                >
                  {uploadStatus.type === "success"
                    ? "Upload Successful"
                    : "Upload Failed"}
                </p>

                <p
                  className={`
                    mt-1 text-sm

                    ${uploadStatus.type === "success"
                      ? "text-green-400/80"
                      : "text-red-400/80"
                    }
                  `}
                >
                  {uploadStatus.message}
                </p>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default BulkUpload;