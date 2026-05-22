import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutEvent } from "../utils/logoutEvent";

export default function GlobalAuthListener() {

    const navigate = useNavigate();

    useEffect(() => {

        logoutEvent.subscribe(() => {

            document.cookie = "token=; Max-Age=0";
            document.cookie = "refreshToken=; Max-Age=0";

            navigate("/");

        });

    }, []);

    return null;
}