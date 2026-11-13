
import { useThemeContext } from "../theme/ThemeProvider";

const useTheme = () => {
    const {
        theme,
        isDarkMode,
        toggleTheme,
        changeTheme,
    } = useThemeContext();

    return {
        theme,
        isDarkMode,
        toggleTheme,
        changeTheme,
    };
};

export default useTheme;
