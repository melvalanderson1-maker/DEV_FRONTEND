import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {

        try {

            const res = await api.post("/auth/login", {
                email,
                password
            });

            if (res.data.rol === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/usuario");
            }

        } catch (error) {
            alert("Credenciales incorrectas");
        }
    };

    return (
        <div className="login-container">

            <div className="login-card">

                <div className="login-header">
                    <h1>Bienvenido</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                <div className="login-form">

                    <div className="input-group">
                        <label>Correo electrónico</label>

                        <input
                            type="email"
                            placeholder="correo@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>

                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className="login-button"
                        onClick={login}
                    >
                        Ingresar
                    </button>

                </div>

            </div>

        </div>
    );
}