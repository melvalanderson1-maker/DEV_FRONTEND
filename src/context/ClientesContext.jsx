import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const ClientesContext = createContext();

export const ClientesProvider = ({ children }) => {

    const [clientes, setClientes] = useState([]);

    const obtenerClientes = async () => {
        try {
            const res = await api.get("/api/auth/clientes", {
                headers: { "Cache-Control": "no-cache" }
            });

            setClientes(Array.isArray(res.data) ? res.data : []);

        } catch (error) {
            console.error(error);
        }
    };

    /* 🔥 CLAVE REAL: AUTO REFRESH CADA X SEGUNDOS */
    useEffect(() => {
        obtenerClientes(); // inicial

        const interval = setInterval(() => {
            obtenerClientes(); // sincroniza entre Admin y User
        }, 3000); // cada 3 segundos

        return () => clearInterval(interval);
    }, []);

    return (
        <ClientesContext.Provider value={{
            clientes,
            obtenerClientes
        }}>
            {children}
        </ClientesContext.Provider>
    );
};

export const useClientes = () => useContext(ClientesContext);