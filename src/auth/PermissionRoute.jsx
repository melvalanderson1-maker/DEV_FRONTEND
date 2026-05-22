import { Navigate } from "react-router-dom";

export default function PermissionRoute({
    children,
    permiso
}) {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    // no logueado
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // sin permisos
    if (!user.permisos?.includes(permiso)) {
        return <Navigate to="/dashboard" replace />;
    }

    // ✅ MOSTRAR COMPONENTE
    return children;
}