import { useState } from "react"
import { sendMessage, getResumo } from "../services/api"

export default function FinanceForm({ user, onSuccess }) {
    const [message, setMessage] = useState("")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)
    const [showResumo, setShowResumo] = useState(false)
    const [resumoText, setResumoText] = useState("")
    const [resumoLoading, setResumoLoading] = useState(false)

    // Parcelas
    const [parcelado, setParcelado] = useState(false)
    const [totalParcelas, setTotalParcelas] = useState("")
    const [parcelaAtual, setParcelaAtual] = useState("1")

    async function handleSubmit(e) {
        e.preventDefault()
        if (!message.trim() || !user) return

        if (parcelado && (!totalParcelas || parseInt(totalParcelas) < 2)) {
            setResponse("Informe o total de parcelas (mínimo 2)")
            return
        }

        setLoading(true)
        setResponse("")
        try {
            const parcelas = parcelado ? {
                totalParcelas: parseInt(totalParcelas),
                parcelaAtual: parseInt(parcelaAtual)
            } : null

            const result = await sendMessage(message, user, parcelas)
            setResponse(result)
            setMessage("")
            setParcelado(false)
            setTotalParcelas("")
            setParcelaAtual("1")
            onSuccess?.()
        } catch {
            setResponse("Erro ao enviar mensagem")
        } finally {
            setLoading(false)
        }
    }

    async function handleResumo() {
        if (!user) return
        setResumoLoading(true)
        setShowResumo(true)
        setResumoText("")
        try {
            const result = await getResumo(user)
            setResumoText(result)
        } catch {
            setResumoText("Erro ao carregar resumo")
        } finally {
            setResumoLoading(false)
        }
    }

    function fecharResumo() {
        setShowResumo(false)
        setResumoText("")
        setResponse("")
    }

    return (
        <div className="finance-form">
            {showResumo && (
                <div className="modal-overlay" onClick={fecharResumo}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Resumo Financeiro</h3>
                            <button className="modal-close" onClick={fecharResumo}>x</button>
                        </div>
                        {resumoLoading ? (
                            <div className="loading-bars">
                                <div className="bar" /><div className="bar" />
                                <div className="bar" /><div className="bar" />
                            </div>
                        ) : (
                            <pre className="resumo-text">{resumoText}</pre>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Ex: gastei 30 no mercado"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !message.trim()}>
                        {loading ? <span className="spinner">&#x23f3;</span> : "Enviar"}
                    </button>
                </div>

                {/* Toggle parcelas */}
                <div className="parcelas-toggle">
                    <label className="toggle-label">
                        <input
                            type="checkbox"
                            checked={parcelado}
                            onChange={e => setParcelado(e.target.checked)}
                        />
                        <span>É parcelado?</span>
                    </label>
                </div>

                {/* Campos de parcela */}
                {parcelado && (
                    <div className="parcelas-fields">
                        <div className="parcela-input">
                            <label>Parcela atual</label>
                            <input
                                type="number"
                                min="1"
                                value={parcelaAtual}
                                onChange={e => setParcelaAtual(e.target.value)}
                                placeholder="Ex: 1"
                            />
                        </div>
                        <span className="parcela-de">de</span>
                        <div className="parcela-input">
                            <label>Total de parcelas</label>
                            <input
                                type="number"
                                min="2"
                                value={totalParcelas}
                                onChange={e => setTotalParcelas(e.target.value)}
                                placeholder="Ex: 12"
                            />
                        </div>
                    </div>
                )}
            </form>

            {response && (
                <div className={`toast ${response.includes("Nao consegui") || response.includes("Erro") || response.includes("mínimo") ? "toast-error" : "toast-success"}`}>
                    <span>{response}</span>
                    <button className="toast-close" onClick={() => setResponse("")}>x</button>
                </div>
            )}

            <button className="btn-resumo" onClick={handleResumo} disabled={!user}>
                Ver Resumo
            </button>
        </div>
    )
}