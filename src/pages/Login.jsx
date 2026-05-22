import { useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import { useNavigate } from "react-router-dom";

import {
    Mail,
    LockKeyhole,
    ArrowRight
} from "lucide-react";

import "./Login.css";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const login = async () => {


        setErrorMsg("");
        setLoading(true);

  

        try {

            const res = await api.post(
                "/api/auth/login",
                {
                    email,
                    password
                },
                {
                    withCredentials: true
                }
            );

            // 🔥 guardar usuario
            localStorage.setItem(
                "user",
                JSON.stringify(res.data)
            );

            // 🔥 CONECTAR SOCKET
            socket.connect();

            socket.emit(
                "join_user_room",
                res.data.id
            );

            await new Promise(resolve =>
                setTimeout(resolve, 1800)
            );

            navigate("/dashboard");




        } catch (error) {

            setLoading(false);

            setErrorMsg("Correo o contraseña incorrectos");
        }
    };

    return (

        <div className="login-page">

            {/* FX */}
            <div className="bg-orb orb-1"></div>
            <div className="bg-orb orb-2"></div>
            <div className="bg-grid"></div>

            <div className="login-wrapper">

                {/* LEFT */}
                <div className="login-showcase">

                    <div className="showcase-content">

                        <div className="showcase-logo">

                            <div className="logo-box">
                                <img src="/logo.png" alt="logo" />
                            </div>

                            <h2>ERP VENTAS</h2>

                        </div>

                        <div className="hero-content">

                            <h1>
                                Gestiona tu empresa
                                <span> con inteligencia</span>
                            </h1>

                            <p>
                                Plataforma moderna para administración,
                                reportes, inventario y ventas empresariales.
                            </p>

                        </div>

                        {/* FLOATING ELEMENTS */}
                        <div className="floating-elements">

                            <div className="floating-card card-1">
                                Dashboard Analytics
                            </div>

                            <div className="floating-card card-2">
                                Ventas en tiempo real
                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT */}
                <div className="login-side">

                    <div className="login-card">

                        <div className="login-top">

                            <div className="mobile-logo">
                                <img src="/logo.png" alt="logo" />
                            </div>

                            <h2>Bienvenido</h2>

                            <p>
                                Ingresa tus credenciales para continuar
                            </p>

                        </div>

                        <div className="login-form">

                            <div className="input-group">

                                <label>Correo electrónico</label>

                                <div className="input-wrapper">

                                    <Mail size={18} />

                                    <input
                                        type="email"
                                        placeholder="correo@empresa.com"
                                        value={email}
                                        onChange={(e) => {

                                            setEmail(e.target.value);

                                            setErrorMsg("");
                                        }}
                                    />

                                </div>

                            </div>

                            <div className="input-group">

                                <label>Contraseña</label>

                                <div className="input-wrapper">

                                    <LockKeyhole size={18} />

                                    <input
                                        type="password"
                                        placeholder="Ingresa tu contraseña"
                                        value={password}
                                        onChange={(e) => {

                                            setPassword(e.target.value);

                                            setErrorMsg("");
                                        }}
                                    />

                                </div>

                            </div>

                            {errorMsg && (

                                <div className="login-error">

                                    <div className="error-dot"></div>

                                    <span>{errorMsg}</span>

                                </div>

                            )}

                            <button
                                className="login-button"
                                onClick={login}
                                disabled={loading}
                            >

                               <span>
                                {loading ? "Ingresando..." : "Ingresar"}
                            </span>

                                <ArrowRight size={18} />

                            </button>

                        </div>

                    </div>

                </div>

            </div>



            {/* LOADER */}
{loading && (

    <div className="login-loader-overlay">

        <div className="login-loader-box">

            <div className="loader-logo">

                <img src="/logo.png" alt="logo" />

            </div>

            <h3>Iniciando sesión</h3>

            <p>
                Cargando entorno empresarial...
            </p>

            <div className="loader-bar">

                <div className="loader-progress"></div>

            </div>

        </div>

    </div>

)}

        </div>
    );
}