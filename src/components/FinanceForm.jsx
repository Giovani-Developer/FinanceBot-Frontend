import {useState} from "react"
import { sendMessage } from "../services/api"

export default function FinanceForm() {
    const [message, setMessage] = useState("")
    const [response, setResponse] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()

        const result = await sendMessage(message, "Giovani")

        setResponse(result)
        setMessage("")
    }

    return (
        <div>

            <h2>FinanceBot</h2>
        
            <form onSubmit={handleSubmit}>
                <input type="text"
                placeholder="Ex: gastei 30 mercado."
                value={message}
                onChange={(e) => setMessage(e.target.value)} 
                />

                <button type="submit">
                    Enviar 
                </button>
            
            </form>
            {response && (
                <p>{response}</p>
            )}

        </div>

    )
}