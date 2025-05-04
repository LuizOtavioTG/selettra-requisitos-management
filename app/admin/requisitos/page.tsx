"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Filter } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NovoRequisitoModal } from "@/components/modals/novo-requisito-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"

// Dados de exemplo
const requisitosIniciais = [
  {
    id: "000001",
    codigo: "REQ-001",
    descricao: "Implementação de sistema de login com autenticação de dois fatores",
    status: "Cadastrada",
    situacao: "Ativa",
    funcionario: "João Silva",
    dataCriacao: "10/04/2023",
  },
  {
    id: "000002",
    codigo: "REQ-002",
    descricao: "Desenvolvimento de relatório de atividades mensais",
    status: "Andamento",
    situacao: "Ativa",
    funcionario: "Maria Oliveira",
    dataCriacao: "15/04/2023",
  },
  {
    id: "000003",
    codigo: "REQ-003",
    descricao: "Correção de bugs na interface do usuário",
    status: "Realizada",
    situacao: "Ativa",
    funcionario: "Carlos Santos",
    dataCriacao: "20/04/2023",
  },
  {
    id: "000004",
    codigo: "REQ-004",
    descricao: "Implementação de sistema de notificações por email",
    status: "Andamento",
    situacao: "Ativa",
    funcionario: "Ana Pereira",
    dataCriacao: "25/04/2023",
  },
  {
    id: "000005",
    codigo: "REQ-005",
    descricao: "Otimização de consultas ao banco de dados",
    status: "Cadastrada",
    situacao: "Inativa",
    funcionario: "Roberto Alves",
    dataCriacao: "30/04/2023",
  },
]

export default function RequisitosPage() {
  const [requisitos, setRequisitos] = useState(requisitosIniciais)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSaveRequisito = (data: any) => {
    // Gerar um ID de 6 dígitos
    const newId = String(Math.floor(100000 + Math.random() * 900000))

    // Obter o nome do funcionário com base no ID
    const funcionarioNomes: { [key: string]: string } = {
      "1": "João Silva",
      "2": "Maria Oliveira",
      "3": "Carlos Santos",
      "4": "Ana Pereira",
      "5": "Roberto Alves",
    }

    const funcionarioNome = funcionarioNomes[data.funcionario] || "Funcionário Desconhecido"

    // Criar data atual formatada
    const hoje = new Date()
    const dataFormatada = `${hoje.getDate().toString().padStart(2, "0")}/${(hoje.getMonth() + 1).toString().padStart(2, "0")}/${hoje.getFullYear()}`

    // Criar novo requisito
    const novoRequisito = {
      id: newId,
      codigo: data.codigo,
      descricao: data.descricao,
      status: data.status,
      situacao: data.situacao,
      funcionario: funcionarioNome,
      dataCriacao: dataFormatada,
    }

    // Adicionar à lista
    setRequisitos([novoRequisito, ...requisitos])
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

        <Card>
          <CardHeader>
            <CardTitle>Lista de Requisitos</CardTitle>
            <CardDescription>Visualize e gerencie todos os requisitos cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
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
                {requisitos.map((requisito) => (
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
                    <TableCell>{requisito.funcionario}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <NovoRequisitoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRequisito} />
      </div>
    </ProtectedRoute>
  )
}
