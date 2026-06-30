import { useState, useEffect, useCallback } from "react"
import { getParcelasAtivas, pagarProximaParcela, deleteTransacao } from "../services/api"

export default function Parcelas({ user }) {
    const [parcelas, setParcelas] = useState([])
    const [loading, setLoading] = useState(false)
    const [mensagem, setMensagem] = useState("")

    const fetchParcelas = useCallback(() => {
        if (!user) return
        setLoading(true)
        getParcelasAtivas(user)
            .then(setParcelas)
            .catch(() => setParcelas([]))
            .finally(() => setLoading(false))
    }, [user])

    useEffect(() => { fetchParcelas() }, [fetchParcelas])

    async function handleProximaParcela(id) {
        const result = await pagarProximaParcela(id, user)
        setMensagem(result.data)
        fetchParcelas()
        setTimeout(() => setMensagem(""), 4000)
    }

    async function handleDelete(id) {
        if (!confirm("Deletar este parcelamento?")) return
        const result = await deleteTransacao(id, user)
        if (result.ok) fetchParcelas()
        else alert(result.data)
    }

    function calcularProgresso(parcelaAtual, totalParcelas) {
        return Math.round((parcelaAtual / totalParcelas) * 100)
    }

    if (loading) return (
        <div className="loading-skeleton">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton-row" />)}
        </div>
    )

    return (
        <div className="parcelas-page">
            <h2>Parcelas Ativas</h2>

            {mensagem && (
                <div className="toast toast-success">
                    <span>{mensagem}</span>
                    <button className="toast-close" onClick={() => setMensagem("")}>x</button>
                </div>
            )}

            {parcelas.length === 0 ? (
                <p className="empty-state">Nenhuma parcela ativa no momento.</p>
            ) : (
                <div className="parcelas-lista">
                    {parcelas.map(item => {
                        const progresso = calcularProgresso(item.parcelaAtual, item.totalParcelas)
                        const valorPago = item.valor * item.parcelaAtual
                        const valorRestante = item.valor * (item.totalParcelas - item.parcelaAtual)
                        const valorTotal = item.valor * item.totalParcelas

                        return (
                            <div key={item.id} className="parcela-card">
                                <div className="parcela-card-header">
                                    <div>
                                        <span className="parcela-categoria">{item.categoria}</span>
                                        <span className="parcela-valor-mensal">R$ {item.valor.toFixed(2)}/mês</span>
                                    </div>
                                    <button className="btn-delete" onClick={() => handleDelete(item.id)} title="Deletar">x</button>
                                </div>

                                <div className="parcela-progresso-info">
                                    <span>Parcela {item.parcelaAtual} de {item.totalParcelas}</span>
                                    <span>{progresso}%</span>
                                </div>

                                <div className="parcela-progress-bar">
                                    <div
                                        className="parcela-progress-fill"
                                        style={{ width: `${progresso}%` }}
                                    />
                                </div>

                                <div className="parcela-valores-resumo">
                                    <div className="parcela-valor-item">
                                        <span className="parcela-label">Total</span>
                                        <span className="parcela-num">R$ {valorTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="parcela-valor-item">
                                        <span className="parcela-label">Pago</span>
                                        <span className="parcela-num pago">R$ {valorPago.toFixed(2)}</span>
                                    </div>
                                    <div className="parcela-valor-item">
                                        <span className="parcela-label">Restante</span>
                                        <span className="parcela-num restante">R$ {valorRestante.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn-proxima-parcela"
                                    onClick={() => handleProximaParcela(item.id)}
                                >
                                    ✓ Pagar parcela {item.parcelaAtual + 1}/{item.totalParcelas}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="parcelas-resumo-total">
                <span>Total em parcelas/mês: </span>
                <strong>R$ {parcelas.reduce((acc, p) => acc + p.valor, 0).toFixed(2)}</strong>
            </div>
        </div>
    )
}