
import { useAuthContext } from "../contexts/AuthContext";

const useAuth = () => {
    const {
        user,
        isAuthenticated,
        role,
        syncAuthState,
    } = useAuthContext();

    return {
        user,
        isAuthenticated,
        role,
        syncAuthState,
    };
};

export default useAuth;
