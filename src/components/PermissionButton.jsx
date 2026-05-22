import { useAuth } from "../context/AuthContext";

export default function PermissionButton({
    permiso,
    children
}) {

    const { user } = useAuth();

    const permitido =
        user?.permisos?.includes(permiso);

    if (!permitido) return null;

    return children;
}