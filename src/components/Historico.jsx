import { useState, useEffect, useRef, useCallback } from "react"
import { getHistorico, deleteTransacao, marcarComoPago } from "../services/api"

export default function Historico({ refreshKey }) {
    const [historico, setHistorico] = useState(null)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [filters, setFilters] = useState({ dataInicio: "", dataFim: "", categoria: "", tipo: "" })
    const filtersRef = useRef(filters)

    useEffect(() => { filtersRef.current = filters }, [filters])

    const fetchData = useCallback((currentPage = 0, currentFilters = null) => {
        setLoading(true)
        const f = currentFilters ?? filtersRef.current
        getHistorico({ page: currentPage, ...f })
            .then(setHistorico)
            .catch(() => setHistorico(null))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { fetchData(0) }, [fetchData])
    useEffect(() => { fetchData(0) }, [refreshKey])
    useEffect(() => { fetchData(0) }, [filters])

    async function handleDelete(id) {
        if (!confirm("Deletar esta transacao?")) return
        const result = await deleteTransacao(id)
        if (result.ok) fetchData(page)
        else alert(result.data)
    }

    async function handlePagar(id) {
        const result = await marcarComoPago(id)
        if (result.ok) fetchData(page)
        else alert("Erro ao marcar como pago")
    }

    function handleFilterChange(key, value) {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "2-digit",
            hour: "2-digit", minute: "2-digit"
        })
    }

    function renderParcela(item) {
        if (!item.parcelado) return null
        const valorRestante = item.valor * (item.totalParcelas - item.parcelaAtual)
        const valorTotal = item.valor * item.totalParcelas
        return (
            <div className="parcela-info">
                <span className={`badge-parcela ${item.pago ? "pago" : "pendente"}`}>
                    {item.pago ? "✓ Pago" : "Pendente"}
                </span>
                <span className="parcela-detalhe">{item.parcelaAtual}/{item.totalParcelas} parcelas</span>
                <span className="parcela-valores">Total: R$ {valorTotal.toFixed(2)} | Falta: R$ {valorRestante.toFixed(2)}</span>
            </div>
        )
    }

    return (
        <div className="historico">
            <h2>Historico de Transacoes</h2>
            <div className="filtros">
                <input type="date" value={filters.dataInicio} onChange={e => handleFilterChange("dataInicio", e.target.value)} />
                <input type="date" value={filters.dataFim} onChange={e => handleFilterChange("dataFim", e.target.value)} />
                <input type="text" value={filters.categoria} onChange={e => handleFilterChange("categoria", e.target.value)} placeholder="Categoria" />
                <select value={filters.tipo} onChange={e => handleFilterChange("tipo", e.target.value)}>
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
                                    <th>Data</th><th>Tipo</th><th>Valor</th><th>Categoria</th><th>Parcelas</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {historico.content.map(item => (
                                    <tr key={item.id} className={item.parcelado && !item.pago ? "row-pendente" : ""}>
                                        <td>{formatDate(item.createdAt)}</td>
                                        <td>
                                            <span className={`badge ${item.tipo === "gasto" ? "badge-gasto" : "badge-receita"}`}>
                                                {item.tipo === "gasto" ? "Gasto" : "Receita"}
                                            </span>
                                        </td>
                                        <td className="valor">R$ {item.valor.toFixed(2)}</td>
                                        <td>{item.categoria}</td>
                                        <td>{item.parcelado ? renderParcela(item) : <span className="sem-parcela">—</span>}</td>
                                        <td className="acoes">
                                            {item.parcelado && !item.pago && (
                                                <button className="btn-pagar" onClick={() => handlePagar(item.id)}>✓</button>
                                            )}
                                            <button className="btn-delete" onClick={() => handleDelete(item.id)}>x</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {historico.totalElements > 50 && (
                        <div className="paginacao">
                            <button disabled={page === 0} onClick={() => { setPage(p => p - 1); fetchData(page - 1) }}>Anterior</button>
                            <span>Pagina {historico.number + 1} de {historico.totalPages}</span>
                            <button disabled={page >= historico.totalPages - 1} onClick={() => { setPage(p => p + 1); fetchData(page + 1) }}>Proxima</button>
                        </div>
                    )}
                </>
            ) : (
                <p className="empty-state">Nenhuma transacao encontrada.</p>
            )}
        </div>
    )
}