"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, RefreshCw, Mail, Phone, User, Edit, Trash } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
  getSetorById,
  getFuncionariosPorSetor,
  excluirSetor,
  type Setor,
  type Funcionario,
} from "@/lib/sharepoint/sharepoint-service"
import { getFuncionarios } from "@/lib/sharepoint/funcionarios-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { EditarSetorModal } from "@/components/modals/editar-setor-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SetorDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [setor, setSetor] = useState<Setor | null>(null)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [todosFuncionarios, setTodosFuncionarios] = useState<Funcionario[]>([])
  const [funcionarioResponsavel, setFuncionarioResponsavel] = useState<Funcionario | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingSetor, setDeletingSetor] = useState(false)

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

      // Carregar todos os funcionários para o modal de edição
      const todosFuncionariosData = await getFuncionarios()
      setTodosFuncionarios(todosFuncionariosData)

      // Encontrar o funcionário responsável, se houver
      if (setorData.funcionarioId) {
        const responsavel = funcionariosData.find((f) => f.id.toString() === setorData.funcionarioId?.toString())
        setFuncionarioResponsavel(responsavel || null)
      } else {
        setFuncionarioResponsavel(null)
      }
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

  // Função para salvar edições no setor
  const handleSaveSetor = (setorAtualizado: Setor) => {
    // Atualizar o estado local com o setor atualizado
    setSetor(setorAtualizado)

    // Recarregar os dados para atualizar o funcionário responsável
    carregarDados()
  }

  // Função para excluir o setor
  const handleDeleteSetor = async () => {
    try {
      setDeletingSetor(true)
      await excluirSetor(id)
      router.push("/admin/setores")
    } catch (err: any) {
      console.error("Erro ao excluir setor:", err)
      setError("Não foi possível excluir o setor. Verifique sua conexão e permissões.")
    } finally {
      setDeletingSetor(false)
      setIsDeleteDialogOpen(false)
    }
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
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} disabled={!setor}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={!setor}>
              <Trash className="mr-2 h-4 w-4" />
              Excluir
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

                {funcionarioResponsavel && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Funcionário Responsável</h3>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{funcionarioResponsavel.nome}</p>
                        <p className="text-sm text-muted-foreground">{funcionarioResponsavel.email}</p>
                      </div>
                    </div>
                  </div>
                )}

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
                        <TableHead className="text-right">Ações</TableHead>
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
                            <Badge variant={funcionario.status === "Ativo" ? "active" : "inactive"}>
                              {funcionario.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/admin/funcionarios/${funcionario.id}`}>
                              <Button variant="ghost" size="sm">
                                <User className="h-4 w-4" />
                                <span className="sr-only">Detalhes</span>
                              </Button>
                            </Link>
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

        {setor && (
          <EditarSetorModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveSetor}
            setor={setor}
            funcionarios={todosFuncionarios.map((f) => ({ id: f.id, nome: f.nome }))}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Setor</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita.
                {setor?.totalFuncionarios > 0 && (
                  <p className="mt-2 text-destructive font-medium">
                    Atenção: Este setor possui {setor.totalFuncionarios} funcionários associados.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingSetor}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSetor} disabled={deletingSetor}>
                {deletingSetor ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Excluindo...
                  </>
                ) : (
                  "Sim, excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
