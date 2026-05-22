import api from "../services/api";
import { logoutEvent } from "../utils/logoutEvent";

export async function logout() {
    try {

        // 🔥 AVISA AL BACKEND
        await api.post("/api/auth/logout", {}, {
            withCredentials: true
        });

    } catch (err) {
        console.log("logout error:", err);
    }

    // 🔥 DISPARA LOGOUT GLOBAL
    logoutEvent.dispatch();
}