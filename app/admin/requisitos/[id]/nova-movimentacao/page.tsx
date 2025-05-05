"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { adicionarMovimentacao } from "@/lib/sharepoint/movimentacoes-service"
import { getFuncionarios } from "@/lib/sharepoint/funcionarios-service"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function NovaMovimentacaoPage() {
  const params = useParams()
  const router = useRouter()
  const requisitoId = params.id as string
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    funcionario: "",
    acao: "",
  })
  const [funcionarios, setFuncionarios] = useState<Array<{ id: string | number; nome: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar funcionários ao montar o componente
  useEffect(() => {
    const carregarFuncionarios = async () => {
      try {
        const data = await getFuncionarios()
        setFuncionarios(data.map((f) => ({ id: f.id, nome: f.nome })))
      } catch (err: any) {
        console.error("Erro ao carregar funcionários:", err)
        setError("Não foi possível carregar a lista de funcionários.")
      }
    }

    carregarFuncionarios()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Enviando movimentação:", {
        descricao: formData.acao,
        requisitoId: requisitoId,
        funcionarioId: formData.funcionario || undefined,
      })

      // Adicionar a movimentação
      await adicionarMovimentacao({
        descricao: formData.acao,
        requisitoId: requisitoId,
        funcionarioId: formData.funcionario || undefined,
      })

      toast({
        title: "Movimentação registrada",
        description: "A movimentação foi registrada com sucesso.",
      })

      // Redirecionar para a página de detalhes do requisito
      router.push(`/admin/requisitos/${requisitoId}`)
    } catch (err: any) {
      console.error("Erro ao salvar movimentação:", err)
      setError(err.message || "Ocorreu um erro ao registrar a movimentação.")
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar a movimentação.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nova Movimentação</h2>
            <p className="text-muted-foreground">Registre uma nova movimentação para o requisito #{requisitoId}</p>
          </div>
          <Link href={`/admin/requisitos/${requisitoId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Movimentação</CardTitle>
              <CardDescription>Preencha as informações da nova movimentação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="funcionario">Funcionário Responsável</Label>
                <Select
                  value={formData.funcionario}
                  onValueChange={(value) => handleSelectChange("funcionario", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionarios.length === 0 ? (
                      <SelectItem value="carregando">Carregando funcionários...</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="selecione">Selecione um funcionário</SelectItem>
                        {funcionarios.map((funcionario) => (
                          <SelectItem key={funcionario.id.toString()} value={funcionario.id.toString()}>
                            {funcionario.nome}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acao">Descrição da Ação</Label>
                <Textarea
                  id="acao"
                  name="acao"
                  placeholder="Descreva a ação realizada no requisito"
                  value={formData.acao}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Link href={`/admin/requisitos/${requisitoId}`}>
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </ProtectedRoute>
  )
}
