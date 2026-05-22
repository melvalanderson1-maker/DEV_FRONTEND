import { useEffect, useState } from "react";

import api from "../../../services/api";
import socket from "../../../services/socket";

import PermissionButton from "../../../components/PermissionButton";

import "./UsuariosPage.css";

export default function UsuariosPage() {

    // =====================================================
    // STATE
    // =====================================================

    const [usuarios, setUsuarios] = useState([]);

    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);

    const [modoEdicion, setModoEdicion] = useState(false);

    const [toast, setToast] = useState("");

    const [search, setSearch] = useState("");

    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const [confirmDelete, setConfirmDelete] = useState(false);

    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        id: null,
        nombre: "",
        correo: "",
        telefono: "",
        empresa: "",
        estado: "Potencial"
    });

    // =====================================================
    // USER LOGUEADO
    // =====================================================

    const user = JSON.parse(localStorage.getItem("user"));

    const esAdmin = user?.rol === "ADMIN";

    // =====================================================
    // FETCH
    // =====================================================

    useEffect(() => {

        obtenerUsuarios();

    }, []);

    const obtenerUsuarios = async () => {

        try {

            setLoading(true);

            // 🔥 USA CLIENTES COMO PEDISTE
            const res = await api.get("/api/clientes");

            setUsuarios(res.data);

        } catch (error) {

            console.log("ERROR OBTENIENDO CLIENTES:", error);

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // SOCKET
    // =====================================================

    useEffect(() => {

        socket.on("cliente:created", (nuevo) => {

            setUsuarios(prev => {

                const existe = prev.some(u => u.id === nuevo.id);

                if (existe) return prev;

                return [...prev, nuevo];

            });

        });

        socket.on("cliente:updated", (updated) => {

            setUsuarios(prev =>
                prev.map(u =>
                    u.id === updated.id
                        ? { ...u, ...updated }
                        : u
                )
            );

        });

        socket.on("cliente:deleted", ({ id }) => {

            setUsuarios(prev =>
                prev.filter(u => u.id !== id)
            );

        });

        return () => {

            socket.off("cliente:created");
            socket.off("cliente:updated");
            socket.off("cliente:deleted");

        };

    }, []);

    // =====================================================
    // FILTRO
    // =====================================================

    const usuariosFiltrados = usuarios.filter((u) => {

        const texto = search.toLowerCase();

        return (
            u.nombre?.toLowerCase().includes(texto) ||
            u.correo?.toLowerCase().includes(texto) ||
            u.empresa?.toLowerCase().includes(texto) ||
            u.telefono?.toLowerCase().includes(texto)
        );

    });

    // =====================================================
    // VALIDACIÓN
    // =====================================================

    const validar = () => {

        let e = {};

        if (!form.nombre.trim()) {
            e.nombre = "Nombre obligatorio";
        }

        if (!form.correo.includes("@")) {
            e.correo = "Correo inválido";
        }

        if (!form.telefono.trim()) {
            e.telefono = "Teléfono obligatorio";
        }

        if (!form.empresa.trim()) {
            e.empresa = "Empresa obligatoria";
        }

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    // =====================================================
    // MODALES
    // =====================================================

    const abrirCrear = () => {

        limpiar();

        setModoEdicion(false);

        setModalOpen(true);

    };

    const abrirEditar = (usuario) => {

        setForm({
            id: usuario.id,
            nombre: usuario.nombre || "",
            correo: usuario.correo || "",
            telefono: usuario.telefono || "",
            empresa: usuario.empresa || "",
            estado: usuario.estado || "Potencial"
        });

        setModoEdicion(true);

        setModalOpen(true);

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

        setErrors({});
    };

    // =====================================================
    // CRUD
    // =====================================================

    const crearUsuario = async () => {

        if (!validar()) return;

        try {

            // 🔥 USA CLIENTES
            await api.post("/api/clientes", form);

            setModalOpen(false);

            limpiar();

            toastMsg("Cliente creado");

        } catch (error) {

            console.log(error);

        }
    };

    const actualizarUsuario = async () => {

        if (!validar()) return;

        try {

            // 🔥 USA CLIENTES
            await api.put(
                `/api/clientes/${form.id}`,
                form
            );

            setModalOpen(false);

            limpiar();

            toastMsg("Cliente actualizado");

        } catch (error) {

            console.log(error);

        }
    };

    const eliminarUsuario = async (id) => {

        try {

            // 🔥 USA CLIENTES
            await api.delete(`/api/clientes/${id}`);

            setConfirmDelete(false);

            setUsuarioSeleccionado(null);

            toastMsg("Cliente eliminado");

        } catch (error) {

            console.log(error);

        }
    };

    // =====================================================
    // TOAST
    // =====================================================

    const toastMsg = (msg) => {

        setToast(msg);

        setTimeout(() => {

            setToast("");

        }, 2500);

    };

    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="usuarios-container">

            {/* HEADER */}
            <div className="usuarios-header">

                <div>
                    <h1>GESTIÓN DE CLIENTES</h1>
                    <p>Administración del sistema</p>
                </div>

                {esAdmin && (

                    <button
                        className="btn-primary"
                        onClick={abrirCrear}
                    >
                        + Nuevo Cliente
                    </button>

                )}

            </div>

            {/* TOOLBAR */}
            <div className="usuarios-toolbar">

                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </div>

            {/* GRID */}
            {loading ? (

                <div className="loading">
                    Cargando clientes...
                </div>

            ) : (

                <div className="usuarios-grid">

                    {usuariosFiltrados.map((u) => (

                        <div
                            className="usuario-card"
                            key={u.id}
                        >

                            <div className="usuario-top">

                                <div className="avatar">
                                    {u.nombre?.charAt(0)}
                                </div>

                                <div>

                                    <h3>{u.nombre}</h3>

                                    <p>{u.correo}</p>

                                </div>

                            </div>

                            <div className="rol-badge">
                                {u.estado}
                            </div>

                            <p>{u.empresa}</p>

                            <p>{u.telefono}</p>

                            {/* ADMIN */}
                            {esAdmin && (

                                <div className="actions">

                                    <button
                                        onClick={() => abrirEditar(u)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="danger"
                                        onClick={() => {
                                            setUsuarioSeleccionado(u);
                                            setConfirmDelete(true);
                                        }}
                                    >
                                        Eliminar
                                    </button>

                                </div>

                            )}

                        </div>

                    ))}

                </div>

            )}

            {/* MODAL */}
            {modalOpen && (

                <div className="overlay">

                    <div className="modal">

                        <h2>
                            {modoEdicion
                                ? "Editar Cliente"
                                : "Nuevo Cliente"}
                        </h2>

                        <input
                            placeholder="Nombre"
                            value={form.nombre}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    nombre: e.target.value
                                })
                            }
                        />

                        {errors.nombre && (
                            <span className="error">
                                {errors.nombre}
                            </span>
                        )}

                        <input
                            placeholder="Correo"
                            value={form.correo}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    correo: e.target.value
                                })
                            }
                        />

                        {errors.correo && (
                            <span className="error">
                                {errors.correo}
                            </span>
                        )}

                        <input
                            placeholder="Teléfono"
                            value={form.telefono}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    telefono: e.target.value
                                })
                            }
                        />

                        {errors.telefono && (
                            <span className="error">
                                {errors.telefono}
                            </span>
                        )}

                        <input
                            placeholder="Empresa"
                            value={form.empresa}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    empresa: e.target.value
                                })
                            }
                        />

                        {errors.empresa && (
                            <span className="error">
                                {errors.empresa}
                            </span>
                        )}

                        <select
                            value={form.estado}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    estado: e.target.value
                                })
                            }
                        >
                            <option value="Potencial">
                                Potencial
                            </option>

                            <option value="Activo">
                                Activo
                            </option>

                            <option value="Inactivo">
                                Inactivo
                            </option>

                        </select>

                        <div className="modal-actions">

                            {!modoEdicion ? (

                                <button onClick={crearUsuario}>
                                    Guardar
                                </button>

                            ) : (

                                <button onClick={actualizarUsuario}>
                                    Actualizar
                                </button>

                            )}

                            <button
                                onClick={() => setModalOpen(false)}
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* DELETE */}
            {confirmDelete && (

                <div className="overlay">

                    <div className="modal confirm">

                        <h2>
                            ¿Eliminar cliente?
                        </h2>

                        <p>
                            {usuarioSeleccionado?.nombre}
                        </p>

                        <button
                            className="danger"
                            onClick={() =>
                                eliminarUsuario(
                                    usuarioSeleccionado.id
                                )
                            }
                        >
                            Sí eliminar
                        </button>

                        <button
                            onClick={() =>
                                setConfirmDelete(false)
                            }
                        >
                            Cancelar
                        </button>

                    </div>

                </div>

            )}

            {/* TOAST */}
            {toast && (
                <div className="toast">
                    {toast}
                </div>
            )}

        </div>
    );
}