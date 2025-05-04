"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, FileText, Users, RefreshCw } from "lucide-react"
import Link from "next/link"
import { NovoSetorModal } from "@/components/modals/novo-setor-modal"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getSetores, adicionarSetor, type Setor } from "@/lib/sharepoint/sharepoint-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function SetoresPage() {
  const [setores, setSetores] = useState<Setor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Função para carregar os setores
  const carregarSetores = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getSetores()
      setSetores(data)
    } catch (err) {
      console.error("Erro ao carregar setores:", err)
      setError("Não foi possível carregar os setores. Verifique sua conexão e permissões.")
    } finally {
      setLoading(false)
    }
  }

  // Carregar setores ao montar o componente
  useEffect(() => {
    carregarSetores()
  }, [])

  // Função para atualizar a lista
  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarSetores()
    setRefreshing(false)
  }

  // Função para salvar um novo setor
  const handleSaveSetor = async (data: { nome: string; descricao: string }) => {
    try {
      setError(null)
      const novoSetor = await adicionarSetor(data)
      setSetores([...setores, novoSetor])
    } catch (err) {
      console.error("Erro ao salvar setor:", err)
      setError("Não foi possível adicionar o setor. Verifique sua conexão e permissões.")
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Setores</h2>
            <p className="text-muted-foreground">Gerencie os setores da empresa</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading || refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Atualizar</span>
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Setor
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
            <CardTitle>Lista de Setores</CardTitle>
            <CardDescription>Visualize e gerencie todos os setores cadastrados no sistema</CardDescription>
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
                    <TableHead>Funcionários</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum setor encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    setores.map((setor) => (
                      <TableRow key={setor.id}>
                        <TableCell className="font-medium">{setor.id}</TableCell>
                        <TableCell>{setor.nome}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            {setor.totalFuncionarios}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{setor.descricao}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/setores/${setor.id}`}>
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

        <NovoSetorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveSetor} />
      </div>
    </ProtectedRoute>
  )
}
