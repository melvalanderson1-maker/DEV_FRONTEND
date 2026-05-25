import { useEffect, useState, useMemo } from "react";

import debounce from "lodash/debounce";
import React from "react";
import RankingProveedoresTable from "../../../components/tables/RankingProveedoresTable";
import OrdenesDetalleTable from "../../../components/tables/OrdenesDetalleTable";

import api from "../../../services/api";

import {
    Filter,
    BadgeDollarSign,
    ShoppingCart,
    Building2,
    Package,
    CalendarDays,
} from "lucide-react";

import "./DashboardPage.css";
import Select, { components } from "react-select";
import AsyncSelect from "react-select/async";


const MultiValueContainer = () => null;


export default function DashboardPage() {

    const [loading, setLoading] = useState(true);

    // =========================
    // DATA KPIS + LISTAS
    // =========================
    const [resumen, setResumen] = useState({});

    const [acuerdos, setAcuerdos] = useState([]);
    const [anios, setAnios] = useState([]);
    const [meses, setMeses] = useState([]);


    const [categorias, setCategorias] = useState([]);

    const [departamentos, setDepartamentos] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);


    const [tablaEntidades, setTablaEntidades] = useState([]);



    const [resultadoParte, setResultadoParte] = useState(null);


    

    // ====================================
    // INPUT LOCAL ULTRA RAPIDO
    // ====================================

    const [inputParte, setInputParte] = useState("");

    // =========================
    // FILTROS
    // =========================
    const [filters, setFilters] = useState({
        acuerdo_marco: "",
        anio: [],
        mes: [],
        proveedor: [],
        entidad: [],
        entidad_razon: "",
        categoria: "",
        departamento: "",
        provincia: "",
        distrito: "",
        nro_parte: ""
    });

    

    const [entidadSelected, setEntidadSelected] = useState([]);

    const [proveedorSelected, setProveedorSelected] = useState([]);
    const [proveedorOptions, setProveedorOptions] = useState([]);




    const orderSelectedFirst = (options, selected) => {

    const selectedSet = new Set(
        (selected || []).map(s => s.value)
    );

    return [...options].sort((a, b) => {

        const aSelected = selectedSet.has(a.value);
        const bSelected = selectedSet.has(b.value);

        if (aSelected === bSelected) return 0;

        return aSelected ? -1 : 1;
    });
};










  
    const nombresMeses = useMemo(() => ([
        "Enero","Febrero","Marzo","Abril",
        "Mayo","Junio","Julio","Agosto",
        "Septiembre","Octubre","Noviembre","Diciembre"
    ]), []);
    // =========================
    // CARGAR FILTROS
    // =========================
// =========================
// FILTROS FIJOS
// =========================
const cargarFiltrosFijos = async () => {

    try {

        const [
            acuerdosRes,
            aniosRes,
            mesesRes
        ] = await Promise.all([
            api.get("/api/analytics/acuerdos"),
            api.get("/api/analytics/anios"),
            api.get("/api/analytics/meses")
        ]);

        setAcuerdos(acuerdosRes.data);
        setAnios(aniosRes.data);
        setMeses(mesesRes.data);

    } catch (err) {

        console.log(err);
    }
};

const cargarProveedoresIniciales = async () => {

    try {

        const res = await api.get(
            "/api/analytics/lista-proveedores",
            {
                params: {
                    search: ""
                }
            }
        );

        const mapped = res.data.map((p) => ({
            value: `${p.ruc_proveedor}|||${p.razon_social_proveedor}`,

            label: `${p.ruc_proveedor} - ${p.razon_social_proveedor}`,

            ruc: p.ruc_proveedor,

            razon: p.razon_social_proveedor
        }));


        setProveedorOptions(mapped);

    } catch (err) {

        console.log(err);
    }
};

// =========================
// FILTROS DINAMICOS
// =========================
const cargarFiltrosDinamicos = async (currentFilters) => {
    try {

        const { categoria, ...filtersSinCategoria } = currentFilters;

        const res = await api.get(
            "/api/analytics/filtros-dinamicos",
            { params: filtersSinCategoria }
        );

        setCategorias(res.data.categorias);
        setDepartamentos(res.data.departamentos);
        setProvincias(res.data.provincias);
        setDistritos(res.data.distritos);

    } catch (err) {
        console.log(err);
    }
};

    // =========================
    // CARGAR KPI
    // =========================
    const cargarKpis = async (currentFilters) => {
        try {
            setLoading(true);

            const res = await api.get("/api/analytics/resumen", {
                params: currentFilters
            });

            setResumen(res.data);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };



const debouncedLoadData = useMemo(
    () =>
        debounce(async (currentFilters) => {
            // 🔥 KPIs y entidades primero — rápidos
            Promise.all([
                cargarKpis(currentFilters),
                cargarEntidades(currentFilters),
                currentFilters.nro_parte.trim()
                    ? buscarNroParte(currentFilters)
                    : Promise.resolve()
            ]);

            // 🔥 Filtros dinámicos por separado — no bloquea la UI
            cargarFiltrosDinamicos(currentFilters);
        }, 400),
    []
);



// ====================================
// DEBOUNCE NRO PARTE
// ====================================

const debouncedNroParte = useMemo(
    () =>
        debounce((value) => {

            setFilters(prev => ({

                ...prev,

                nro_parte: value,

                ...(value.trim() === ""
                    ? {
                        departamento: "",
                        provincia: "",
                        distrito: ""
                    }
                    : {}
                )

            }));

        }, 500),

    []
);

    // =========================
    // CARGAR FILTROS FIJOS
    // SOLO 1 VEZ
    // =========================
    useEffect(() => {

        cargarFiltrosFijos();

        cargarProveedoresIniciales();

    }, []);
    // =========================
    // CARGAR FILTROS DINAMICOS
    // =========================
useEffect(() => {

    const currentFilters = {
        ...filters,
        anio: Array.isArray(filters.anio) ? filters.anio.join(",") : "",
        mes:  Array.isArray(filters.mes)  ? filters.mes.join(",")  : ""
    };

    debouncedLoadData(currentFilters);

    if (!filters.nro_parte.trim()) setResultadoParte(null);

    return () => { debouncedLoadData.cancel(); };

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [JSON.stringify(filters)]);

        // ====================================
        // INPUT -> FILTRO GLOBAL
        // ====================================

        useEffect(() => {

            debouncedNroParte(inputParte);

            return () => {

                debouncedNroParte.cancel();

            };

        }, [inputParte, debouncedNroParte]);

    const money = (n) =>
        Number(n || 0).toLocaleString("es-PE", {
            style: "currency",
            currency: "PEN"
        });




    // =========================
    // OPTIONS REACT-SELECT
    // =========================

    const acuerdosOptions = useMemo(() => {

        return acuerdos.map((a) => ({
            value: a.codigo_acuerdo_marco,
            label: a.codigo_acuerdo_marco
        }));

    }, [acuerdos]);


    const categoriasOptions = useMemo(() => {

        return categorias.map((c) => ({
            value: c.categoria,
            label: c.categoria
        }));

    }, [categorias]);

    const categoriasSeleccionadas = useMemo(() => {

        if (!filters.categoria) return [];

        if (Array.isArray(filters.categoria)) {
            return filters.categoria;
        }

        return filters.categoria
            ? filters.categoria.split(",").filter(Boolean)
            : [];

    }, [filters.categoria]);

    // =========================
    // ASYNC ENTIDADES
    // =========================

    const loadEntidades = async (inputValue) => {

        try {

            const res = await api.get(
                "/api/analytics/entidades",
                {
                    params: {
                        search: inputValue
                    }
                }
            );

            const fetchedOptions = res.data.map((e) => ({
                value: `${e.ruc_entidad}|||${e.razon_social_entidad}`,

                label: `${e.ruc_entidad} - ${e.razon_social_entidad}`,

                ruc: e.ruc_entidad,

                razon: e.razon_social_entidad
            }));

            const mergedOptions = [
                ...entidadSelected.filter(sel =>
                    fetchedOptions.every(opt => opt.value !== sel.value)
                ),
                ...fetchedOptions
            ];

            return orderSelectedFirst(
                mergedOptions,
                entidadSelected
            );

        } catch (err) {

            console.log(err);

            return [];
        }
    };

    // =========================
    // ASYNC PROVEEDORES
    // =========================

const loadProveedores = async (inputValue) => {

    try {

        const res = await api.get(
            "/api/analytics/lista-proveedores",
            {
                params: {
                    search: inputValue
                }
            }
        );

        const fetchedOptions = res.data.map((p) => ({
            value: `${p.ruc_proveedor}|||${p.razon_social_proveedor}`,

            label: `${p.ruc_proveedor} - ${p.razon_social_proveedor}`,

            ruc: p.ruc_proveedor,

            razon: p.razon_social_proveedor
        }));

        // 🔥 unimos seleccionados + resultados
        const mergedOptions = [

            ...proveedorSelected.filter(sel =>
                fetchedOptions.every(
                    opt => opt.value !== sel.value
                )
            ),

            ...fetchedOptions
        ];

        // 🔥 seleccionados arriba SIEMPRE
        return orderSelectedFirst(
            mergedOptions,
            proveedorSelected
        );

    } catch (err) {

        console.log(err);

        return [];
    }
};
    const buscarNroParte = async (currentFilters) => {

        try {

            if (!currentFilters.nro_parte.trim()) {
                return;
            }

            const res = await api.get(
                "/api/analytics/buscar-nro-parte",
                {
                params: currentFilters
                }
            );

            setResultadoParte(res.data);

        } catch (err) {

            console.log(err);
        }
    };


    const cargarEntidades = async (currentFilters) => {
        try {
            const res = await api.get("/api/analytics/entidades-totales", {
                params: currentFilters
            });

            setTablaEntidades(res.data);

        } catch (err) {
            console.log(err);
        }
    };








    // =========================
    // UI
    // =========================
    return (
        <div className="dashboard-page">

            {/* HEADER */}
            {/* ========================= */}
            {/* KPIS */}
            {/* ========================= */}
            <div className="kpi-grid">

                <div className="kpi-card">
                    <div className="kpi-icon"><BadgeDollarSign /></div>
                    <div>
                        <span>Ventas</span>
                        <h2>{money(resumen.ventas)}</h2>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon"><ShoppingCart /></div>
                    <div>
                        <span>Órdenes</span>
                        <h2>{resumen.ordenes}</h2>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon"><Building2 /></div>
                    <div>
                        <span>Entidades</span>
                        <h2>{resumen.entidades}</h2>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon"><Package /></div>
                    <div>
                        <span>Marcas</span>
                        <h2>{resumen.marcas}</h2>
                    </div>
                </div>

            </div>


             {/* TODO TU CONTENIDO DE FILTROS IGUAL (NO CAMBIAR NADA) */}

            {/* FILTROS PRO (1 x 8 HORIZONTAL) */}
            <div className="filters-container">


                <div className="filters-grid-horizontal">

                    {/* Acuerdo Marco */}
                    {/* Acuerdo */}
                    <div className="filter-item small">

                        <label>Acuerdo</label>

                        <Select

                            className="react-select-container"
                            classNamePrefix="react-select"

                            options={acuerdosOptions}

                            placeholder="Buscar acuerdo..."

                            isClearable

                            value={
                                filters.acuerdo_marco
                                    ? acuerdosOptions.find(
                                        (option) =>
                                            option.value === filters.acuerdo_marco
                                    )
                                    : null
                            }

                            onChange={(selected) => {

                                setFilters(prev => ({
                                    ...prev,
                                    acuerdo_marco: selected
                                        ? selected.value
                                        : ""
                                }));

                            }}
                        />

                    </div>

                    {/* Entidad */}
                    {/* Entidad */}
                    <div className="filter-item small">

                        <label>Entidad</label>

                        <AsyncSelect
                            isMulti
                            key={filters.entidad}
                            cacheOptions
                            defaultOptions
                            filterOption={() => true}
                            loadOptions={loadEntidades}
                            closeMenuOnSelect={false}
                            blurInputOnSelect={false}
                            hideSelectedOptions={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder={
                                entidadSelected?.length > 0
                                    ? `${entidadSelected.length} entidades seleccionadas`
                                    : "Buscar entidad..."
                            }
                            isClearable
                            value={entidadSelected}

                            controlShouldRenderValue={false}   // 🔥 CLAVE

                            components={{
                                MultiValue: MultiValueContainer   // 🔥 CLAVE
                            }}

                            styles={{
                                option: (base, state) => {
                                    const isSelected = state.isSelected;

                                    return {
                                        ...base,
                                        backgroundColor: isSelected
                                            ? "#4338ca"
                                            : state.isFocused
                                            ? "#1e293b"
                                            : "#0f172a",

                                        color: "#ffffff",
                                        fontWeight: isSelected ? 700 : 500,
                                        borderBottom: "1px solid #1e293b",
                                        cursor: "pointer",

                                        ":hover": {
                                            backgroundColor: isSelected
                                                ? "#4338ca"
                                                : "#1e293b"
                                        }
                                    };
                                }
                            }}

onChange={(selected) => {

    const newSelected = selected || [];

    setEntidadSelected(newSelected);

    setFilters(prev => ({

        ...prev,

        entidad: newSelected.length
            ? newSelected.map(item => item.ruc).join(",")
            : "",

        entidad_razon: newSelected.length
            ? newSelected.map(item => item.razon).join("|||")
            : ""
    }));
}}
                        />

                    </div>

                    {/* Proveedor */}
                    {/* Proveedor */}
                    <div className="filter-item small">

                        <label>Proveedor</label>
                            <AsyncSelect

                                key={filters.proveedor}

                                

                           
                                isMulti

                                cacheOptions

                                defaultOptions={true}
                              
                           

                                loadOptions={loadProveedores}
                                 closeMenuOnSelect={false}
                                 blurInputOnSelect={false}
                                menuShouldScrollIntoView={false}
                                hideSelectedOptions={false}

                                

                                controlShouldRenderValue={false}

                                components={{
                                    MultiValue: MultiValueContainer
                                }}

                                className="react-select-container"

                                classNamePrefix="react-select"

                                placeholder={
                                    proveedorSelected?.length > 0
                                        ? `${proveedorSelected.length} proveedores seleccionados`
                                        : "Buscar proveedor..."
                                }

                                isClearable

                                value={proveedorSelected}

                                styles={{
                                    option: (base, state) => {

                                        const isSelected = state.isSelected;

                                        return {

                                            ...base,

                                            backgroundColor: isSelected
                                                ? "#4338ca"
                                                : state.isFocused
                                                ? "#1e293b"
                                                : "#0f172a",

                                            color: "#ffffff",

                                            fontWeight: isSelected ? 700 : 500,

                                            borderBottom: "1px solid #1e293b",

                                            cursor: "pointer",

                                            transition: "background-color .12s ease",

                                            ":hover": {
                                                backgroundColor: isSelected
                                                    ? "#4338ca"
                                                    : "#1e293b"
                                            },

                                            ":active": {
                                                backgroundColor: isSelected
                                                    ? "#4338ca"
                                                    : "#1e293b"
                                            }
                                        };
                                    },

                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: "#0f172a"
                                    }),

                                    multiValue: () => ({
                                        display: "none"
                                    })
                                }}

                                onChange={(selected) => {

                                    const newSelected = selected || [];

                                    setProveedorSelected(newSelected);



                                    setFilters(prev => ({
                                        ...prev,

                                        proveedor:
                                            newSelected.length
                                                ? newSelected.map(item => item.ruc).join(",")
                                                : ""
                                    }));
                                }}
                            />

                    </div>

                    {/* Categoría */}
                    {/* Categoría */}
                    <div className="filter-item small">

                        <label>Categoría</label>

                        <Select
                            isMulti

                            className="react-select-container"
                            classNamePrefix="react-select"

                            options={orderSelectedFirst(
                                [
                                    ...categoriasOptions.filter(opt =>
                                        categoriasSeleccionadas.includes(opt.value)
                                    ),

                                    ...categoriasOptions.filter(
                                        opt =>
                                            !categoriasSeleccionadas.includes(opt.value)
                                    )
                                ],

                                categoriasOptions.filter(opt =>
                                    categoriasSeleccionadas.includes(opt.value)
                                )
                            )}

                            hideSelectedOptions={false}

                            closeMenuOnSelect={true}

                            controlShouldRenderValue={false}


                            components={{
                                MultiValue: MultiValueContainer
                            }}

                            placeholder={
                                categoriasSeleccionadas.length > 0
                                    ? `${categoriasSeleccionadas.length} categorías seleccionadas`
                                    : "Buscar categoría..."
                            }

                            isClearable

                            value={categoriasSeleccionadas.map(v => ({
                                value: v,
                                label: v
                            }))}

                            styles={{
                                option: (base, state) => {

                                    const isSelected = state.isSelected;

                                    return {

                                        ...base,

                                        backgroundColor: isSelected
                                            ? "#4338ca"
                                            : state.isFocused
                                            ? "#1e293b"
                                            : "#0f172a",

                                        color: "#ffffff",

                                        fontWeight: isSelected ? 700 : 500,

                                        borderBottom: "1px solid #1e293b",

                                        cursor: "pointer",

                                        transition: "background-color .12s ease",

                                        ":hover": {
                                            backgroundColor: isSelected
                                                ? "#4338ca"
                                                : "#1e293b"
                                        },

                                        ":active": {
                                            backgroundColor: isSelected
                                                ? "#4338ca"
                                                : "#1e293b"
                                        }
                                    };
                                },

                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: "#0f172a"
                                }),

                                multiValue: () => ({
                                    display: "none"
                                })
                            }}

                            onChange={(selected, actionMeta) => {

                                if (actionMeta.action === "clear") {
                                    setFilters(prev => ({
                                        ...prev,
                                        categoria: ""
                                    }));
                                    return;
                                }

                                const values = selected
                                    ? selected.map(item => item.value)
                                    : [];

                                setFilters(prev => ({
                                    ...prev,
                                    categoria: values.length ? values.join(",") : ""
                                }));
                            }}
                        />

                    </div>

                    {/* Año */}
                    <div className="filter-item small">
                        <label>Año</label>
 <Select
    isMulti
    className="react-select-container"
    classNamePrefix="react-select"
    options={anios.map(a => ({
        value: a.anio,
        label: a.anio
    }))}
    value={filters.anio.map(v => ({
        value: v,
        label: v
    }))}
    placeholder={
        filters.anio.length > 0
            ? `${filters.anio.length} años seleccionados`
            : "Buscar año..."
    }
    isClearable
    controlShouldRenderValue={false}
    components={{ MultiValue: MultiValueContainer }}
    hideSelectedOptions={false}
    onChange={(selected) => {
        const values = selected
            ? selected.map(item => item.value)
            : [];

        setFilters(prev => ({
            ...prev,
            anio: values
        }));
    }}
/>
                    </div>

                    {/* Mes */}
                    <div className="filter-item small">
                        <label>Mes</label>
  <Select
    isMulti
    className="react-select-container"
    classNamePrefix="react-select"
    options={meses.map((m, i) => ({
        value: i + 1,
        label: nombresMeses[i]
    }))}
    value={filters.mes.map(v => ({
        value: v,
        label: nombresMeses[v - 1]
    }))}
    placeholder={
        filters.mes.length > 0
            ? `${filters.mes.length} meses seleccionados`
            : "Buscar mes..."
    }
    isClearable
    controlShouldRenderValue={false}
    components={{ MultiValue: MultiValueContainer }}
    hideSelectedOptions={false}
    onChange={(selected) => {
        const values = selected
            ? selected.map(item => item.value)
            : [];

        setFilters(prev => ({
            ...prev,
            mes: values
        }));
    }}
/>
                    </div>

                </div>
            </div>



            {/* ========================= */}
            {/* FILTROS + UBIGEO GRID */}
            {/* ========================= */}

<div className="top-grid-container">

    {/* IZQUIERDA */}
    <div className="entidades-container">

  
            <div className="card-header"></div>

            <div className="table-container">

                <table>

                    <thead>

                        <tr>

                            <th className="col-entidad">
                                Entidad
                            </th>

                            <th className="col-subtotal-mini">

                                <div>Subtotal</div>

                                <div className="subtotal-total-header">
                                    {money(resumen.ventas)}
                                </div>

                            </th>

                            <th className="col-percent-mini">

                                <div>%</div>

                                <div className="subtotal-total-header">
                                    100%
                                </div>

                            </th>

                            <th className="col-ordenes-mini">
                                Órdenes
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {(() => {

                            const maxSubtotal = Math.max(
                                ...tablaEntidades.map(
                                    e => Number(e.subtotal || 0)
                                )
                            );

                            return tablaEntidades.map((e, i) => {

                                const barPercent =
                                    (e.subtotal / maxSubtotal) * 100;

                                const totalPercent =
                                    (e.subtotal / resumen.ventas) * 100;

                                return (

                                    <tr key={i}>

                                        {/* ENTIDAD */}
                                        <td className="col-entidad">
                                            {e.entidad}
                                        </td>

                                        {/* SUBTOTAL */}
                                        <td className="col-subtotal-mini">

                                            <div className="subtotal-cell-mini">

                                                <div
                                                    className="subtotal-bar-mini"
                                                    style={{
                                                        width: `${barPercent}%`
                                                    }}
                                                />

                                                <div className="subtotal-content-mini">

                                                    {money(e.subtotal)}

                                                </div>

                                            </div>

                                        </td>

                                        {/* PORCENTAJE */}
                                        <td className="col-percent-mini">

                                            <div className="percent-cell-mini">

                                                <div
                                                    className="percent-bar-mini"
                                                    style={{
                                                        width: `${barPercent}%`
                                                    }}
                                                />

                                                <div className="percent-text-mini">

                                                    {totalPercent.toFixed(2)}%

                                                </div>

                                            </div>

                                        </td>

                                        {/* ORDENES */}
                                        <td className="col-ordenes-mini">
                                            {e.ordenes}
                                        </td>

                                    </tr>

                                );

                            });

                        })()}

                    </tbody>

                </table>

            </div>

    </div>

    {/* 🔥 CENTRO (NUEVA TABLA) */}
    {/* 🔥 CENTRO */}
    <div className="centro-container">

        <div className="card-header">
            <h3>Buscar Nro Parte</h3>
        </div>

        <div className="busqueda-parte">

            <input
                type="text"
                placeholder="Escribe nro_parte..."
                value={inputParte}
                onChange={(e) => {

                    setInputParte(e.target.value);

                }}
            />


        </div>

        {
            
            resultadoParte && (

                <>

                    {/* CARDS ARRIBA */}
                    <div className="resultado-parte">

                        <div className="resultado-card">
                            <span>Precio mínimo</span>

                            <h2>
                                {money(resultadoParte.precio_minimo)}
                            </h2>
                        </div>

                        <div className="resultado-card">
                            <span>Precio promedio</span>

                            <h2>
                                {money(resultadoParte.precio_promedio)}
                            </h2>
                        </div>

                        <div className="resultado-card">
                            <span>Precio máximo</span>

                            <h2>
                                {money(resultadoParte.precio_maximo)}
                            </h2>
                        </div>

                    </div>

                    {/* IMAGEN ABAJO */}
                    {
                        resultadoParte?.imagen_url && (

                            <div className="parte-imagen-container">

                                <img
                                    src={resultadoParte.imagen_url}
                                    alt="producto"
                                    loading="lazy"
                                    className="parte-imagen"
                                />

                            </div>
                        )
                    }

                </>
            )
        }

    </div>

    {/* DERECHA */}
    <div className="ubigeo-container">

        <div className="ubigeo-title"></div>

        <div className="departamentos-grid">

            <button
                className={!filters.departamento ? "dep-btn active" : "dep-btn"}
                onClick={() =>
                    setFilters(prev => ({
                        ...prev,
                        departamento: ""
                    }))
                }
            >
                TODOS
            </button>

            {departamentos.map((d, i) => (
                <button
                    key={i}
                    className={
                        filters.departamento === d.dep_entrega
                            ? "dep-btn active"
                            : "dep-btn"
                    }
                    onClick={() =>
                    setFilters(prev => ({
                        ...prev,
                        departamento: d.dep_entrega
                    }))
                    }
                >
                    {d.dep_entrega}
                </button>
            ))}

        </div>

    </div>

</div>
 



            {/* ========================= */}
            {/* TABLAS */}
            {/* ========================= */}




            {/* ========================= */}
            {/* TABLAS (1 x 2 GRID) */}
            {/* ========================= */}

            <div className="tables-grid">

                <div className="dashboard-card">
                    <div className="card-header">
                    <OrdenesDetalleTable
                        filters={{
                            ...filters,

                            anio: Array.isArray(filters.anio)
                                ? filters.anio.join(",")
                                : "",

                            mes: Array.isArray(filters.mes)
                                ? filters.mes.join(",")
                                : ""
                        }}
                        page={1}
                    />
                        
                    </div>

                   
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                  
                    </div>

                                    
                <RankingProveedoresTable
                    filters={{
                        ...filters,

                        anio: Array.isArray(filters.anio)
                            ? filters.anio.join(",")
                            : "",

                        mes: Array.isArray(filters.mes)
                            ? filters.mes.join(",")
                            : ""
                    }}
                    totalVentas={resumen.ventas}
                />
                </div>

            </div>

        </div>
    );
}