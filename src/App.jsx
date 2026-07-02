import { useState, useCallback } from "react"
import { GoogleLogin } from "@react-oauth/google"
import FinanceForm from "./components/FinanceForm"
import Dashboard from "./components/Dashboard"
import Historico from "./components/Historico"
import Parcelas from "./components/Parcelas"
import { googleLogin } from "./services/api"
import "./App.css"

export default function App() {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user")
        return stored ? JSON.parse(stored) : null
    })
    const [activeTab, setActiveTab] = useState("dashboard")
    const [refreshKey, setRefreshKey] = useState(0)

const handleGoogleSuccess = async (credentialResponse) => {
    try {
        console.log("Credential:", credentialResponse);

        const data = await googleLogin(credentialResponse.credential);
        console.log("Resposta do backend:", data);

        localStorage.setItem("jwt", data.token);
        localStorage.setItem("user", JSON.stringify({
            email: data.email,
            nome: data.nome,
            foto: data.foto
        }));

        setUser({
            email: data.email,
            nome: data.nome,
            foto: data.foto
        });
    } catch (error) {
        console.error("Erro completo:", error);

        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Dados:", error.response.data);
        }

        alert("Erro ao fazer login com Google");
    }
}
    const handleLogout = () => {
        localStorage.removeItem("jwt")
        localStorage.removeItem("user")
        setUser(null)
        setActiveTab("dashboard")
    }

    const handleRefresh = useCallback(() => {
        setRefreshKey(k => k + 1)
    }, [])

    return (
        <div className="app">
            <header className="app-header">
                <h1>FinanceBot</h1>
                {!user ? (
                    <div className="login-google">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => alert("Erro ao fazer login")}
                            text="signin_with"
                            shape="rectangular"
                            locale="pt-BR"
                        />
                    </div>
                ) : (
                    <div className="user-bar">
                        {user.foto && <img src={user.foto} alt={user.nome} className="user-avatar" />}
                        <span>Ola, <strong>{user.nome}</strong></span>
                        <button onClick={handleLogout}>Sair</button>
                    </div>
                )}
            </header>

            {user && (
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
                        <button className={activeTab === "parcelas" ? "active" : ""} onClick={() => setActiveTab("parcelas")}>
                            Parcelas
                        </button>
                    </nav>

                    <main className="app-main">
                        {activeTab === "dashboard" && <Dashboard />}
                        {activeTab === "enviar" && <FinanceForm onSuccess={handleRefresh} />}
                        {activeTab === "historico" && <Historico refreshKey={refreshKey} />}
                        {activeTab === "parcelas" && <Parcelas />}
                    </main>
                </>
            )}
        </div>
    )
}