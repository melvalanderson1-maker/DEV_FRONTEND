import RouterApp from "./routes/router";
import { AuthProvider } from "./context/AuthContext";

export default function App() {

    return (

        <AuthProvider>

            <RouterApp />

        </AuthProvider>

    );
}