import { Outlet } from "react-router-dom";

import { useState } from "react";

import Sidebar from "../components/Sidebar/Sidebar";

import "./Layout.css";

export default function Layout() {

    // =====================================================
    // ESTADO GLOBAL SIDEBAR
    // =====================================================

    const [collapsed, setCollapsed] = useState(false);

    return (

        <div className="layout">

            {/* SIDEBAR */}
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            {/* CONTENIDO */}
            <main
                className={`
                    layout-content
                    ${collapsed ? "expanded" : ""}
                `}
            >

                <Outlet />

            </main>

        </div>

    );
}