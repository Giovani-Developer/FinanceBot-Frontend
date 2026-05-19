const API_URL = "https://financebot-rilz.onrender.com"

export async function sendMessage(message, user) {
    const response = await fetch(`${API_URL}/finance/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, user })
    });
    const data = await response.text()
    return data;
}

export async function getResumo(user) {
    const response = await fetch(`${API_URL}/finance/resumo/${user}`)
    return await response.text();
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
    const data = await response.text()
    return { ok: response.ok, data }
}
