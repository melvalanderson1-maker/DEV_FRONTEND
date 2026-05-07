import Sidebar from "../components/Sidebar";
import "./Layout.css";

export default function Layout({ children, rol }) {

    return (
        <div className="layout">

            <Sidebar rol={rol} />

            <div className="content">
                {children}
            </div>

        </div>
    );
}