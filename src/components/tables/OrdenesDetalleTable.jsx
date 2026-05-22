import { useEffect, useState } from "react";
import api from "../../services/api";
import {
    FileText,
    FileCheck,
    FileBadge
} from "lucide-react";

export default function OrdenesDetalleTable({
    filters,
    page
}) {

    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await api.get(
                "/api/analytics/ordenes-detalle",
                {
                    params: {
                        ...filters,
                        page
                    }
                }
            );

            setData(res.data);

            console.log(res.data[0]);
        };

        fetchData();
    }, [filters]);

    return (
        <div className="table-container">

            <table>
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th className="col-categoria">Categoria</th>
                        <th>N° Parte</th>
                        <th>Proveedor</th>
                        <th className="col-entidad">Entidad</th>
                        <th>OCAM</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Fecha</th>
                        <th>Orden</th>
                        <th>Informe</th>
                        <th>Ficha</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((o, i) => (
                        <tr key={i}>

                            <td>
                                {
                                    o.imagen_url && (
                                        <img
                                            src={o.imagen_url}
                                            alt="producto"
                                            loading="lazy"
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "contain"
                                            }}
                                        />
                                    )
                                }
                            </td>
                            <td className="col-categoria">{o.categoria}</td>
                        
                            <td>{o.nro_parte}</td>

                            <td className="col-proveedor">
                                {o.razon_social_proveedor}
                            </td>

                            <td className="col-entidad">
                                {o.razon_social_entidad}
                            </td>

                            <td>{o.ocam}</td>
                            <td>{o.precio_unitario}</td>
                            <td>{o.cantidad_entrega}</td>
                            <td>{o.subtotal}</td>
                            <td>
                                {o.fecha_aceptacion
                                    ? new Date(o.fecha_aceptacion).toLocaleDateString("es-PE", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric"
                                    })
                                    : ""}
                            </td>
                            <td>
                                {o.orden_digitalizada && (
                                    <a
                                        className="icon-link"
                                        href={o.orden_digitalizada}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Ver Orden"
                                    >
                                        <FileText />
                                    </a>
                                )}
                            </td>

                            <td>
                                {o.informe_sustento && (
                                    <a
                                        className="icon-link"
                                        href={o.informe_sustento}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Ver Informe"
                                    >
                                        <FileCheck />
                                    </a>
                                )}
                            </td>


                            <td>

                                {o.ficha_url && o.ficha_url.trim() !== "" && (
                                    <a
                                        className="icon-link"
                                        href={o.ficha_url.trim()}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <FileBadge />
                                    </a>
                                )}

                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>

        </div>
    );
}