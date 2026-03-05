const API_URL = "http://localhost:3000"

export async function sendMessage(message, user) {
    const response = await fetch(`${API_URL}/finance/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: message, 
            user: user
        })
    });

    const data = await response.text()
    console.log("Resposta do servidor:", data)
}