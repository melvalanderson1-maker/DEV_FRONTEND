import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useClientes = () => {
    return useQuery({
        queryKey: ["clientes"],
        queryFn: async () => {
            const res = await api.get("/clientes");
            return res.data;
        }
    });
};