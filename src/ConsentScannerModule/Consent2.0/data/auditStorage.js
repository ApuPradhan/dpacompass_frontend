const STORAGE_KEY = "dpacompass_active_audit";

export const randomDuration = (
    minSeconds = 40,
    maxSeconds = 90
) => {
    return Math.floor(
        Math.random() *
            (maxSeconds - minSeconds + 1)
    ) + minSeconds;
};

/* =========================================================
   SAVE
========================================================= */

export const saveAuditSession = (session) => {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(session)
    );
};

/* =========================================================
   GET
========================================================= */

export const getAuditSession = () => {
    try {
        const stored = localStorage.getItem(
            STORAGE_KEY
        );

        if (!stored) {
            return null;
        }

        return JSON.parse(stored);
    } catch (error) {
        console.error(
            "Failed to read audit session:",
            error
        );

        return null;
    }
};

/* =========================================================
   CLEAR
========================================================= */

export const clearAuditSession = () => {
    localStorage.removeItem(STORAGE_KEY);
};