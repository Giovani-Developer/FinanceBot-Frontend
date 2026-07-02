import { useState, useEffect, useCallback } from "react"
import { getHistorico, getCategoriaResumo } from "../services/api"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const COLORS = [
    "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
    "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4"
]

export default function Dashboard() {
    const [receitas, setReceitas] = useState(0)
    const [gastos, setGastos] = useState(0)
    const [saldo, setSaldo] = useState(0)
    const [totalTransacoes, setTotalTransacoes] = useState(0)
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(() => {
        setLoading(true)
        Promise.allSettled([
            getHistorico({ page: 0, size: 500 }),
            getCategoriaResumo({})
        ]).then(([histResult, catResult]) => {
            const historico = histResult.status === "fulfilled" ? histResult.value : null
            const cats = catResult.status === "fulfilled" ? catResult.value : []

            setCategorias(cats)

            const items = historico?.content || []
            const rec = items.filter(i => i.tipo === "receita").reduce((s, i) => s + (i.valor || 0), 0)
            const gast = items.filter(i => i.tipo === "gasto").reduce((s, i) => s + (i.valor || 0), 0)
            setReceitas(rec)
            setGastos(gast)
            setSaldo(rec - gast)
            setTotalTransacoes(items.length)
        }).finally(() => setLoading(false))
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const pieData = {
        labels: categorias.map(c => c.categoria),
        datasets: [{
            data: categorias.map(c => c.totalGasto),
            backgroundColor: COLORS,
            borderColor: "#1a1a2e",
            borderWidth: 2,
            hoverOffset: 8
        }]
    }

    const barData = {
        labels: ["Receitas", "Gastos"],
        datasets: [{
            label: "R$",
            data: [receitas, gastos],
            backgroundColor: ["#10b981", "#ef4444"],
            borderColor: ["#059669", "#dc2626"],
            borderWidth: 1,
            borderRadius: 8,
            maxBarThickness: 120
        }]
    }

    const barOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: "rgba(255,255,255,0.06)" },
                ticks: { color: "#94a3b8" }
            },
            x: {
                grid: { display: false },
                ticks: { color: "#94a3b8", font: { size: 14 } }
            }
        }
    }

    if (loading) return (
        <div className="dashboard-loading">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-chart" />
        </div>
    )

    return (
        <div className="dashboard">
            <div className="cards-row">
                <div className="card card-receitas">
                    <div className="card-icon">⬆</div>
                    <div className="card-info">
                        <span className="card-label">Receitas</span>
                        <span className="card-value">R$ {receitas.toFixed(2)}</span>
                        <span className="card-count">{totalTransacoes} transações</span>
                    </div>
                </div>
                <div className="card card-gastos">
                    <div className="card-icon">⬇</div>
                    <div className="card-info">
                        <span className="card-label">Gastos</span>
                        <span className="card-value">R$ {gastos.toFixed(2)}</span>
                        <span className="card-count">{categorias.length} categorias</span>
                    </div>
                </div>
                <div className={`card card-saldo ${saldo < 0 ? "saldo-negativo" : ""}`}>
                    <div className="card-icon">{saldo >= 0 ? "💰" : "⚠"}</div>
                    <div className="card-info">
                        <span className="card-label">Saldo</span>
                        <span className="card-value">R$ {saldo.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-box">
                    <h3>Receitas vs Gastos</h3>
                    <div className="chart-container">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
                {categorias.length > 0 && (
                    <div className="chart-box">
                        <h3>Gastos por Categoria</h3>
                        <div className="chart-container chart-pie">
                            <Pie data={pieData} options={{ plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } } }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}