"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function NovaMovimentacaoPage() {
  const params = useParams()
  const requisitoId = params.id

  const [formData, setFormData] = useState({
    funcionario: "",
    acao: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui seria implementada a lógica para salvar a movimentação
    console.log("Dados da movimentação:", { ...formData, requisitoId })
    // Redirecionar para a página de detalhes do requisito após salvar
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
                    <SelectItem value="1">João Silva</SelectItem>
                    <SelectItem value="2">Maria Oliveira</SelectItem>
                    <SelectItem value="3">Carlos Santos</SelectItem>
                    <SelectItem value="4">Ana Pereira</SelectItem>
                    <SelectItem value="5">Roberto Alves</SelectItem>
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
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </ProtectedRoute>
  )
}
