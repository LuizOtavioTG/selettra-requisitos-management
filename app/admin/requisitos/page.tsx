"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Filter, RefreshCw, Check } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { NovoRequisitoModal } from "@/components/modals/novo-requisito-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getRequisitos, adicionarRequisito, type Requisito } from "@/lib/sharepoint/requisitos-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Tipos de filtro disponíveis
type FiltroStatus = "Todos" | "Cadastrada" | "Andamento" | "Realizada"
type FiltroSituacao = "Todos" | "Ativa" | "Inativa"
type TipoFiltro = "Status" | "Situacao" | null

export default function RequisitosPage() {
  const [requisitos, setRequisitos] = useState<Requisito[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Estados para filtros
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("Todos")
  const [filtroSituacao, setFiltroSituacao] = useState<FiltroSituacao>("Todos")
  const [tipoFiltroAtivo, setTipoFiltroAtivo] = useState<TipoFiltro>(null)

  // Função para carregar os requisitos
  const carregarRequisitos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRequisitos()
      setRequisitos(data)
    } catch (err: any) {
      console.error("Erro ao carregar requisitos:", err)
      setError("Não foi possível carregar os requisitos. Verifique sua conexão e permissões.")
    } finally {
      setLoading(false)
    }
  }

  // Carregar requisitos ao montar o componente
  useEffect(() => {
    carregarRequisitos()
  }, [])

  // Função para atualizar a lista
  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarRequisitos()
    setRefreshing(false)
  }

  // Função para salvar um novo requisito
  const handleSaveRequisito = async (data: any) => {
    try {
      setError(null)
      const novoRequisito = await adicionarRequisito({
        codigo: data.codigo,
        descricao: data.descricao,
        descricaoCompleta: data.descricaoCompleta,
        status: data.status,
        situacao: data.situacao,
        funcionarioId: data.funcionario,
      })
      setRequisitos([novoRequisito, ...requisitos])
      return true
    } catch (err: any) {
      console.error("Erro ao salvar requisito:", err)
      setError("Não foi possível adicionar o requisito. Verifique sua conexão e permissões.")
      return false
    }
  }

  // Função para aplicar filtro de status
  const aplicarFiltroStatus = (status: FiltroStatus) => {
    setFiltroStatus(status)
    setTipoFiltroAtivo(status === "Todos" ? null : "Status")
  }

  // Função para aplicar filtro de situação
  const aplicarFiltroSituacao = (situacao: FiltroSituacao) => {
    setFiltroSituacao(situacao)
    setTipoFiltroAtivo(situacao === "Todos" ? null : "Situacao")
  }

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltroStatus("Todos")
    setFiltroSituacao("Todos")
    setTipoFiltroAtivo(null)
  }

  // Aplicar filtros aos requisitos
  const requisitosFiltrados = useMemo(() => {
    return requisitos.filter((requisito) => {
      // Filtrar por status
      if (filtroStatus !== "Todos" && requisito.status !== filtroStatus) {
        return false
      }

      // Filtrar por situação
      if (filtroSituacao !== "Todos" && requisito.situacao !== filtroSituacao) {
        return false
      }

      return true
    })
  }, [requisitos, filtroStatus, filtroSituacao])

  // Obter o texto do botão de filtro
  const getTextoFiltro = () => {
    if (tipoFiltroAtivo === "Status") {
      return `Filtro: ${filtroStatus}`
    } else if (tipoFiltroAtivo === "Situacao") {
      return `Filtro: ${filtroSituacao}`
    } else {
      return "Filtrar"
    }
  }

  // Função para obter a variante do badge de status
  const getVarianteStatus = (status: string) => {
    switch (status) {
      case "Realizada":
        return "success"
      case "Andamento":
        return "warning"
      case "Cadastrada":
        return "default"
      default:
        return "default"
    }
  }

  // Função para obter a variante do badge de situação
  const getVarianteSituacao = (situacao: string) => {
    switch (situacao) {
      case "Ativa":
        return "active"
      case "Inativa":
        return "inactive"
      default:
        return "outline"
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Requisitos</h2>
            <p className="text-muted-foreground">Gerencie os requisitos do sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading || refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Atualizar</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={tipoFiltroAtivo ? "secondary" : "outline"} size="sm" className="min-w-[100px]">
                  <Filter className="mr-2 h-4 w-4" />
                  {getTextoFiltro()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => aplicarFiltroStatus("Todos")}>
                  {filtroStatus === "Todos" && <Check className="mr-2 h-4 w-4" />}
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aplicarFiltroStatus("Cadastrada")}>
                  {filtroStatus === "Cadastrada" && <Check className="mr-2 h-4 w-4" />}
                  <Badge variant="default" className="mr-2">
                    Cadastrada
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aplicarFiltroStatus("Andamento")}>
                  {filtroStatus === "Andamento" && <Check className="mr-2 h-4 w-4" />}
                  <Badge variant="warning" className="mr-2">
                    Andamento
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aplicarFiltroStatus("Realizada")}>
                  {filtroStatus === "Realizada" && <Check className="mr-2 h-4 w-4" />}
                  <Badge variant="success" className="mr-2">
                    Realizada
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Filtrar por Situação</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => aplicarFiltroSituacao("Todos")}>
                  {filtroSituacao === "Todos" && <Check className="mr-2 h-4 w-4" />}
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aplicarFiltroSituacao("Ativa")}>
                  {filtroSituacao === "Ativa" && <Check className="mr-2 h-4 w-4" />}
                  <Badge variant="outline" className="mr-2">
                    Ativa
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aplicarFiltroSituacao("Inativa")}>
                  {filtroSituacao === "Inativa" && <Check className="mr-2 h-4 w-4" />}
                  <Badge variant="secondary" className="mr-2">
                    Inativa
                  </Badge>
                </DropdownMenuItem>

                {tipoFiltroAtivo && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={limparFiltros}>Limpar filtros</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Requisito
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
            <CardTitle>Lista de Requisitos</CardTitle>
            <CardDescription>
              {tipoFiltroAtivo ? (
                <div className="flex items-center">
                  Exibindo requisitos filtrados
                  {filtroStatus !== "Todos" && (
                    <Badge variant={getVarianteStatus(filtroStatus)} className="ml-2">
                      Status: {filtroStatus}
                    </Badge>
                  )}
                  {filtroSituacao !== "Todos" && (
                    <Badge variant={getVarianteSituacao(filtroSituacao)} className="ml-2">
                      Situação: {filtroSituacao}
                    </Badge>
                  )}
                </div>
              ) : (
                "Visualize e gerencie todos os requisitos cadastrados no sistema"
              )}
            </CardDescription>
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
                    <TableHead>Código</TableHead>
                    <TableHead className="w-[300px]">Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisitosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {tipoFiltroAtivo
                          ? "Nenhum requisito encontrado com os filtros aplicados"
                          : "Nenhum requisito encontrado"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    requisitosFiltrados.map((requisito) => (
                      <TableRow key={requisito.id}>
                        <TableCell className="font-medium">{requisito.id}</TableCell>
                        <TableCell>{requisito.codigo}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{requisito.descricao}</TableCell>
                        <TableCell>
                          <Badge variant={getVarianteStatus(requisito.status)}>{requisito.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getVarianteSituacao(requisito.situacao)}>{requisito.situacao}</Badge>
                        </TableCell>
                        <TableCell>{requisito.funcionarioNome || "Não atribuído"}</TableCell>
                        <TableCell>{requisito.dataCriacao}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/requisitos/${requisito.id}`}>
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

        <NovoRequisitoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRequisito} />
      </div>
    </ProtectedRoute>
  )
}
