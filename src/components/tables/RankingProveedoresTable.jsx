import { useEffect, useState } from "react";
import api from "../../services/api";
import { ExternalLink } from "lucide-react";

import "./RankingProveedoresTable.css";

export default function RankingProveedoresTable({
        filters,
        totalVentas
    }) {

    const [data, setData] = useState([]);

useEffect(() => {
        const fetchData = async () => {
            const res = await api.get("/api/analytics/proveedores", {
                params: filters
            });
            setData(res.data);
        };

        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(filters)]);




    const maxSubtotal = Math.max(
    ...data.map(item => Number(item.subtotal || 0))
);

    return (
        <div className="table-container">

            <table>
            <thead>

                <tr>

                    <th className="col-proveedor">
                        Proveedor
                    </th>

                    <th className="col-subtotal-header">

                        <div>Subtotal</div>

                        <div className="subtotal-total-header">
                            S/ {Number(totalVentas || 0).toLocaleString()}
                        </div>

                    </th>

                    <th className="col-percent-header">

                        <div>% S.T.</div>

                        <div className="subtotal-total-header">
                            100%
                        </div>

                    </th>

                    <th>
                        N° Partes
                    </th>

                    <th>
                        OCAM
                    </th>

                </tr>

            </thead>

               <tbody>

    {data.map((p, i) => {

    const barPercent =
        (p.subtotal / maxSubtotal) * 100;

    const totalPercent =
        (p.subtotal / totalVentas) * 100;

        return (

            <tr key={i}>

                <td className="col-proveedor">
                    {p.proveedor}
                </td>

                {/* SUBTOTAL */}
                <td className="col-subtotal">

                    <div className="subtotal-cell">

                        <div
                            className="subtotal-bar"
                            style={{
                                width: `${barPercent}%`
                            }}
                        />

                        <div className="subtotal-content">

                            S/ {Number(
                                p.subtotal
                            ).toLocaleString()}

                        </div>

                    </div>

                </td>

                {/* PORCENTAJE */}
                <td className="col-percent">

                    <div className="percent-cell">

                        <div
                            className="percent-bar"
                            style={{
                                width: `${barPercent}%`
                            }}
                        />

                        <div className="percent-text">

                            {totalPercent.toFixed(2)}%

                        </div>

                    </div>

                </td>

                {/* ORDENES */}
                <td className="col-ordenes">
                    {p.partes}
                </td>

                <td className="col-ocams">
                    {p.ocams}
                </td>

            </tr>

        );

    })}

</tbody>

            </table>

        </div>
    );
}