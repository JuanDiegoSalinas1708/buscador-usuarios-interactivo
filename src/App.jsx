import { useState, useEffect } from "react";
import Card from './components/Card';
import SearchInput from './components/SearchInput';
import Navbar from './components/Navbar';
import axios from 'axios';

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const res = await axios.get('http://localhost:8000/usuarios');
        setUsuarios(res.data);
      } catch (err) {
        setError('Error al cargar usuarios');
        console.error("Error al cargar los usuarios:", err);
      }
    };
    obtenerUsuarios();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filtrados = usuarios.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      `${u.nombre} ${u.apellidos}`.toLowerCase().includes(term) ||
      u.perfil.toLowerCase().includes(term) ||
      u.intereses.toLowerCase().includes(term)
    );
  });

  const porPagina = 10;
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const usuariosPagina = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 bg-gray-100 text-gray-800 font-sans">
        <h1 className="text-2xl font-semibold text-center mb-6">Buscador de Usuarios</h1>

        <div className="flex justify-center mb-6">
          <SearchInput value={searchTerm} onChange={setSearchTerm} />
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-600">⏳ Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-gray-600">No se encontraron resultados.</p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-4">
              {usuariosPagina.map((u) => (
                <div key={u.id} onClick={() => setSelectedUser(u)} className="cursor-pointer">
                  <Card user={u} />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-8 text-sm">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPagina(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    pagina === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {pagina < totalPaginas && (
                <button
                  onClick={() => setPagina(pagina + 1)}
                  className="ml-2 px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Siguiente
                </button>
              )}
            </div>
          </>
        )}

        {selectedUser && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
            onClick={() => setSelectedUser(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-md w-full max-w-sm shadow-md relative"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-2 right-3 text-gray-400 hover:text-black"
              >
                ✖
              </button>
              <img
                src={selectedUser.foto}
                alt={selectedUser.nombre}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <h2 className="text-lg font-semibold text-center">
                {selectedUser.nombre} {selectedUser.apellidos}
              </h2>
              <p className="text-center text-gray-600">{selectedUser.perfil}</p>
              <p className="text-center text-gray-500 mt-1">{selectedUser.intereses}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
