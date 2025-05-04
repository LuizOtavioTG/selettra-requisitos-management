"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Filter } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProtectedRoute } from "@/components/auth/protected-route"

// Dados de exemplo
const funcionarios = [
  {
    id: 1,
    nome: "João Silva",
    status: "Ativo",
    setor: "Desenvolvimento",
    email: "joao.silva@empresa.com",
    telefone: "(11) 98765-4321",
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    status: "Ativo",
    setor: "Análise",
    email: "maria.oliveira@empresa.com",
    telefone: "(11) 91234-5678",
  },
  {
    id: 3,
    nome: "Carlos Santos",
    status: "Ativo",
    setor: "Qualidade",
    email: "carlos.santos@empresa.com",
    telefone: "(11) 99876-5432",
  },
  {
    id: 4,
    nome: "Ana Pereira",
    status: "Inativo",
    setor: "Desenvolvimento",
    email: "ana.pereira@empresa.com",
    telefone: "(11) 95678-1234",
  },
  {
    id: 5,
    nome: "Roberto Alves",
    status: "Ativo",
    setor: "Suporte",
    email: "roberto.alves@empresa.com",
    telefone: "(11) 94321-8765",
  },
]

export default function FuncionariosPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Funcionários</h2>
            <p className="text-muted-foreground">Gerencie os funcionários do sistema</p>
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
                <DropdownMenuItem>Ativos</DropdownMenuItem>
                <DropdownMenuItem>Inativos</DropdownMenuItem>
                <DropdownMenuItem>Desenvolvimento</DropdownMenuItem>
                <DropdownMenuItem>Análise</DropdownMenuItem>
                <DropdownMenuItem>Qualidade</DropdownMenuItem>
                <DropdownMenuItem>Suporte</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/admin/funcionarios/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Funcionário
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
            <CardDescription>Visualize e gerencie todos os funcionários cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
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
                {funcionarios.map((funcionario) => (
                  <TableRow key={funcionario.id}>
                    <TableCell className="font-medium">{funcionario.id}</TableCell>
                    <TableCell>{funcionario.nome}</TableCell>
                    <TableCell>
                      <Badge variant={funcionario.status === "Ativo" ? "outline" : "secondary"}>
                        {funcionario.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{funcionario.setor}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
