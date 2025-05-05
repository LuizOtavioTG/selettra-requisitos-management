"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash, Upload, Clock, FileText, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditarRequisitoModal } from "@/components/modals/editar-requisito-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getRequisitoById, type Requisito } from "@/lib/sharepoint/requisitos-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Dados de exemplo para movimentações e anexos
const movimentacoes = [
  {
    id: 1,
    data: "10/04/2023 14:30",
    funcionario: "João Silva",
    descricao: "Requisito cadastrado no sistema",
  },
  {
    id: 2,
    data: "12/04/2023 09:15",
    funcionario: "Maria Oliveira",
    descricao: "Análise inicial do requisito",
  },
  {
    id: 3,
    data: "15/04/2023 16:45",
    funcionario: "Carlos Santos",
    descricao: "Atribuição de prioridade alta",
  },
]

const anexos = [
  {
    id: 1,
    nome: "Especificação.pdf",
    tipo: "Documento",
    tamanho: "2.5 MB",
    data: "10/04/2023",
  },
  {
    id: 2,
    nome: "Diagrama.png",
    tipo: "Imagem",
    tamanho: "1.2 MB",
    data: "12/04/2023",
  },
]

export default function RequisitoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [requisito, setRequisito] = useState<Requisito | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Função para carregar os dados do requisito
  const carregarRequisito = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRequisitoById(id)
      if (!data) {
        setError("Requisito não encontrado")
        return
      }
      setRequisito(data)
    } catch (err: any) {
      console.error("Erro ao carregar requisito:", err)
      setError("Não foi possível carregar o requisito. Verifique sua conexão e permissões.")
    } finally {
      setLoading(false)
    }
  }

  // Carregar requisito ao montar o componente
  useEffect(() => {
    carregarRequisito()
  }, [id])

  // Função para atualizar os dados
  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarRequisito()
    setRefreshing(false)
  }

  // Função para salvar edições no requisito
  const handleSaveRequisito = (data: any) => {
    // Aqui seria implementada a lógica para salvar as alterações no SharePoint
    console.log("Salvando alterações:", data)

    // Por enquanto, apenas atualizamos o estado local
    if (requisito) {
      setRequisito({
        ...requisito,
        codigo: data.codigo,
        descricao: data.descricao,
        status: data.status,
        situacao: data.situacao,
        funcionarioId: data.funcionario,
      })
    }
  }

  // Função para formatar a descrição completa com quebras de linha
  const formatarDescricaoCompleta = (texto?: string) => {
    if (!texto) return null

    // Dividir o texto por quebras de linha e criar parágrafos
    return texto.split("\n").map((linha, index) => {
      if (linha.trim() === "") return <br key={index} />
      return (
        <p key={index} className="mb-2">
          {linha}
        </p>
      )
    })
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Detalhes do Requisito</h2>
            <p className="text-muted-foreground">Visualize e gerencie as informações do requisito</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading || refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Atualizar</span>
            </Button>
            <Link href="/admin/requisitos">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} disabled={!requisito}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" disabled={!requisito}>
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
        ) : requisito ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {requisito.codigo} - ID: {requisito.id}
                  </CardTitle>
                  <CardDescription>
                    Criado em {requisito.dataCriacao} por {requisito.funcionarioNome || "Usuário do sistema"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
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
                  <Badge variant={requisito.situacao === "Ativa" ? "outline" : "secondary"}>{requisito.situacao}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p>{requisito.descricao}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição Completa</h3>
                <div className="bg-muted/30 p-4 rounded-md">
                  {formatarDescricaoCompleta(requisito.descricaoCompleta)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Funcionário Responsável</h3>
                  <p>{requisito.funcionarioNome || "Não atribuído"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Setor</h3>
                  <p>{requisito.setorNome || "Não especificado"}</p>
                </div>
              </div>

              <Tabs defaultValue="movimentacoes">
                <TabsList>
                  <TabsTrigger value="movimentacoes">
                    <Clock className="mr-2 h-4 w-4" />
                    Movimentações do Requisito
                  </TabsTrigger>
                  <TabsTrigger value="anexos">
                    <FileText className="mr-2 h-4 w-4" />
                    Anexos do Requisito
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="movimentacoes" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Histórico de Movimentações deste Requisito</CardTitle>
                      <CardDescription>Registro de todas as ações realizadas neste requisito</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Descrição</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movimentacoes.map((mov) => (
                            <TableRow key={mov.id}>
                              <TableCell>{mov.data}</TableCell>
                              <TableCell>{mov.funcionario}</TableCell>
                              <TableCell>{mov.descricao}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/admin/requisitos/${id}/nova-movimentacao`} className="ml-auto">
                        <Button variant="outline">
                          <Clock className="mr-2 h-4 w-4" />
                          Nova Movimentação
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="anexos" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Anexos deste Requisito</CardTitle>
                      <CardDescription>Arquivos associados a este requisito</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Tamanho</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {anexos.map((anexo) => (
                            <TableRow key={anexo.id}>
                              <TableCell>{anexo.nome}</TableCell>
                              <TableCell>{anexo.tipo}</TableCell>
                              <TableCell>{anexo.tamanho}</TableCell>
                              <TableCell>{anexo.data}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">Visualizar</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/admin/requisitos/${id}/novo-anexo`} className="ml-auto">
                        <Button variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Adicionar Anexo
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Requisito não encontrado</AlertTitle>
            <AlertDescription>O requisito solicitado não foi encontrado ou não existe.</AlertDescription>
          </Alert>
        )}

        {requisito && (
          <EditarRequisitoModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveRequisito}
            requisito={requisito}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
