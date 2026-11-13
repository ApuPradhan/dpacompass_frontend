
import { AuthProvider } from "../contexts/AuthContext";
import { PermissionProvider } from "../contexts/PermissionContext";
import { ThemeProvider } from "../theme/ThemeProvider";

const NewUIProvider = ({ children }) => {
    return (
        <AuthProvider>
            <PermissionProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </PermissionProvider>
        </AuthProvider>
    );
};

export default NewUIProvider;
