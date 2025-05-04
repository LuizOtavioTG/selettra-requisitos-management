"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, RefreshCw, Mail, Phone } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
  getSetorById,
  getFuncionariosPorSetor,
  type Setor,
  type Funcionario,
} from "@/lib/sharepoint/sharepoint-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function SetorDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [setor, setSetor] = useState<Setor | null>(null)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Função para carregar os dados do setor e seus funcionários
  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar detalhes do setor
      const setorData = await getSetorById(id)
      if (!setorData) {
        setError("Setor não encontrado")
        return
      }
      setSetor(setorData)

      // Carregar funcionários do setor
      const funcionariosData = await getFuncionariosPorSetor(id)
      setFuncionarios(funcionariosData)
    } catch (err) {
      console.error("Erro ao carregar dados do setor:", err)
      setError("Não foi possível carregar os dados do setor. Verifique sua conexão e permissões.")
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarDados()
  }, [id])

  // Função para atualizar os dados
  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarDados()
    setRefreshing(false)
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Detalhes do Setor</h2>
            <p className="text-muted-foreground">Visualize informações detalhadas do setor</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading || refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Atualizar</span>
            </Button>
            <Link href="/admin/setores">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : setor ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{setor.nome}</CardTitle>
                <CardDescription>ID: {setor.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                  <p>{setor.descricao}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Estatísticas</h3>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Total de Funcionários: <strong>{setor.totalFuncionarios}</strong>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funcionários do Setor</CardTitle>
                <CardDescription>Lista de funcionários associados a este setor</CardDescription>
              </CardHeader>
              <CardContent>
                {funcionarios.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum funcionário associado a este setor
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {funcionarios.map((funcionario) => (
                        <TableRow key={funcionario.id}>
                          <TableCell className="font-medium">{funcionario.nome}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              {funcionario.email || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                              {funcionario.telefone || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={funcionario.status === "Ativo" ? "outline" : "secondary"}>
                              {funcionario.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setor não encontrado</AlertTitle>
            <AlertDescription>O setor solicitado não foi encontrado ou não existe.</AlertDescription>
          </Alert>
        )}
      </div>
    </ProtectedRoute>
  )
}
