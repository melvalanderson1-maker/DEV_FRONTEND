import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import api from "../../services/api";
import socket from "../../services/socket";
import { useNavigate } from "react-router-dom";

import {
     LogOut,
    LayoutDashboard,
    Package,
    Users,
    BarChart3,
    ShoppingCart,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    X,
    Moon,
    AlertTriangle,
    Sun
} from "lucide-react";

import "./Sidebar.css";

export default function Sidebar({
    collapsed,
    setCollapsed
}) {


    const navigate = useNavigate();


    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "dark"
    );

    useEffect(() => {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            "theme",
            theme
        );

    }, [theme]);


    useEffect(() => {

        const storedUser = localStorage.getItem("user");
 
        if (storedUser) {

            const parsedUser = JSON.parse(storedUser);

            setUser(parsedUser);

            socket.connect();

            socket.emit(
                "join_user_room",
                parsedUser.id
            );
        }

        socket.on(
            "permisos_actualizados",
            async () => {

                try {

                    const res = await api.get(
                        "/api/auth/me",
                        {
                            withCredentials: true
                        }
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(res.data)
                    );

                    setUser(res.data);

                } catch (error) {

                    console.log(error);

                }

            }
        );

        return () => {

            socket.off("permisos_actualizados");

        };

    }, []);




    const toggleTheme = () => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const toggleMobile = () => {
        setMobileOpen(!mobileOpen);
    };


    const openLogoutModal = () => {
    setShowLogoutModal(true);
    };

    const closeLogoutModal = () => {
        setShowLogoutModal(false);
    };

    const logout = async () => {

        try {

            await api.post(
                "/api/auth/logout",
                {},
                {
                    withCredentials: true
                }
            );

        } catch (error) {
            console.log(error);
        }

        // 🔥 desconectar socket
        socket.disconnect();

        // 🔥 limpiar user
        localStorage.removeItem("user");

        // 🔥 redirigir
        navigate("/");
    };
    const closeMobile = () => {
        if (window.innerWidth <= 1024) {
            setMobileOpen(false);
        }
    };

    const getActiveClass = ({ isActive }) =>
        isActive ? "nav-link active" : "nav-link";


    const tienePermiso = (permiso) => {
        return user?.permisos?.includes(permiso);
    };

    return (
        <>
            {/* MOBILE TOPBAR */}
            <div className="mobile-topbar">

                <button
                    className="mobile-menu-btn"
                    onClick={toggleMobile}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                <div className="mobile-brand">
                    <img src="/logo.png" alt="logo" />
                    <span>ERP VENTAS</span>
                </div>

                <button
                    className="theme-toggle mobile-theme"
                    onClick={toggleTheme}
                >
                    {theme === "dark"
                        ? <Sun size={18} />
                        : <Moon size={18} />
                    }
                </button>

            </div>

            {/* OVERLAY */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeMobile}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
                    sidebar
                    ${collapsed ? "collapsed" : ""}
                    ${mobileOpen ? "mobile-open" : ""}
                `}
            >

                {/* HEADER */}
                <div className="sidebar-header">

                    {/* LOGO SIEMPRE IZQUIERDA */}
                    <div className="brand">
                        <div className="logo-wrapper">
                            <img src="/logo.png" className="logo-img" />
                        </div>

                        {!collapsed && (
                            <div className="brand-info">
                                <h2>ERP VENTAS</h2>
                                <p>Enterprise Suite</p>
                            </div>
                        )}
                    </div>

                    {/* ACCIONES DERECHA */}
                   <div className={`header-actions ${collapsed ? "collapsed-actions" : ""}`}>

                        <button
                            className="collapse-btn"
                            onClick={toggleSidebar}
                             title={collapsed ? "Expandir menú" : "Colapsar menú"}
                        >
                            {collapsed
                                ? <PanelLeftOpen size={25} />
                                : <PanelLeftClose size={25} />
                            }
                        </button>

                    </div>

                </div>

                {/* NAVIGATION */}
                <nav className="sidebar-menu">

                {tienePermiso("dashboard") && (

                        <NavLink
                            to="/dashboard"
                            end
                            className={getActiveClass}
                            onClick={closeMobile}
                        >
                        <LayoutDashboard size={20} />
                        {!collapsed && <span>Dashboard</span>}
                    </NavLink>

                )}


                {tienePermiso("productos") && (

                    <NavLink
                        to="/dashboard/productos"
                        className={getActiveClass}
                        onClick={closeMobile}
                    >
                        <Package size={20} />
                        {!collapsed && <span>Productos</span>}
                    </NavLink>

                )}

                {tienePermiso("usuarios") && (

                    <NavLink
                        to="/dashboard/usuarios"
                        className={getActiveClass}
                        onClick={closeMobile}
                    >
                        <Users size={20} />
                        {!collapsed && <span>Usuarios</span>}
                    </NavLink>

                )}


                {tienePermiso("reportes") && (

                    <NavLink
                        to="/dashboard/reportes"
                        className={getActiveClass}
                        onClick={closeMobile}
                    >
                        <BarChart3 size={20} />
                        {!collapsed && <span>Reportes</span>}
                    </NavLink>

                )}

                {tienePermiso("compras") && (

                    <NavLink
                        to="/dashboard/compras"
                        className={getActiveClass}
                        onClick={closeMobile}
                    >
                        <ShoppingCart size={20} />
                        {!collapsed && <span>Mis Compras</span>}
                    </NavLink>

                )}

                </nav>


                {/* USER INFO */}

                {user && (

                    <div className="user-card">

                        <div className="user-avatar">
                            {user.nombre?.charAt(0)}
                        </div>

                        {!collapsed && (

                            <div className="user-info">

                                <h4>{user.nombre}</h4>

                                <p>{user.email}</p>

                                <span>{user.rol}</span>

                            </div>

                        )}

                    </div>

                )}

                {/* FOOTER */}
                <div className="sidebar-footer">

                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                    >
                        {theme === "dark"
                            ? <Sun size={18} />
                            : <Moon size={18} />
                        }

                        {!collapsed && (
                            <span>
                                {theme === "dark"
                                    ? "Modo Claro"
                                    : "Modo Oscuro"}
                            </span>
                        )}
                    </button>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >

                        <LogOut size={18} />

                        {!collapsed && (
                            <span>Salir</span>
                        )}

                    </button>

                </div>

            </aside>


            {/* LOGOUT MODAL */}
{showLogoutModal && (

    <div className="logout-modal-overlay">

        <div className="logout-modal">

            <div className="logout-icon">

                <AlertTriangle size={34} />

            </div>

            <h3>Cerrar sesión</h3>

            <p>
                ¿Seguro que deseas cerrar sesión?
            </p>

            <div className="logout-actions">

                <button
                    className="cancel-btn"
                    onClick={closeLogoutModal}
                >
                    Cancelar
                </button>

                <button
                    className="confirm-logout-btn"
                    onClick={logout}
                >
                    Sí, salir
                </button>

            </div>

        </div>

    </div>

)}
        </>
    );
}