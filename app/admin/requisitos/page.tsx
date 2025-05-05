"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Filter, RefreshCw } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NovoRequisitoModal } from "@/components/modals/novo-requisito-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getRequisitos, adicionarRequisito, type Requisito } from "@/lib/sharepoint/requisitos-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function RequisitosPage() {
  const [requisitos, setRequisitos] = useState<Requisito[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

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
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Todos</DropdownMenuItem>
                <DropdownMenuItem>Cadastrada</DropdownMenuItem>
                <DropdownMenuItem>Andamento</DropdownMenuItem>
                <DropdownMenuItem>Realizada</DropdownMenuItem>
                <DropdownMenuItem>Ativa</DropdownMenuItem>
                <DropdownMenuItem>Inativa</DropdownMenuItem>
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
            <CardDescription>Visualize e gerencie todos os requisitos cadastrados no sistema</CardDescription>
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
                  {requisitos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum requisito encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    requisitos.map((requisito) => (
                      <TableRow key={requisito.id}>
                        <TableCell className="font-medium">{requisito.id}</TableCell>
                        <TableCell>{requisito.codigo}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{requisito.descricao}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              requisito.status === "Realizada"
                                ? "success"
                                : requisito.status === "Andamento"
                                  ? "warning"
                                  : "default"
                            }
                          >
                            {requisito.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={requisito.situacao === "Ativa" ? "outline" : "secondary"}>
                            {requisito.situacao}
                          </Badge>
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
