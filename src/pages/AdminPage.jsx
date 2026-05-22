import { useState, useEffect } from "react";
import api from "..src/services/api";
import socket from "..src/services/socket";
import Layout from "../layout/Layout";
import "./AdminPage.css";

export default function AdminPage() {

    // =========================
    // STATE PRINCIPAL
    // =========================
    const [clientes, setClientes] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [detalleOpen, setDetalleOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");

    const [modoEdicion, setModoEdicion] = useState(false);

    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);

    const [search, setSearch] = useState("");
    const [filtro, setFiltro] = useState("Todos");

    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        id: null,
        nombre: "",
        correo: "",
        telefono: "",
        empresa: "",
        estado: "Potencial"
    });

    // =========================
    // 🔥 CARGA INICIAL (1 sola vez)
    // =========================
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const res = await api.get("/api/clientes");
                setClientes(res.data);
            } catch (err) {
                console.error("Error cargando clientes:", err);
            }
        };

        fetchClientes();
    }, []);

    // =========================
    // 🔥 SOCKET REAL TIME
    // =========================
    useEffect(() => {

        socket.on("cliente:created", (nuevo) => {
            setClientes(prev => {

                const existe = prev.some(c => c.id === nuevo.id);

                if (existe) return prev;

                return [...prev, nuevo];
            });
        });

        socket.on("cliente:updated", (updated) => {
            setClientes(prev =>
                prev.map(c =>
                    c.id === updated.id
                        ? { ...c, ...updated }
                        : c
                )
            );
        });

        socket.on("cliente:deleted", ({ id }) => {
            setClientes(prev =>
                prev.filter(c => c.id !== id)
            );
        });

        return () => {
            socket.off("cliente:created");
            socket.off("cliente:updated");
            socket.off("cliente:deleted");
        };

    }, []);

    // =========================
    // FILTER LOGIC
    // =========================
    const clientesFiltrados = (clientes || []).filter((c) => {

        const texto = search.toLowerCase();

        const nombre = c.nombre || "";
        const correo = c.correo || "";
        const empresa = c.empresa || "";
        const telefono = c.telefono || "";
        const estado = (c.estado ?? "Potencial");

        const matchSearch =
            nombre.toLowerCase().includes(texto) ||
            correo.toLowerCase().includes(texto) ||
            empresa.toLowerCase().includes(texto) ||
            telefono.toLowerCase().includes(texto);

        const matchFiltro =
            filtro === "Todos" ? true : estado === filtro;

        return matchSearch && matchFiltro;
    });

    // =========================
    // MODALES
    // =========================
    const abrirCrear = () => {
        limpiar();
        setModalOpen(true);
    };

    const abrirEditar = (c) => {
        setForm(c);
        setModoEdicion(true);
        setModalOpen(true);
    };

    const verCliente = async (id) => {
        const res = await api.get(`/api/clientes/${id}`);
        setClienteSeleccionado(res.data);
        setDetalleOpen(true);
    };

    const limpiar = () => {
        setForm({
            id: null,
            nombre: "",
            correo: "",
            telefono: "",
            empresa: "",
            estado: "Potencial"
        });
        setModoEdicion(false);
        setErrors({});
    };

    // =========================
    // VALIDACIÓN
    // =========================
    const validar = () => {
        let e = {};

        if (!form.nombre.trim()) e.nombre = "Nombre obligatorio";
        if (!form.correo.includes("@")) e.correo = "Correo inválido";
        if (!form.telefono.trim()) e.telefono = "Teléfono obligatorio";
        if (!form.empresa.trim()) e.empresa = "Empresa obligatoria";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // =========================
    // CRUD (SIN REACT QUERY)
    // =========================

    const crearCliente = async () => {
        if (!validar()) return;

        await api.post("/api/clientes", form);
        setModalOpen(false);
        limpiar();
        toastMsg("Cliente creado");
    };

    const actualizarCliente = async () => {
        if (!validar()) return;

        await api.put(`/api/clientes/${form.id}`, form);
        setModalOpen(false);
        limpiar();
        toastMsg("Cliente actualizado");
    };

    const eliminarCliente = async (id) => {
        await api.delete(`/api/clientes/${id}`);
        setConfirmDelete(false);
        setClienteAEliminar(null);
        toastMsg("Cliente eliminado");
    };

    const toastMsg = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    };

    // =========================
    // UI
    // =========================
    return (
        <Layout rol="ADMIN">

            <div className="erp-container">

                {/* HEADER */}
                <div className="erp-header">
                    <div>
                        <h1>CRM VENTAS</h1>
                        <p>Automatización de procesos</p>
                    </div>

                    <button className="btn-primary" onClick={abrirCrear}>
                        + Nuevo Cliente
                    </button>
                </div>

                {/* TOOLBAR */}
                <div className="erp-toolbar">

                    <div className="search-box">
                        <input
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filter-box">
                        {["Todos", "Potencial", "Activo", "Inactivo"].map((f) => (
                            <button
                                key={f}
                                className={`filter-pill ${filtro === f ? "active" : ""}`}
                                onClick={() => setFiltro(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                </div>

                {/* LISTA */}
                <div className="grid">

                    {clientesFiltrados.map(c => (
                        <div className="card" key={c.id}>

                            <div className="card-top">
                                <h3>{c.nombre}</h3>
                                <span className={`badge ${(c.estado ?? "Potencial").toLowerCase()}`}>
                                    {c.estado}
                                </span>
                            </div>

                            <p>{c.correo}</p>
                            <p>{c.empresa}</p>

                            <div className="actions">
                                <button onClick={() => verCliente(c.id)}>Ver</button>
                                <button onClick={() => abrirEditar(c)}>Editar</button>
                                <button onClick={() => {
                                    setClienteAEliminar(c);
                                    setConfirmDelete(true);
                                }}>
                                    Eliminar
                                </button>
                            </div>

                        </div>
                    ))}

                </div>

                {/* MODAL */}
                {modalOpen && (
                    <div className="overlay">
                        <div className="modal">

                            <h2>{modoEdicion ? "Editar" : "Nuevo Cliente"}</h2>

                            <input
                                placeholder="Nombre"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            />

                            <input
                                placeholder="Correo"
                                value={form.correo}
                                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                            />

                            <input
                                placeholder="Teléfono"
                                value={form.telefono}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                            />

                            <input
                                placeholder="Empresa"
                                value={form.empresa}
                                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                            />

                            <select
                                value={form.estado}
                                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                            >
                                <option>Potencial</option>
                                <option>Activo</option>
                                <option>Inactivo</option>
                            </select>

                            <div className="modal-actions">
                                {!modoEdicion ? (
                                    <button onClick={crearCliente}>Guardar</button>
                                ) : (
                                    <button onClick={actualizarCliente}>Actualizar</button>
                                )}

                                <button onClick={() => setModalOpen(false)}>Cancelar</button>
                            </div>

                        </div>
                    </div>
                )}

                {/* DELETE */}
                {confirmDelete && (
                    <div className="overlay">
                        <div className="modal confirm">

                            <h2>Eliminar cliente?</h2>
                            <p>{clienteAEliminar?.nombre}</p>

                            <button onClick={() => eliminarCliente(clienteAEliminar.id)}>
                                Sí eliminar
                            </button>

                            <button onClick={() => setConfirmDelete(false)}>
                                Cancelar
                            </button>

                        </div>
                    </div>
                )}

                {/* TOAST */}
                {toast && <div className="toast">{toast}</div>}

            </div>

        </Layout>
    );
}