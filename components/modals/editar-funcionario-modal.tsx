"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import type { Funcionario } from "@/lib/sharepoint/funcionarios-service"
import { atualizarFuncionario } from "@/lib/sharepoint/funcionarios-service"

interface EditarFuncionarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Funcionario) => void
  funcionario: Funcionario
  setores: Array<{ id: string | number; nome: string }>
}

export function EditarFuncionarioModal({ isOpen, onClose, onSave, funcionario, setores }: EditarFuncionarioModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    status: "",
    setorId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Atualiza o formulário quando o funcionário muda
  useEffect(() => {
    if (funcionario) {
      setFormData({
        nome: funcionario.nome || "",
        email: funcionario.email || "",
        telefone: funcionario.telefone || "",
        status: funcionario.status || "Ativo",
        setorId: funcionario.setorId?.toString() || "",
      })
    }
  }, [funcionario])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Atualizar o funcionário no SharePoint
      const funcionarioAtualizado = await atualizarFuncionario(funcionario.id.toString(), {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        status: formData.status as "Ativo" | "Inativo",
        setorId: formData.setorId ? formData.setorId : undefined,
      })

      // Notificar o componente pai sobre a atualização
      onSave(funcionarioAtualizado)
      onClose()
    } catch (err: any) {
      console.error("Erro ao salvar funcionário:", err)
      setError(err.message || "Erro ao atualizar o funcionário")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
            <DialogDescription>Atualize as informações do funcionário #{funcionario?.id}.</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              <p className="font-medium">Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setorId">Setor</Label>
                <Select value={formData.setorId} onValueChange={(value) => handleSelectChange("setorId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Nenhum</SelectItem>
                    {setores.map((setor) => (
                      <SelectItem key={setor.id.toString()} value={setor.id.toString()}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
