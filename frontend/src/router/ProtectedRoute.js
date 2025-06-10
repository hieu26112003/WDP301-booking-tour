import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role, requiredRole }) => {
    return role === requiredRole ? <Outlet /> : <Navigate to="/home" />;
};

export default ProtectedRoute;
