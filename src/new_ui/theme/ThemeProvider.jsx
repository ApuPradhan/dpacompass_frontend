
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "dpacompass-new-ui-theme";

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    return savedTheme === "dark" ? "dark" : "light";
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const root = document.querySelector(".new-ui-root");

        if (!root) return;

        root.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((currentTheme) => {
            const nextTheme = currentTheme === "light" ? "dark" : "light";

            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

            return nextTheme;
        });
    }, []);

    const changeTheme = useCallback((newTheme) => {
        if (newTheme !== "light" && newTheme !== "dark") return;

        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        setTheme(newTheme);
    }, []);

    const value = {
        theme,
        isDarkMode: theme === "dark",
        toggleTheme,
        changeTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useThemeContext must be used within a ThemeProvider"
        );
    }

    return context;
};
