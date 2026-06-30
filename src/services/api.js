const API_URL = "https://financebot-rilz.onrender.com"

export async function sendMessage(message, user, parcelas = null) {
    const body = { message, user }

    if (parcelas) {
        body.parcelado = true
        body.totalParcelas = parcelas.totalParcelas
        body.parcelaAtual = parcelas.parcelaAtual
    }

    const response = await fetch(`${API_URL}/finance/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    return await response.text()
}

export async function getResumo(user) {
    const response = await fetch(`${API_URL}/finance/resumo/${user}`)
    return await response.text()
}

export async function getHistorico(user, params = {}) {
    const query = new URLSearchParams()
    if (params.dataInicio) query.set("dataInicio", params.dataInicio)
    if (params.dataFim) query.set("dataFim", params.dataFim)
    if (params.categoria) query.set("categoria", params.categoria)
    if (params.tipo) query.set("tipo", params.tipo)
    query.set("page", params.page ?? 0)
    query.set("size", params.size ?? 50)

    const url = `${API_URL}/finance/historico/${user}?${query}`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Erro ao buscar historico")
    return await response.json()
}

export async function getCategoriaResumo(user, params = {}) {
    const query = new URLSearchParams()
    if (params.dataInicio) query.set("dataInicio", params.dataInicio)
    if (params.dataFim) query.set("dataFim", params.dataFim)

    const url = `${API_URL}/finance/categoria-resumo/${user}` + (query.toString() ? `?${query}` : "")
    const response = await fetch(url)
    if (!response.ok) throw new Error("Erro ao buscar resumo por categoria")
    return await response.json()
}

export async function deleteTransacao(id, user) {
    const response = await fetch(`${API_URL}/finance/transacao/${id}?user=${user}`, {
        method: "DELETE"
    })
    return { ok: response.ok, data: await response.text() }
}

export async function marcarComoPago(id, user) {
    const response = await fetch(`${API_URL}/finance/transacao/${id}/pagar?user=${user}`, {
        method: "PATCH"
    })
    return { ok: response.ok, data: await response.text() }
}

export async function getParcelasAtivas(user) {
    const response = await fetch(`${API_URL}/finance/parcelas-ativas/${user}`)
    if (!response.ok) throw new Error("Erro ao buscar parcelas ativas")
    return await response.json()
}

export async function pagarProximaParcela(id, user) {
    const response = await fetch(`${API_URL}/finance/transacao/${id}/proxima-parcela?user=${user}`, {
        method: "PATCH"
    })
    return { ok: response.ok, data: await response.text() }
}