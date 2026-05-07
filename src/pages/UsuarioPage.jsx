import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../layout/Layout";
import "./UsuarioPage.css";

export default function UsuarioPage() {

    const [productos, setProductos] = useState([]);

    const obtenerProductos = async () => {
        const res = await api.get("/productos");
        setProductos(res.data);
    };

    useEffect(() => {
        obtenerProductos();
    }, []);

    return (
        <Layout rol="USER">

            <div className="usuario-container">

                <div className="usuario-header">
                    <h1>PANEL USUARIO</h1>
                    <p>Explora productos disponibles</p>
                </div>

                <div className="cards-grid">

                    {productos.map((p) => (
                        <div className="card" key={p.id}>
                            <h3>{p.nombre}</h3>

                            <p>S/ {p.precio}</p>
                            <p>Stock: {p.stock}</p>

                        </div>
                    ))}

                </div>

            </div>

        </Layout>
    );
}