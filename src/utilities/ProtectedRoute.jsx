import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user"));
  
  const isUnauthorized =
    (allowedRoles.length > 0 && !allowedRoles.includes(user?.role));

  useEffect(() => {
    if (isUnauthorized) {
      const timer = setTimeout(() => {
        navigate("/signin");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isUnauthorized, navigate]);

  if (isUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#1e293b] text-white">
        <div className="bg-[#0f172a]/80 border border-gray-700 p-6 rounded-xl text-center">
          <h2 className="text-lg font-semibold text-red-400 mb-2">
            You don't have permission to access this page
          </h2>
          <p className="text-sm text-gray-400">
            Redirecting to login page...
          </p>
        </div>
      </div>  

    );
  }

  return children;
};

export default ProtectedRoute;






