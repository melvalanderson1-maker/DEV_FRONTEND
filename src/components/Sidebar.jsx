import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ rol }) {

    return (
        <div className="sidebar">

            <h2 className="logo">SISTEMA</h2>

            <nav className="menu">

                {rol === "ADMIN" && (
                    <>
                        <Link to="/admin">Dashboard</Link>
                        <Link to="/admin/productos">Productos</Link>
                        <Link to="/admin/usuarios">Usuarios</Link>
                        <Link to="/admin/reportes">Reportes</Link>
                    </>
                )}

                {rol === "USER" && (
                    <>
                        <Link to="/usuario">Productos</Link>
                        <Link to="/usuario/compras">Mis compras</Link>
                    </>
                )}

            </nav>

        </div>
    );
}