"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Layers, Users, PieChart } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getRequisitos } from "@/lib/sharepoint/requisitos-service"
import { getFuncionarios } from "@/lib/sharepoint/funcionarios-service"
import { getSetores } from "@/lib/sharepoint/sharepoint-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend, Tooltip } from "recharts"

// Cores para o gráfico de status
const STATUS_COLORS = {
  Cadastrada: "#3b82f6", // blue-500
  Andamento: "#f59e0b", // amber-500
  Realizada: "#10b981", // emerald-500
  Inativa: "#6b7280", // gray-500
}

export default function DashboardPage() {
  const { userInfo } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState({
    totalRequisitos: 0,
    totalFuncionarios: 0,
    totalSetores: 0,
    requisitosPorStatus: [] as { name: string; value: number; color: string }[],
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        setError(null)

        // Carregar dados das listas
        const [requisitos, funcionarios, setores] = await Promise.all([
          getRequisitos(),
          getFuncionarios(),
          getSetores(),
        ])

        // Calcular contagem de requisitos por status
        const statusCount: Record<string, number> = {}
        requisitos.forEach((req) => {
          statusCount[req.status] = (statusCount[req.status] || 0) + 1
        })

        // Formatar dados para o gráfico
        const requisitosPorStatus = Object.entries(statusCount).map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#9ca3af", // gray-400 como fallback
        }))

        // Atualizar estado com os dados
        setDashboardData({
          totalRequisitos: requisitos.length,
          totalFuncionarios: funcionarios.length,
          totalSetores: setores.length,
          requisitosPorStatus,
        })
      } catch (err: any) {
        console.error("Erro ao carregar dados do dashboard:", err)
        setError("Não foi possível carregar os dados do dashboard. Verifique sua conexão e permissões.")
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  // Componente para renderizar o gráfico de anel (donut chart)
  const StatusDonutChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={dashboardData.requisitosPorStatus}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={100}
          innerRadius={60} // Adicionando innerRadius para criar o efeito de anel
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          paddingAngle={2} // Adiciona um pequeno espaço entre os segmentos
        >
          {dashboardData.requisitosPorStatus.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} requisitos`, "Quantidade"]} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo, {userInfo?.displayName || "Usuário"}! Visão geral do sistema de gestão de requisitos
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/requisitos">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Requisitos</CardTitle>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardData.totalRequisitos}</div>
                    <p className="text-xs text-muted-foreground">Total de requisitos cadastrados</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/funcionarios">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Funcionários</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardData.totalFuncionarios}</div>
                    <p className="text-xs text-muted-foreground">Funcionários ativos no sistema</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/setores">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Setores</CardTitle>
                    <Layers className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{dashboardData.totalSetores}</div>
                    <p className="text-xs text-muted-foreground">Setores cadastrados</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5" />
                    Requisitos por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.requisitosPorStatus.length > 0 ? (
                    <StatusDonutChart />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      Nenhum requisito encontrado
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
