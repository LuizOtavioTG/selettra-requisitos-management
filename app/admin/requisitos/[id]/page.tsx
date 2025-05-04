"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash, Upload, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { EditarRequisitoModal } from "@/components/modals/editar-requisito-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"

// Dados de exemplo
const requisito = {
  id: "000001",
  codigo: "REQ-001",
  descricao: "Implementação de sistema de login com autenticação de dois fatores",
  status: "Cadastrada",
  situacao: "Ativa",
  funcionario: "João Silva",
  setor: "Desenvolvimento",
  dataCriacao: "10/04/2023",
}

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
  const id = params.id
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [requisitoAtual, setRequisitoAtual] = useState(requisito)

  const handleSaveRequisito = (data: any) => {
    // Obter o nome do funcionário com base no ID
    const funcionarioNomes: { [key: string]: string } = {
      "1": "João Silva",
      "2": "Maria Oliveira",
      "3": "Carlos Santos",
      "4": "Ana Pereira",
      "5": "Roberto Alves",
    }

    const funcionarioNome = funcionarioNomes[data.funcionario] || "Funcionário Desconhecido"

    // Atualizar o requisito
    const requisitoAtualizado = {
      ...requisitoAtual,
      codigo: data.codigo,
      descricao: data.descricao,
      status: data.status,
      situacao: data.situacao,
      funcionario: funcionarioNome,
    }

    setRequisitoAtual(requisitoAtualizado)
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
            <Link href="/admin/requisitos">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive">
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {requisitoAtual.codigo} - ID: {requisitoAtual.id}
                </CardTitle>
                <CardDescription>
                  Criado em {requisitoAtual.dataCriacao} por {requisitoAtual.funcionario}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={
                    requisitoAtual.status === "Realizada"
                      ? "success"
                      : requisitoAtual.status === "Andamento"
                        ? "warning"
                        : "default"
                  }
                >
                  {requisitoAtual.status}
                </Badge>
                <Badge variant={requisitoAtual.situacao === "Ativa" ? "outline" : "secondary"}>
                  {requisitoAtual.situacao}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p>{requisitoAtual.descricao}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Funcionário Responsável</h3>
                <p>{requisitoAtual.funcionario}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Setor</h3>
                <p>{requisitoAtual.setor}</p>
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
        <EditarRequisitoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveRequisito}
          requisito={requisitoAtual}
        />
      </div>
    </ProtectedRoute>
  )
}
