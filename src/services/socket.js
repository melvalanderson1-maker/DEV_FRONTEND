import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {

    autoConnect: false,

    withCredentials: true,

    transports: ["websocket"]

});

// =======================================
// EVENTS
// =======================================

socket.on("connect", () => {

    console.log("🟢 SOCKET CONECTADO:", socket.id);

});

socket.on("disconnect", (reason) => {

    console.log("🔴 SOCKET DESCONECTADO:", reason);

});

socket.on("connect_error", (err) => {

    console.log("❌ SOCKET ERROR:", err.message);

});

export default socket;