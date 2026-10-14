import Input from "./Input";
import Textarea from "./TextArea";
import Select from "./Select";
import { useState, useEffect } from "react";
import SidebarItem from "../dashboard_old/SideBarItem";

import {
    FiFileText,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utilities/fetchWithAuth";


export default function RegisterApplication() {

    const inputClass =
        "w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

    const navigate = useNavigate();

    // =========================
    // USER
    // =========================

    const user = JSON.parse(localStorage.getItem("user"));

    // =========================
    // FORM DATA
    // =========================

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "",
        environment: "",

        // Web Application
        url: "",
        authenticationRequired: "no",
        webUsername: "",
        webPassword: "",

        // Database
        databaseName: "",
        databaseType: "",
        databaseHost: "",
        databasePort: "",
        databaseUsername: "",
        databasePassword: "",
    });

    const [applicationTypes, setApplicationTypes] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // =========================
    // SAFE JSON
    // =========================

    const safeJson = async (res) => {
        const text = await res.text();

        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Invalid server response");
        }
    };

    // =========================
    // FETCH APPLICATION TYPES
    // =========================

    const fetchTypes = async () => {
        try {
            const res = await fetchWithAuth(
                `/api/applications/types/`,
                {
                    method: "GET",
                }
            );

            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    "Failed to fetch application types"
                );
            }

            setApplicationTypes(data.data || []);

        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // =========================
    // SELECTED APPLICATION TYPE
    // =========================

    const selectedApplicationType = applicationTypes.find(
        (app) => app.id === formData.type
    );

    const selectedTypeName =
        selectedApplicationType?.name?.toLowerCase() || "";

    const isWebApplication =
        selectedTypeName === "web application";

    const isDatabase =
        selectedTypeName === "database";

    // =========================
    // CHANGE HANDLER
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "type"
                    ? parseInt(value, 10) || ""
                    : value,
        }));
    };

    // =========================
    // APPLICATION TYPE CHANGE
    // =========================

    const handleApplicationTypeChange = (e) => {
        const value = e.target.value;

        const selectedId = parseInt(value, 10) || "";

        setFormData((prev) => ({
            ...prev,

            type: selectedId,

            // Reset Web Application fields
            url: "",
            authenticationRequired: "no",
            webUsername: "",
            webPassword: "",

            // Reset Database fields
            databaseName: "",
            databaseType: "",
            databaseHost: "",
            databasePort: "",
            databaseUsername: "",
            databasePassword: "",
        }));
    };

    // =========================
    // VALIDATION
    // =========================

    const basicRequiredFields = [
        "name",
        "description",
        "type",
        "environment",
    ];

    let requiredFields = [
        ...basicRequiredFields,
    ];

    // -------------------------
    // WEB APPLICATION
    // -------------------------

    if (isWebApplication) {

        requiredFields.push("url");

        if (
            formData.authenticationRequired === "yes"
        ) {
            requiredFields.push(
                "webUsername",
                "webPassword"
            );
        }
    }

    // -------------------------
    // DATABASE
    // -------------------------

    if (isDatabase) {

        requiredFields.push(
            "databaseName",
            "databaseType",
            "databaseHost",
            "databasePort",
            "databaseUsername",
            "databasePassword"
        );
    }

    const isFormValid = requiredFields.every(
        (field) =>
            formData[field]
                ?.toString()
                .trim() !== ""
    );

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.warning(
                "Please fill all required fields"
            );
            return;
        }

        // =========================
        // BUILD PAYLOAD
        // =========================

        const payload = {
            // Common Application fields
            name: formData.name,
            description: formData.description,
            type: formData.type,
            environment: formData.environment,
        };

        // =========================
        // WEB APPLICATION PAYLOAD
        // =========================

        if (isWebApplication) {
            payload.url = formData.url;

            payload.authentication_required =
                formData.authenticationRequired === "yes";

            if (formData.authenticationRequired === "yes") {
                payload.web_username = formData.webUsername;
                payload.web_password = formData.webPassword;
            } else {
                payload.web_username = null;
                payload.web_password = null;
            }
        }

        // =========================
        // DATABASE PAYLOAD
        // =========================

        if (isDatabase) {
            payload.database_name = formData.databaseName;
            payload.database_type = formData.databaseType;
            payload.database_host = formData.databaseHost;
            payload.database_port = formData.databasePort;
            payload.database_username = formData.databaseUsername;
            payload.database_password = formData.databasePassword;
        }


        try {

            setSubmitting(true);

            const res = await fetchWithAuth(
                `/api/applications/create/`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            const data = await safeJson(res);

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to create application"
                );
            }

            const applicationId =
                data?.data?.id;

            if (!applicationId) {
                throw new Error(
                    "Application ID missing from response"
                );
            }

            toast.success(
                "Application created. Redirecting to payment..."
            );

            // =========================
            // PAYMENT
            // =========================

            navigate("/payment", {
                state: {
                    amount: 999,
                    title:
                        "Application Registration Fee",

                    metadata: {
                        applicationId:
                            applicationId,

                        type:
                            "application_registration",
                    },
                },
            });

            return;

        } catch (err) {

            console.error(err);

            toast.error(
                err.message ||
                "Server error"
            );

        } finally {

            setSubmitting(false);
        }
    };

    // =========================
    // UI
    // =========================

    return (
        <div className="flex min-h-screen bg-[#0b1120] text-gray-200">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="w-64 bg-[#0f172a]/90 border-r border-gray-700 p-6">

                <h1 className="text-xl font-bold mb-6 text-indigo-400">
                    DPACOMPASS
                </h1>

                <SidebarItem
                    icon={<FiFileText />}
                    label="Back to dashboard"
                    onClick={() =>
                        navigate("/devdashboard")
                    }
                />

            </aside>

            {/* =========================
                MAIN
            ========================= */}

            <div className="flex-1 p-6">

                <div className="bg-[#111827]/80 border border-gray-700 rounded-xl p-6 shadow-lg">

                    <h2 className="text-lg font-semibold mb-6 text-indigo-400">
                        Register Application
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* =========================
                            APPLICATION NAME
                        ========================= */}

                        <Input
                            label="Name *"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter application name"
                        />

                        {/* =========================
                            DESCRIPTION
                        ========================= */}

                        <Textarea
                            label="Description *"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the application"
                        />

                        {/* =========================
                            TYPE + ENVIRONMENT
                        ========================= */}

                        <div className="grid grid-cols-2 gap-4">

                            {/* APPLICATION TYPE */}

                            <div>

                                <label className="block text-sm mb-1 text-gray-400">
                                    Application Type *
                                </label>

                                <select
                                    className={inputClass}
                                    name="type"
                                    value={formData.type}
                                    onChange={
                                        handleApplicationTypeChange
                                    }
                                >

                                    <option value="">
                                        Select type
                                    </option>

                                    {applicationTypes.length > 0 ? (

                                        applicationTypes.map(
                                            (app) => (

                                                <option
                                                    key={app.id}
                                                    value={app.id}
                                                >
                                                    {app.name}
                                                </option>

                                            )
                                        )

                                    ) : (

                                        <option disabled>
                                            Loading...
                                        </option>

                                    )}

                                </select>

                            </div>

                            {/* ENVIRONMENT */}

                            <Select
                                label="Environment *"
                                name="environment"
                                value={
                                    formData.environment
                                }
                                onChange={handleChange}
                                options={[
                                    "Production",
                                    "Staging",
                                    "Development",
                                ]}
                            />

                        </div>

                        {/* =================================================
                            WEB APPLICATION
                        ================================================= */}

                        {isWebApplication && (

                            <div className="mt-6 p-5 rounded-xl border border-gray-700 bg-[#0f172a]">

                                <h3 className="text-md font-semibold mb-4 text-indigo-400">
                                    Web Application Configuration
                                </h3>

                                <div className="space-y-4">

                                    {/* URL */}

                                    <Input
                                        label="URL *"
                                        name="url"
                                        value={
                                            formData.url
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://example.com"
                                    />

                                    {/* AUTHENTICATION */}

                                    <div>

                                        <label className="block text-sm mb-2 text-gray-400">
                                            Authentication Required? *
                                        </label>

                                        <div className="flex gap-6">

                                            <label className="flex items-center gap-2 cursor-pointer">

                                                <input
                                                    type="radio"
                                                    name="authenticationRequired"
                                                    value="yes"
                                                    checked={
                                                        formData.authenticationRequired ===
                                                        "yes"
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    className="accent-indigo-600"
                                                />

                                                <span>
                                                    Yes
                                                </span>

                                            </label>

                                            <label className="flex items-center gap-2 cursor-pointer">

                                                <input
                                                    type="radio"
                                                    name="authenticationRequired"
                                                    value="no"
                                                    checked={
                                                        formData.authenticationRequired ===
                                                        "no"
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    className="accent-indigo-600"
                                                />

                                                <span>
                                                    No
                                                </span>

                                            </label>

                                        </div>

                                    </div>

                                    {/* =========================
                                        AUTH CREDENTIALS
                                    ========================= */}

                                    {formData.authenticationRequired ===
                                        "yes" && (

                                            <div className="grid grid-cols-2 gap-4 pt-2">

                                                <Input
                                                    label="Username *"
                                                    name="webUsername"
                                                    value={
                                                        formData.webUsername
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Username"
                                                />

                                                <Input
                                                    label="Password *"
                                                    name="webPassword"
                                                    type="password"
                                                    value={
                                                        formData.webPassword
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Password"
                                                />

                                            </div>

                                        )}

                                </div>

                            </div>

                        )}

                        {/* =================================================
                            DATABASE
                        ================================================= */}

                        {isDatabase && (

                            <div className="mt-6 p-5 rounded-xl border border-gray-700 bg-[#0f172a]">

                                <h3 className="text-md font-semibold mb-4 text-indigo-400">
                                    Database Configuration
                                </h3>

                                <div className="grid grid-cols-2 gap-4">

                                    {/* DATABASE NAME */}

                                    <Input
                                        label="Database Name *"
                                        name="databaseName"
                                        value={
                                            formData.databaseName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter database name"
                                    />

                                    {/* DATABASE TYPE */}

                                    <div>

                                        <label className="block text-sm mb-1 text-gray-400">
                                            Database Type *
                                        </label>

                                        <select
                                            className={inputClass}
                                            name="databaseType"
                                            value={
                                                formData.databaseType
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select database type
                                            </option>

                                            <option value="mysql">
                                                MySQL
                                            </option>

                                            <option value="postgresql">
                                                PostgreSQL
                                            </option>

                                            <option value="redis">
                                                Redis
                                            </option>

                                            <option value="oracle">
                                                Oracle
                                            </option>

                                            <option value="mongodb">
                                                MongoDB
                                            </option>

                                        </select>

                                    </div>

                                    {/* HOST */}

                                    <Input
                                        label="Host *"
                                        name="databaseHost"
                                        value={
                                            formData.databaseHost
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="localhost / IP / hostname"
                                    />

                                    {/* PORT */}

                                    <Input
                                        label="Port *"
                                        name="databasePort"
                                        value={
                                            formData.databasePort
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 5432"
                                    />

                                    {/* USERNAME */}

                                    <Input
                                        label="Username *"
                                        name="databaseUsername"
                                        value={
                                            formData.databaseUsername
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Database username"
                                    />

                                    {/* PASSWORD */}

                                    <Input
                                        label="Password *"
                                        name="databasePassword"
                                        type="password"
                                        value={
                                            formData.databasePassword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Database password"
                                    />

                                </div>

                            </div>

                        )}

                        {/* =========================
                            BUTTONS
                        ========================= */}

                        <div className="flex gap-3 pt-2">

                            <button
                                type="submit"
                                disabled={
                                    !isFormValid ||
                                    submitting
                                }
                                className={`px-5 py-2 rounded-lg font-medium
                                ${isFormValid &&
                                        !submitting
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        : "bg-gray-600 text-gray-300 cursor-not-allowed opacity-50"
                                    }`}
                            >

                                {submitting
                                    ? "Submitting..."
                                    : "Register Application"}

                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/devdashboard"
                                    )
                                }
                                className="px-5 py-2 rounded-lg border border-gray-600 hover:bg-gray-700/40"
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}