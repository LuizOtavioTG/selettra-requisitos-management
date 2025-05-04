"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function NovoAnexoPage() {
  const params = useParams()
  const requisitoId = params.id

  const [formData, setFormData] = useState({
    tipo: "",
    arquivo: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, arquivo: e.target.files![0] }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui seria implementada a lógica para salvar o anexo
    console.log("Dados do anexo:", { ...formData, requisitoId })
    // Redirecionar para a página de detalhes do requisito após salvar
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Novo Anexo</h2>
            <p className="text-muted-foreground">Adicione um novo anexo ao requisito #{requisitoId}</p>
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
              <CardTitle>Detalhes do Anexo</CardTitle>
              <CardDescription>Selecione o arquivo e informe o tipo de anexo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Anexo</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de anexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documento">Documento</SelectItem>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="planilha">Planilha</SelectItem>
                    <SelectItem value="apresentacao">Apresentação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo</Label>
                <div className="grid w-full items-center gap-1.5">
                  <Input id="arquivo" type="file" onChange={handleFileChange} required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Link href={`/admin/requisitos/${requisitoId}`}>
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit">
                <Upload className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </ProtectedRoute>
  )
}
