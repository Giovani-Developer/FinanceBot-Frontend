const API_URL = "https://financebot-rilz.onrender.com"
// const API_URL = "http://localhost:3000"


function getToken() {
    return localStorage.getItem("jwt")
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    }
}

export async function googleLogin(credential) {
    console.log("Enviando credential:", credential);

    const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ credential })
    });

    console.log("Status:", response.status);

    const text = await response.text();
    console.log("Resposta:", text);

    if (!response.ok) throw new Error(text);

    return JSON.parse(text);
}

export async function sendMessage(message, parcelas = null) {
    const body = { message }
    if (parcelas) {
        body.parcelado = true
        body.totalParcelas = parcelas.totalParcelas
        body.parcelaAtual = parcelas.parcelaAtual
    }
const response = await fetch(`${API_URL}/finance/message`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body)
})

console.log("Status:", response.status);

const text = await response.text();
console.log("Resposta:", text);

if (!response.ok) {
    throw new Error(text);
}

return text;
}

export async function getResumo() {
    const response = await fetch(`${API_URL}/finance/resumo`, {
        headers: authHeaders()
    })
    return await response.text()
}

export async function getHistorico(params = {}) {
    const query = new URLSearchParams()
    if (params.dataInicio) query.set("dataInicio", params.dataInicio)
    if (params.dataFim) query.set("dataFim", params.dataFim)
    if (params.categoria) query.set("categoria", params.categoria)
    if (params.tipo) query.set("tipo", params.tipo)
    query.set("page", params.page ?? 0)
    query.set("size", params.size ?? 50)

    const response = await fetch(`${API_URL}/finance/historico?${query}`, {
        headers: authHeaders()
    })
    if (!response.ok) throw new Error("Erro ao buscar historico")
    return await response.json()
}

export async function getCategoriaResumo(params = {}) {
    const query = new URLSearchParams()
    if (params.dataInicio) query.set("dataInicio", params.dataInicio)
    if (params.dataFim) query.set("dataFim", params.dataFim)

    const url = `${API_URL}/finance/categoria-resumo` + (query.toString() ? `?${query}` : "")
    const response = await fetch(url, { headers: authHeaders() })
    if (!response.ok) throw new Error("Erro ao buscar resumo por categoria")
    return await response.json()
}

export async function deleteTransacao(id) {
    const response = await fetch(`${API_URL}/finance/transacao/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    })
    return { ok: response.ok, data: await response.text() }
}

export async function marcarComoPago(id) {
    const response = await fetch(`${API_URL}/finance/transacao/${id}/pagar`, {
        method: "PATCH",
        headers: authHeaders()
    })
    return { ok: response.ok, data: await response.text() }
}

export async function getParcelasAtivas() {
    const response = await fetch(`${API_URL}/finance/parcelas-ativas`, {
        headers: authHeaders()
    })
    if (!response.ok) throw new Error("Erro ao buscar parcelas ativas")
    return await response.json()
}

export async function pagarProximaParcela(id) {
    const response = await fetch(`${API_URL}/finance/transacao/${id}/proxima-parcela`, {
        method: "PATCH",
        headers: authHeaders()
    })
    return { ok: response.ok, data: await response.text() }
}