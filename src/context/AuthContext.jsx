import { createContext, useContext, useEffect, useState } from "react";
import socket from "../services/socket";


const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);

    }, []);

    const logout = () => {

        // 🔥 DESCONECTAR SOCKET
        socket.disconnect();

        localStorage.removeItem("user");

        setUser(null);
    };
    return (

        <AuthContext.Provider
            value={{
                user,
                setUser,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);