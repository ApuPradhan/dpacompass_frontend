
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
    ArrowLeft,
    FileSpreadsheet,
    RefreshCw,
    Database,
    Eye,
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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const BulkUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [csvData, setCsvData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [rowsToView, setRowsToView] = useState(10);

    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [error, setError] = useState("");
    const [uploadStatus, setUploadStatus] = useState(null);

    // ================= FILE VALIDATION =================

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

    // ================= CSV COLUMN VALIDATION =================

    const validateColumns = (csvHeaders) => {
        const normalizedHeaders = csvHeaders.map((header) =>
            header.trim()
        );

        const missingColumns = REQUIRED_COLUMNS.filter(
            (column) => !normalizedHeaders.includes(column)
        );

        if (missingColumns.length > 0) {
            setError(
                `Invalid CSV format. Missing columns: ${missingColumns.join(", ")}`
            );

            return false;
        }

        return true;
    };

    // ================= PROCESS CSV =================

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

                    setCsvData(data);
                    setHeaders(csvHeaders);
                    setTotalRows(data.length);

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

    // ================= HANDLE FILE =================

    const handleFile = (selectedFile) => {
        setError("");
        setUploadStatus(null);

        if (!validateFile(selectedFile)) {
            return;
        }

        setFile(selectedFile);
        processCSV(selectedFile);
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    // ================= DRAG AND DROP =================

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);

        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) {
            handleFile(droppedFile);
        }
    };

    // ================= CHANGE PREVIEW ROW COUNT =================

    const handleRowsToViewChange = (event) => {
        const value = event.target.value;

        if (value === "") {
            setRowsToView("");
            setPreviewData([]);
            return;
        }

        let number = parseInt(value, 10);

        if (isNaN(number)) {
            return;
        }

        if (number < 1) {
            number = 1;
        }

        if (number > totalRows) {
            number = totalRows;
        }

        setRowsToView(number);
        setPreviewData(csvData.slice(0, number));
    };

    // ================= REMOVE FILE =================

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

    // ================= UPLOAD CSV =================

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a CSV file first.");
            return;
        }

        if (!API_BASE_URL) {
            setError(
                "API_BASE_URL is not configured. Please check your environment configuration."
            );

            return;
        }

        setIsProcessing(true);
        setError("");
        setUploadStatus(null);

        try {
            const formData = new FormData();

            // Send the complete CSV file
            formData.append("file", file);

            const response = await fetch(BULK_UPLOAD_URL, {
                method: "POST",
                body: formData,
                headers: {},
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

            // Navigate after successful upload
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

    // ================= MAIN UI =================

    return (
        <div className="min-h-screen w-full bg-[#F4F7FB] p-4 md:p-6 xl:p-8">

            {/* PAGE HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
                <div className="flex items-start gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admindashboard")}
                        title="Back to dashboard"
                        className="mt-1 p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                    >
                        <ArrowLeft size={21} />
                    </button>

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#14213D]">
                            Bulk Checklist Upload
                        </h1>

                        <p className="text-sm md:text-base text-slate-500 mt-2">
                            Upload a CSV file to create multiple checklist items at once.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin/viewChecklist")}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                    <FileText size={17} />
                    View Checklists
                </button>
            </div>

            {/* INFORMATION CARDS */}

            <div
                className="grid gap-5 mb-8"
                style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                }}
            >
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
                            <FileSpreadsheet size={23} />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 font-medium">
                                Supported Format
                            </p>
                            <p className="text-lg font-bold text-[#173B70] mt-1">
                                CSV File
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-violet-50 text-violet-700">
                            <Database size={23} />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 font-medium">
                                Required Columns
                            </p>
                            <p className="text-lg font-bold text-[#173B70] mt-1">
                                {REQUIRED_COLUMNS.length} Columns
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                            <Upload size={23} />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 font-medium">
                                Maximum File Size
                            </p>
                            <p className="text-lg font-bold text-[#173B70] mt-1">
                                10 MB
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN UPLOAD SECTION */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                {/* SECTION HEADER */}

                <div className="px-6 py-5 lg:px-8 border-b border-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                            <Upload size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-[#173B70]">
                                Upload Checklist CSV
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Select or drag and drop your CSV file below.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 md:p-7 lg:p-8">

                    {/* FILE DROPZONE */}

                    {!file && (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                cursor-pointer rounded-2xl
                                border-2 border-dashed
                                p-10 md:p-16
                                text-center
                                transition-all duration-200
                                ${
                                    isDragging
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
                                }
                            `}
                        >
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                <Upload size={36} />
                            </div>

                            <h3 className="text-xl font-bold text-[#173B70]">
                                Upload CSV File
                            </h3>

                            <p className="mt-3 text-base text-slate-600">
                                Drag and drop your CSV file here, or{" "}
                                <span className="font-semibold text-blue-700">
                                    browse files
                                </span>
                            </p>

                            <p className="mt-5 text-sm text-slate-500">
                                Supported format: CSV
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
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

                    {/* SELECTED FILE */}

                    {file && (
                        <div className="space-y-6">

                            {/* FILE INFORMATION */}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                        <FileSpreadsheet size={27} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-base font-bold text-slate-800 break-all">
                                            {file.name}
                                        </p>

                                        <p className="mt-2 text-sm text-slate-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                            {" · "}
                                            {totalRows} rows detected
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={removeFile}
                                    disabled={isProcessing}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={17} />
                                    Remove File
                                </button>
                            </div>

                            {/* CSV PREVIEW */}

                            {csvData.length > 0 && (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">

                                    {/* PREVIEW HEADER */}

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 bg-slate-50 border-b border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                                                <Eye size={20} />
                                            </div>

                                            <div>
                                                <h3 className="text-base font-bold text-[#173B70]">
                                                    CSV Data Preview
                                                </h3>

                                                <p className="text-sm text-slate-500 mt-1">
                                                    Showing {previewData.length} of {totalRows} rows
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <label
                                                htmlFor="rowsToView"
                                                className="text-sm font-medium text-slate-600"
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
                                                className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />

                                            <span className="text-sm text-slate-500">
                                                / {totalRows}
                                            </span>

                                            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                {headers.length} columns
                                            </span>
                                        </div>
                                    </div>

                                    {/* REQUIRED COLUMN INFORMATION */}

                                    <div className="p-4 border-b border-slate-200 bg-white">
                                        <p className="text-sm font-semibold text-slate-600 mb-3">
                                            Required CSV columns
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {REQUIRED_COLUMNS.map((column) => (
                                                <span
                                                    key={column}
                                                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium border ${
                                                        headers.includes(column)
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-red-50 text-red-600 border-red-200"
                                                    }`}
                                                >
                                                    {column}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* TABLE */}

                                    {previewData.length > 0 && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-max text-left text-sm">

                                                <thead className="bg-[#EAF3FF]">
                                                    <tr>
                                                        {headers.map((header) => (
                                                            <th
                                                                key={header}
                                                                className="whitespace-nowrap border-b border-blue-100 px-5 py-4 text-sm font-bold text-[#173B70]"
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
                                                            className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors"
                                                        >
                                                            {headers.map((header) => (
                                                                <td
                                                                    key={header}
                                                                    className="max-w-[350px] px-5 py-4 text-sm text-slate-600"
                                                                    title={row[header]}
                                                                >
                                                                    <div className="max-w-[350px] truncate">
                                                                        {row[header] || "-"}
                                                                    </div>
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

                            {/* UPLOAD BUTTON */}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                                <p className="text-sm text-slate-500">
                                    The complete CSV file will be sent for processing.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleUpload}
                                    disabled={
                                        isProcessing ||
                                        !file ||
                                        csvData.length === 0
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075EB5] px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#064D94] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            Process & Upload
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VALIDATION ERROR */}

                    {error && (
                        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
                            <AlertCircle
                                className="mt-0.5 shrink-0 text-red-600"
                                size={21}
                            />

                            <div>
                                <p className="text-sm font-bold text-red-700">
                                    Upload Error
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* UPLOAD STATUS */}

                    {uploadStatus && (
                        <div
                            className={`mt-6 flex items-start gap-3 rounded-xl border p-5 ${
                                uploadStatus.type === "success"
                                    ? "border-emerald-200 bg-emerald-50"
                                    : "border-red-200 bg-red-50"
                            }`}
                        >
                            {uploadStatus.type === "success" ? (
                                <CheckCircle2
                                    className="mt-0.5 shrink-0 text-emerald-600"
                                    size={22}
                                />
                            ) : (
                                <AlertCircle
                                    className="mt-0.5 shrink-0 text-red-600"
                                    size={22}
                                />
                            )}

                            <div>
                                <p
                                    className={`text-sm font-bold ${
                                        uploadStatus.type === "success"
                                            ? "text-emerald-700"
                                            : "text-red-700"
                                    }`}
                                >
                                    {uploadStatus.type === "success"
                                        ? "Upload Successful"
                                        : "Upload Failed"}
                                </p>

                                <p
                                    className={`mt-1 text-sm ${
                                        uploadStatus.type === "success"
                                            ? "text-emerald-700"
                                            : "text-red-600"
                                    }`}
                                >
                                    {uploadStatus.message}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER NOTE */}

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <FileText
                    size={19}
                    className="mt-0.5 shrink-0 text-blue-700"
                />

                <p className="text-sm text-slate-600 leading-relaxed">
                    Ensure that your CSV contains all 17 required columns and
                    follows the expected checklist data structure before
                    uploading.
                </p>
            </div>
        </div>
    );
};

export default BulkUpload;
