import { useState, useEffect, useRef, useCallback } from "react"
import { getHistorico, deleteTransacao } from "../services/api"

export default function Historico({ user, refreshKey }) {
    const [historico, setHistorico] = useState(null)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [filters, setFilters] = useState({ dataInicio: "", dataFim: "", categoria: "", tipo: "" })
    const filtersRef = useRef(filters)

    // Keep ref in sync
    useEffect(() => { filtersRef.current = filters }, [filters])

    // Fetch function that reads from ref, not closure
    const fetchData = useCallback((currentPage = 0, currentFilters = null) => {
        if (!user) return
        setLoading(true)
        const f = currentFilters ?? filtersRef.current
        getHistorico(user, { page: currentPage, ...f })
            .then(setHistorico)
            .catch(() => setHistorico(null))
            .finally(() => setLoading(false))
    }, [user])

    // Initial load
    useEffect(() => { fetchData(0) }, [fetchData])

    // Refresh on tab change or new transaction
    useEffect(() => {
        fetchData(0)
    }, [refreshKey])

    // Refresh when filters change
    useEffect(() => {
        fetchData(0)
    }, [filters])

    async function handleDelete(id) {
        if (!confirm("Deletar esta transacao?")) return
        const result = await deleteTransacao(id, user)
        if (result.ok) fetchData(page)
        else alert(result.data)
    }

    function handleFilterChange(key, value) {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    function clearFilters() {
        setFilters({ dataInicio: "", dataFim: "", categoria: "", tipo: "" })
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "2-digit",
            hour: "2-digit", minute: "2-digit"
        })
    }

    return (
        <div className="historico">
            <h2>Historico de Transacoes</h2>

            <div className="filtros">
                <input
                    type="date"
                    value={filters.dataInicio}
                    onChange={e => handleFilterChange("dataInicio", e.target.value)}
                />
                <input
                    type="date"
                    value={filters.dataFim}
                    onChange={e => handleFilterChange("dataFim", e.target.value)}
                />
                <input
                    type="text"
                    value={filters.categoria}
                    onChange={e => handleFilterChange("categoria", e.target.value)}
                    placeholder="Categoria"
                />
                <select
                    value={filters.tipo}
                    onChange={e => handleFilterChange("tipo", e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="gasto">Gastos</option>
                    <option value="receita">Receitas</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-skeleton">
                    {[...Array(5)].map((_, i) => <div key={i} className="skeleton-row" />)}
                </div>
            ) : historico?.content?.length > 0 ? (
                <>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Tipo</th>
                                    <th>Valor</th>
                                    <th>Categoria</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {historico.content.map(item => (
                                    <tr key={item.id}>
                                        <td>{formatDate(item.createdAt)}</td>
                                        <td>
                                            <span className={`badge ${item.tipo === "gasto" ? "badge-gasto" : "badge-receita"}`}>
                                                {item.tipo === "gasto" ? "Gasto" : "Receita"}
                                            </span>
                                        </td>
                                        <td className="valor">R$ {item.valor.toFixed(2)}</td>
                                        <td>{item.categoria}</td>
                                        <td>
                                            <button className="btn-delete" onClick={() => handleDelete(item.id)} title="Deletar">
                                                x
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {historico.totalElements > 50 && (
                        <div className="paginacao">
                            <button disabled={page === 0} onClick={() => { setPage(p => p - 1); fetchData(page - 1) }}>
                                Anterior
                            </button>
                            <span>Pagina {historico.number + 1} de {historico.totalPages}</span>
                            <button disabled={page >= historico.totalPages - 1} onClick={() => { setPage(p => p + 1); fetchData(page + 1) }}>
                                Proxima
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="empty-state">Nenhuma transacao encontrada.</p>
            )}
        </div>
    )
}
