"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Filter, RefreshCw } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getFuncionarios, type Funcionario } from "@/lib/sharepoint/funcionarios-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { NovoFuncionarioModal } from "@/components/modals/novo-funcionario-modal"

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos")
  const [filtroSetor, setFiltroSetor] = useState<string | null>(null)

  // Função para carregar os funcionários
  const carregarFuncionarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFuncionarios()
      setFuncionarios(data)
    } catch (err: any) {
      console.error("Erro ao carregar funcionários:", err)
      setError("Não foi possível carregar os funcionários. Verifique sua conexão e permissões.")
    } finally {
      setLoading(false)
    }
  }

  // Carregar funcionários ao montar o componente
  useEffect(() => {
    carregarFuncionarios()
  }, [])

  // Função para atualizar a lista
  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarFuncionarios()
    setRefreshing(false)
  }

  // Função para adicionar um novo funcionário
  const handleSaveFuncionario = async (data: any) => {
    try {
      // Atualizar a lista após adicionar
      await carregarFuncionarios()
      return true
    } catch (err: any) {
      console.error("Erro ao salvar funcionário:", err)
      setError("Não foi possível adicionar o funcionário. Verifique sua conexão e permissões.")
      return false
    }
  }

  // Filtrar funcionários
  const funcionariosFiltrados = funcionarios.filter((funcionario) => {
    // Filtrar por status
    if (filtroStatus !== "Todos" && funcionario.status !== filtroStatus) {
      return false
    }

    // Filtrar por setor
    if (filtroSetor && funcionario.setorId?.toString() !== filtroSetor) {
      return false
    }

    return true
  })

  // Obter lista de setores únicos para o filtro
  const setores = [...new Set(funcionarios.map((f) => ({ id: f.setorId, nome: f.setorNome })))].filter(
    (s) => s.id !== null,
  )

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Funcionários</h2>
            <p className="text-muted-foreground">Gerencie os funcionários do sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading || refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Atualizar</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFiltroStatus("Todos")}>Todos os Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroStatus("Ativo")}>Ativos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroStatus("Inativo")}>Inativos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroSetor(null)}>Todos os Setores</DropdownMenuItem>
                {setores.map((setor) => (
                  <DropdownMenuItem
                    key={setor.id?.toString()}
                    onClick={() => setFiltroSetor(setor.id?.toString() || null)}
                  >
                    {setor.nome}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Funcionário
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
            <CardDescription>Visualize e gerencie todos os funcionários cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionariosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum funcionário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    funcionariosFiltrados.map((funcionario) => (
                      <TableRow key={funcionario.id}>
                        <TableCell className="font-medium">{funcionario.id}</TableCell>
                        <TableCell>{funcionario.nome}</TableCell>
                        <TableCell>
                          <Badge variant={funcionario.status === "Ativo" ? "outline" : "secondary"}>
                            {funcionario.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{funcionario.setorNome}</TableCell>
                        <TableCell>{funcionario.email}</TableCell>
                        <TableCell>{funcionario.telefone}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/funcionarios/${funcionario.id}`}>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Detalhes</span>
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <NovoFuncionarioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFuncionario}
          setores={setores}
        />
      </div>
    </ProtectedRoute>
  )
}
