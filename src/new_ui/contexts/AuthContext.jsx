
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Failed to read stored user:", error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => Boolean(localStorage.getItem("access"))
    );

    const syncAuthState = useCallback(() => {
        const storedUser = getStoredUser();
        const hasToken = Boolean(localStorage.getItem("access"));

        setUser(storedUser);
        setIsAuthenticated(hasToken && Boolean(storedUser));
    }, []);

    useEffect(() => {
        window.addEventListener("storage", syncAuthState);

        window.addEventListener("auth:session-expired", syncAuthState);

        return () => {
            window.removeEventListener("storage", syncAuthState);
            window.removeEventListener("auth:session-expired", syncAuthState);
        };
    }, [syncAuthState]);

    const value = {
        user,
        isAuthenticated,
        role: user?.role ?? null,
        syncAuthState,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuthContext must be used within an AuthProvider"
        );
    }

    return context;
};
