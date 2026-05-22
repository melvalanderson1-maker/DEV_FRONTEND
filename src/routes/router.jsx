import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";

import Layout from "../layout/Layout";

import ProtectedRoute from "../auth/ProtectedRoute";
import PermissionRoute from "../auth/PermissionRoute";

import DashboardPage from "../modules/dashboard/pages/DashboardPage";
import ProductosPage from "../modules/productos/pages/ProductosPage";
import UsuariosPage from "../modules/usuarios/pages/UsuariosPage";
import ReportesPage from "../modules/reportes/pages/ReportesPage";
import ComprasPage from "../modules/compras/pages/ComprasPage";

export default function RouterApp() {

    return (

        <Routes>

            <Route path="/" element={<Login />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >

                <Route
                    index
                    element={
                        <PermissionRoute permiso="dashboard">
                            <DashboardPage />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="productos"
                    element={
                        <PermissionRoute permiso="productos">
                            <ProductosPage />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="usuarios"
                    element={
                        <PermissionRoute permiso="usuarios">
                            <UsuariosPage />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="reportes"
                    element={
                        <PermissionRoute permiso="reportes">
                            <ReportesPage />
                        </PermissionRoute>
                    }
                />

                <Route
                    path="compras"
                    element={
                        <PermissionRoute permiso="compras">
                            <ComprasPage />
                        </PermissionRoute>
                    }
                />

            </Route>

        </Routes>

    );
}