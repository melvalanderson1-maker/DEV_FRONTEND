import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import AdminPage from "../pages/AdminPage";
import UsuarioPage from "../pages/UsuarioPage";

export default function RouterApp(){

    return(
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/admin"
                    element={<AdminPage />}
                />

                <Route
                    path="/usuario"
                    element={<UsuarioPage />}
                />

            </Routes>

        </BrowserRouter>
    );
}