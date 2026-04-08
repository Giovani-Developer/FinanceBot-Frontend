import { useState } from "react"
import { sendMessage, getResumo } from "../services/api"

export default function FinanceForm({ user, onSuccess }) {
    const [message, setMessage] = useState("")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)
    const [showResumo, setShowResumo] = useState(false)
    const [resumoText, setResumoText] = useState("")
    const [resumoLoading, setResumoLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!message.trim() || !user) return
        setLoading(true)
        setResponse("")
        try {
            const result = await sendMessage(message, user)
            setResponse(result)
            setMessage("")
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
                                <div className="bar" />
                                <div className="bar" />
                                <div className="bar" />
                                <div className="bar" />
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
            </form>

            {response && (
                <div className={`toast ${response.includes("Nao consegui") || response.includes("Erro") ? "toast-error" : "toast-success"}`}>
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
