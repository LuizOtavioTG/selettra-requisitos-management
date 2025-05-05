"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash, RefreshCw, Mail, Phone, Briefcase } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getFuncionarioById, excluirFuncionario, type Funcionario } from "@/lib/sharepoint/funcionarios-service"
import { getSetores, type Setor } from "@/lib/sharepoint/sharepoint-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { EditarFuncionarioModal } from "@/components/modals/editar-funcionario-modal"
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

export default function FuncionarioDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [funcionario, setFuncionario] = useState<Funcionario | null>(null)
  const [setores, setSetores] = useState<Setor[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingFuncionario, setDeletingFuncionario] = useState(false)

  // Função para carregar os dados do funcionário
  const carregarFuncionario = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFuncionarioById(id)
      if (!data) {
        setError("Funcionário não encontrado")
        return
      }
      setFuncionario(data)
    } catch (err: any) {
      console.error("Erro ao carregar funcionário:", err)
      setError("Não foi possível carregar o funcionário. Verifique sua conexão e permissões.")
    } finally {
      setLoading(false)
    }
  }

  // Função para carregar setores
  const carregarSetores = async () => {
    try {
      const data = await getSetores()
      setSetores(data)
    } catch (err: any) {
      console.error("Erro ao carregar setores:", err)
    }
  }

  // Carregar funcionário e setores ao montar o componente
  useEffect(() => {
    carregarFuncionario()
    carregarSetores()
  }, [id])

  // Função para atualizar os dados
  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarFuncionario()
    setRefreshing(false)
  }

  // Função para salvar edições no funcionário
  const handleSaveFuncionario = (funcionarioAtualizado: Funcionario) => {
    // Atualizar o estado local com o funcionário atualizado
    setFuncionario(funcionarioAtualizado)
  }

  // Função para excluir o funcionário
  const handleDeleteFuncionario = async () => {
    try {
      setDeletingFuncionario(true)
      await excluirFuncionario(id)
      router.push("/admin/funcionarios")
    } catch (err: any) {
      console.error("Erro ao excluir funcionário:", err)
      setError("Não foi possível excluir o funcionário. Verifique sua conexão e permissões.")
    } finally {
      setDeletingFuncionario(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Detalhes do Funcionário</h2>
            <p className="text-muted-foreground">Visualize e gerencie as informações do funcionário</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading || refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Atualizar</span>
            </Button>
            <Link href="/admin/funcionarios">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} disabled={!funcionario}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={!funcionario}>
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
          </div>
        ) : funcionario ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{funcionario.nome}</CardTitle>
                  <CardDescription>ID: {funcionario.id}</CardDescription>
                </div>
                <Badge variant={funcionario.status === "Ativo" ? "outline" : "secondary"}>{funcionario.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Email</h3>
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p>{funcionario.email || "Não informado"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Telefone</h3>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p>{funcionario.telefone || "Não informado"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Setor</h3>
                <div className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <p>{funcionario.setorNome || "Não atribuído"}</p>
                </div>
              </div>

              {funcionario.usuarioId && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">ID do Usuário</h3>
                  <p>{funcionario.usuarioId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Funcionário não encontrado</AlertTitle>
            <AlertDescription>O funcionário solicitado não foi encontrado ou não existe.</AlertDescription>
          </Alert>
        )}

        {funcionario && (
          <EditarFuncionarioModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveFuncionario}
            funcionario={funcionario}
            setores={setores.map((s) => ({ id: s.id, nome: s.nome }))}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Funcionário</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingFuncionario}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFuncionario} disabled={deletingFuncionario}>
                {deletingFuncionario ? (
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
