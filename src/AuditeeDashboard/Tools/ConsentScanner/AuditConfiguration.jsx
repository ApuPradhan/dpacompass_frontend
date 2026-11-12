
import React, { useState } from "react";
import {
    Globe2,
    LockKeyhole,
    Play,
    User,
    KeyRound,
    Eye,
    EyeOff,
    Info,
    Files,
    Clock,
} from "lucide-react";

const MIN_PAGES = 1;
const MAX_PAGES = 1000;
const DEFAULT_PAGES = 20;

const AuditConfiguration = ({ onStartAudit }) => {
    const [url, setUrl] = useState("");
    const [maxPages, setMaxPages] = useState(String(DEFAULT_PAGES));

    const [authenticationRequired, setAuthenticationRequired] =
        useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");

    // Estimate: 10 seconds setup + 5 seconds per page
    // Estimate: 30 seconds setup + 25 seconds per page
    const estimatedSeconds =
        10 + (Number(maxPages) > 0 ? Number(maxPages) * 5 : 0);

    const formatEstimatedTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes === 0) {
            return `${remainingSeconds} seconds`;
        }

        if (remainingSeconds === 0) {
            return `${minutes} min`;
        }

        return `${minutes} min ${remainingSeconds} sec`;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        // Validate URL
        if (!url.trim()) {
            setError("Please enter the website URL.");
            return;
        }

        try {
            const parsedUrl = new URL(url.trim());

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                setError("Only HTTP and HTTPS URLs are supported.");
                return;
            }
        } catch {
            setError("Please enter a valid website URL.");
            return;
        }

        // Validate maximum pages
        const pageLimit = Number(maxPages);

        if (
            !Number.isInteger(pageLimit) ||
            pageLimit < MIN_PAGES ||
            pageLimit > MAX_PAGES
        ) {
            setError(
                `Maximum pages must be between ${MIN_PAGES} and ${MAX_PAGES}.`
            );
            return;
        }

        // Validate optional authentication credentials
        if (
            authenticationRequired &&
            (!username.trim() || !password)
        ) {
            setError(
                "Please provide both username and password when authentication is enabled."
            );
            return;
        }

        // Prepare scan configuration
        const configuration = {
            url: url.trim(),
            max_pages: pageLimit,
            authentication_required: authenticationRequired,
            ...(authenticationRequired && {
                username: username.trim(),
                password,
            }),
        };

        onStartAudit?.(configuration);
    };

    return (
        <div className="mx-auto w-full max-w-4xl">

            {/* HEADER */}
            <div className="mb-8">
                <p className="mt-2 max-w-3xl text-base leading-7 text-slate-400">
                    Provide the website details required to begin the DPDP
                    consent and notice assessment.
                </p>
            </div>

            {/* CONFIGURATION CARD */}
            <form
                onSubmit={handleSubmit}
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900/70
                    shadow-lg
                    shadow-black/10
                "
            >

                {/* WEBSITE URL */}
                <div className="p-6">
                    <div className="mb-5 flex items-center gap-2.5">
                        <Globe2 className="h-5 w-5 text-indigo-400" />

                        <h2 className="text-base font-semibold text-slate-100">
                            Target Website
                        </h2>
                    </div>

                    <label
                        htmlFor="audit-url"
                        className="mb-2.5 block text-sm font-medium text-slate-300"
                    >
                        Website URL <span className="text-red-400">*</span>
                    </label>

                    <div className="relative">
                        <Globe2
                            className="
                                absolute
                                left-3.5
                                top-1/2
                                h-5
                                w-5
                                -translate-y-1/2
                                text-slate-600
                            "
                        />

                        <input
                            id="audit-url"
                            type="url"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            placeholder="https://example.com"
                            required
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-950/60
                                py-3
                                pl-11
                                pr-4
                                text-base
                                text-slate-200
                                placeholder:text-slate-600
                                outline-none
                                transition
                                focus:border-indigo-500/50
                                focus:ring-2
                                focus:ring-indigo-500/10
                            "
                        />
                    </div>

                    <p className="mt-2.5 text-xs leading-5 text-slate-500">
                        Enter the publicly accessible URL of the website you
                        want to audit.
                    </p>
                </div>

                {/* MAXIMUM PAGES */}
                <div className="border-t border-slate-800 p-6">

                    <div className="mb-5 flex items-center gap-2.5">
                        <Files className="h-5 w-5 text-indigo-400" />

                        <h2 className="text-base font-semibold text-slate-100">
                            Crawl Configuration
                        </h2>
                    </div>

                    <label
                        htmlFor="max-pages"
                        className="mb-2.5 block text-sm font-medium text-slate-300"
                    >
                        Maximum Pages <span className="text-red-400">*</span>
                    </label>

                    <input
                        id="max-pages"
                        type="number"
                        min={MIN_PAGES}
                        max={MAX_PAGES}
                        step="1"
                        value={maxPages}
                        onChange={(event) => setMaxPages(event.target.value)}
                        placeholder="Enter maximum pages"
                        required
                        className="
                            w-full
                            rounded-lg
                            border
                            border-slate-700
                            bg-slate-950/60
                            px-4
                            py-3
                            text-base
                            text-slate-200
                            placeholder:text-slate-600
                            outline-none
                            transition
                            focus:border-indigo-500/50
                            focus:ring-2
                            focus:ring-indigo-500/10
                        "
                    />

                    <p className="mt-2.5 text-xs leading-5 text-slate-500">
                        Specify the maximum number of website pages the crawler
                        should visit. Allowed range: 1–1000.
                    </p>

                    {/* ESTIMATED TIME */}
                    <div className="mt-5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                                <Clock className="h-5 w-5 text-indigo-400" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-300">
                                    Estimated Crawling Time
                                </p>

                                <p className="mt-1 text-xl font-semibold text-indigo-400">
                                    {Number.isInteger(Number(maxPages)) &&
                                    Number(maxPages) >= MIN_PAGES &&
                                    Number(maxPages) <= MAX_PAGES
                                        ? formatEstimatedTime(estimatedSeconds)
                                        : "Enter a valid page limit"}
                                </p>
                            </div>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                            Approximate estimate based on 10 seconds of setup
                            time and 5 seconds per page. Actual duration may
                            vary depending on website response time and
                            network conditions.
                        </p>
                    </div>
                </div>

                {/* AUTHENTICATION */}
                <div className="border-t border-slate-800 p-6">

                    <div className="flex items-start justify-between gap-5">

                        <div className="flex items-start gap-3.5">
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-slate-700
                                    bg-slate-950/50
                                "
                            >
                                <LockKeyhole className="h-5 w-5 text-slate-400" />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-slate-100">
                                    Authentication
                                </h2>

                                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                                    Enable this if the target website requires
                                    login credentials.
                                </p>
                            </div>
                        </div>

                        {/* AUTHENTICATION TOGGLE */}
                        <button
                            type="button"
                            role="switch"
                            aria-checked={authenticationRequired}
                            onClick={() => {
                                setAuthenticationRequired(
                                    (current) => !current
                                );
                                setError("");
                            }}
                            className={`
                                relative
                                inline-flex
                                h-7
                                w-12
                                shrink-0
                                rounded-full
                                border
                                transition-colors
                                duration-200
                                ${
                                    authenticationRequired
                                        ? "border-indigo-500/40 bg-indigo-500"
                                        : "border-slate-700 bg-slate-800"
                                }
                            `}
                        >
                            <span
                                className={`
                                    inline-block
                                    h-5
                                    w-5
                                    translate-y-0.5
                                    rounded-full
                                    bg-white
                                    shadow
                                    transition-transform
                                    duration-200
                                    ${
                                        authenticationRequired
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                    }
                                `}
                            />
                        </button>
                    </div>

                    {/* CREDENTIALS */}
                    {authenticationRequired && (
                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* USERNAME */}
                            <div>
                                <label
                                    htmlFor="audit-username"
                                    className="mb-2.5 block text-sm font-medium text-slate-300"
                                >
                                    Username
                                </label>

                                <div className="relative">
                                    <User
                                        className="
                                            absolute
                                            left-3.5
                                            top-1/2
                                            h-5
                                            w-5
                                            -translate-y-1/2
                                            text-slate-600
                                        "
                                    />

                                    <input
                                        id="audit-username"
                                        type="text"
                                        value={username}
                                        onChange={(event) =>
                                            setUsername(event.target.value)
                                        }
                                        placeholder="Enter username"
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-700
                                            bg-slate-950/60
                                            py-3
                                            pl-11
                                            pr-4
                                            text-base
                                            text-slate-200
                                            placeholder:text-slate-600
                                            outline-none
                                            transition
                                            focus:border-indigo-500/50
                                            focus:ring-2
                                            focus:ring-indigo-500/10
                                        "
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label
                                    htmlFor="audit-password"
                                    className="mb-2.5 block text-sm font-medium text-slate-300"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <KeyRound
                                        className="
                                            absolute
                                            left-3.5
                                            top-1/2
                                            h-5
                                            w-5
                                            -translate-y-1/2
                                            text-slate-600
                                        "
                                    />

                                    <input
                                        id="audit-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter password"
                                        className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-700
                                            bg-slate-950/60
                                            py-3
                                            pl-11
                                            pr-11
                                            text-base
                                            text-slate-200
                                            placeholder:text-slate-600
                                            outline-none
                                            transition
                                            focus:border-indigo-500/50
                                            focus:ring-2
                                            focus:ring-indigo-500/10
                                        "
                                    />

                                    <button
                                        type="button"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current
                                            )
                                        }
                                        className="
                                            absolute
                                            right-3.5
                                            top-1/2
                                            -translate-y-1/2
                                            text-slate-600
                                            transition
                                            hover:text-slate-400
                                        "
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AUTHENTICATION INFORMATION */}
                    {authenticationRequired && (
                        <div
                            className="
                                mt-5
                                flex
                                items-start
                                gap-2.5
                                rounded-lg
                                border
                                border-indigo-500/10
                                bg-indigo-500/5
                                px-4
                                py-3
                            "
                        >
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />

                            <p className="text-xs leading-5 text-slate-400">
                                Credentials are used only to authenticate the
                                crawler against the configured audit target.
                            </p>
                        </div>
                    )}
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mx-6 mb-5 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                        <p className="text-sm text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* FOOTER */}
                <div
                    className="
                        flex
                        flex-col
                        items-start
                        justify-between
                        gap-4
                        border-t
                        border-slate-800
                        bg-slate-950/20
                        px-6
                        py-5
                        sm:flex-row
                        sm:items-center
                    "
                >
                    <p className="text-xs leading-5 text-slate-500">
                        The audit will evaluate the configured DPDP requirements.
                    </p>

                    <button
                        type="submit"
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-indigo-500
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            shadow-indigo-500/10
                            transition
                            hover:bg-indigo-400
                            active:bg-indigo-600
                            focus:outline-none
                            cursor-pointer
                            focus:ring-2
                            focus:ring-indigo-500/30
                        "
                    >
                        <Play className="h-4 w-4" />
                        Start Scanner
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AuditConfiguration;
