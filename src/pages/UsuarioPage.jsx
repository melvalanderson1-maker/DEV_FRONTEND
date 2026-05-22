import { useEffect, useState } from "react";

import api from "../services/api";
import socket from "../services/socket";

import Layout from "../layout/Layout";

import PermissionButton from "../components/PermissionButton";

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

    const [form, setForm] = useState({
        id: null,
        nombre: "",
        email: "",
        password: "",
        rol: "USER"
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

            const res = await api.get("/api/usuarios");

            setUsuarios(res.data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // SOCKET
    // =====================================================

    useEffect(() => {

        socket.on("usuario:created", (nuevo) => {

            setUsuarios(prev => [...prev, nuevo]);

        });

        socket.on("usuario:updated", (updated) => {

            setUsuarios(prev =>
                prev.map(u =>
                    u.id === updated.id
                        ? updated
                        : u
                )
            );

        });

        socket.on("usuario:deleted", ({ id }) => {

            setUsuarios(prev =>
                prev.filter(u => u.id !== id)
            );

        });

        return () => {

            socket.off("usuario:created");
            socket.off("usuario:updated");
            socket.off("usuario:deleted");

        };

    }, []);

    // =====================================================
    // FILTRO
    // =====================================================

    const usuariosFiltrados = usuarios.filter((u) => {

        const texto = search.toLowerCase();

        return (
            u.nombre?.toLowerCase().includes(texto) ||
            u.email?.toLowerCase().includes(texto) ||
            u.rol?.toLowerCase().includes(texto)
        );

    });

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
            nombre: usuario.nombre,
            email: usuario.email,
            password: "",
            rol: usuario.rol
        });

        setModoEdicion(true);

        setModalOpen(true);

    };

    const limpiar = () => {

        setForm({
            id: null,
            nombre: "",
            email: "",
            password: "",
            rol: "USER"
        });

    };

    // =====================================================
    // CRUD
    // =====================================================

    const crearUsuario = async () => {

        try {

            await api.post("/api/usuarios", form);

            setModalOpen(false);

            limpiar();

            toastMsg("Usuario creado");

        } catch (error) {

            console.log(error);

        }
    };

    const actualizarUsuario = async () => {

        try {

            await api.put(
                `/api/usuarios/${form.id}`,
                form
            );

            setModalOpen(false);

            limpiar();

            toastMsg("Usuario actualizado");

        } catch (error) {

            console.log(error);

        }
    };

    const eliminarUsuario = async (id) => {

        try {

            await api.delete(`/api/usuarios/${id}`);

            setConfirmDelete(false);

            toastMsg("Usuario eliminado");

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

        <Layout>

            <div className="usuarios-container">

                {/* HEADER */}
                <div className="usuarios-header">

                    <div>
                        <h1>GESTIÓN DE USUARIOS</h1>
                        <p>Administración del sistema</p>
                    </div>

                    {esAdmin && (
                        <PermissionButton permiso="usuarios_crear">

                            <button
                                className="btn-primary"
                                onClick={abrirCrear}
                            >
                                + Nuevo Usuario
                            </button>

                        </PermissionButton>
                    )}

                </div>

                {/* TOOLBAR */}
                <div className="usuarios-toolbar">

                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                {/* GRID */}
                {loading ? (

                    <div className="loading">
                        Cargando usuarios...
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

                                        <p>{u.email}</p>

                                    </div>

                                </div>

                                <div className="rol-badge">
                                    {u.rol}
                                </div>

                                {/* ADMIN */}
                                {esAdmin && (

                                    <div className="actions">

                                        <PermissionButton permiso="usuarios_editar">

                                            <button
                                                onClick={() => abrirEditar(u)}
                                            >
                                                Editar
                                            </button>

                                        </PermissionButton>

                                        <PermissionButton permiso="usuarios_eliminar">

                                            <button
                                                className="danger"
                                                onClick={() => {
                                                    setUsuarioSeleccionado(u);
                                                    setConfirmDelete(true);
                                                }}
                                            >
                                                Eliminar
                                            </button>

                                        </PermissionButton>

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
                                    ? "Editar Usuario"
                                    : "Nuevo Usuario"}
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

                            <input
                                placeholder="Correo"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email: e.target.value
                                    })
                                }
                            />

                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value
                                    })
                                }
                            />

                            <select
                                value={form.rol}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        rol: e.target.value
                                    })
                                }
                            >
                                <option value="ADMIN">
                                    ADMIN
                                </option>

                                <option value="USER">
                                    USER
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
                                ¿Eliminar usuario?
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

        </Layout>
    );
}