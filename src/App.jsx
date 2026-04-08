import { useState, useCallback } from "react"
import FinanceForm from "./components/FinanceForm"
import Dashboard from "./components/Dashboard"
import Historico from "./components/Historico"
import "./App.css"

export default function App() {
    const [loginInput, setLoginInput] = useState(sessionStorage.getItem("user") || "")
    const [loggedInUser, setLoggedInUser] = useState(sessionStorage.getItem("user") || null)
    const [activeTab, setActiveTab] = useState("dashboard")
    const [refreshKey, setRefreshKey] = useState(0)

    const handleLogin = (e) => {
        e.preventDefault()
        if (!loginInput.trim()) return
        sessionStorage.setItem("user", loginInput)
        setLoggedInUser(loginInput)
    }

    const handleLogout = () => {
        sessionStorage.removeItem("user")
        setLoggedInUser(null)
        setLoginInput("")
        setActiveTab("dashboard")
    }

    const handleRefresh = useCallback(() => {
        setRefreshKey(k => k + 1)
    }, [])

    return (
        <div className="app">
            <header className="app-header">
                <h1>FinanceBot</h1>
                {!loggedInUser ? (
                    <form onSubmit={handleLogin} className="login-form">
                        <input
                            type="text"
                            placeholder="Seu nome"
                            value={loginInput}
                            onChange={e => setLoginInput(e.target.value)}
                        />
                        <button type="submit">Entrar</button>
                    </form>
                ) : (
                    <div className="user-bar">
                        <span>Ola, <strong>{loggedInUser}</strong></span>
                        <button onClick={handleLogout}>Sair</button>
                    </div>
                )}
            </header>

            {loggedInUser && (
                <>
                    <nav className="tabs">
                        <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
                            Dashboard
                        </button>
                        <button className={activeTab === "enviar" ? "active" : ""} onClick={() => setActiveTab("enviar")}>
                            Enviar
                        </button>
                        <button className={activeTab === "historico" ? "active" : ""} onClick={() => setActiveTab("historico")}>
                            Historico
                        </button>
                    </nav>

                    <main className="app-main">
                        {activeTab === "dashboard" && <Dashboard user={loggedInUser} />}
                        {activeTab === "enviar" && <FinanceForm user={loggedInUser} onSuccess={handleRefresh} />}
                        {activeTab === "historico" && <Historico user={loggedInUser} refreshKey={refreshKey} />}
                    </main>
                </>
            )}
        </div>
    )
}
