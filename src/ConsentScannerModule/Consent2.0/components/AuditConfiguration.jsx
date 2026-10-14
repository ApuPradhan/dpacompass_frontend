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
} from "lucide-react";

const AuditConfiguration = ({ onStartAudit }) => {
  const [url, setUrl] = useState("");
  const [authenticationRequired, setAuthenticationRequired] =
    useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!url.trim()) {
      setError("Please enter the website URL.");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    if (
      authenticationRequired &&
      (!username.trim() || !password)
    ) {
      setError("Please provide both username and password.");
      return;
    }

    const configuration = {
      url: url.trim(),
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
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-8">
        {/* <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
          Consent Audit
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">
          Configure Website Audit
        </h1> */}

        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-400">
          Provide the website details required to begin the DPDP
          consent and notice assessment.
        </p>
      </div>

      {/* =====================================================
          CONFIGURATION CARD
      ===================================================== */}
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
        {/* ===================================================
            WEBSITE
        =================================================== */}
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
            Website URL
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

        {/* ===================================================
            AUTHENTICATION
        =================================================== */}
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
                  Enable this if the target website requires login
                  credentials.
                </p>
              </div>
            </div>

            {/* =================================================
                TOGGLE
            ================================================= */}
            <button
              type="button"
              role="switch"
              aria-checked={authenticationRequired}
              onClick={() =>
                setAuthenticationRequired(
                  (current) => !current
                )
              }
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

          {/* =================================================
              CREDENTIALS
          ================================================= */}
          {authenticationRequired && (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Username */}
              <div>
                <label
                  htmlFor="audit-username"
                  className="
                    mb-2.5
                    block
                    text-sm
                    font-medium
                    text-slate-300
                  "
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

              {/* Password */}
              <div>
                <label
                  htmlFor="audit-password"
                  className="
                    mb-2.5
                    block
                    text-sm
                    font-medium
                    text-slate-300
                  "
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

          {/* =================================================
              INFORMATION
          ================================================= */}
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
                bg-red-500/5
                px-4
                py-3
              "
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

              <p className="text-s leading-5 text-slate-400">
                Credentials are used only to authenticate the
                crawler against the configured audit target.
              </p>
            </div>
          )}
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}
        {error && (
          <div className="mx-6 mb-5 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* ===================================================
            FOOTER
        =================================================== */}
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
              hover:pointer
              cursor-pointer
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