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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import type { Setor } from "@/lib/sharepoint/sharepoint-service"
import { atualizarSetor } from "@/lib/sharepoint/sharepoint-service"

interface EditarSetorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Setor) => void
  setor: Setor
  funcionarios?: Array<{ id: string | number; nome: string }>
}

export function EditarSetorModal({ isOpen, onClose, onSave, setor, funcionarios = [] }: EditarSetorModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    funcionarioId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Atualiza o formulário quando o setor muda
  useEffect(() => {
    if (setor) {
      setFormData({
        nome: setor.nome || "",
        descricao: setor.descricao || "",
        funcionarioId: setor.funcionarioId?.toString() || "",
      })
    }
  }, [setor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Atualizar o setor no SharePoint
      const setorAtualizado = await atualizarSetor(setor.id.toString(), {
        nome: formData.nome,
        descricao: formData.descricao,
        funcionarioId: formData.funcionarioId ? formData.funcionarioId : undefined,
      })

      // Notificar o componente pai sobre a atualização
      onSave(setorAtualizado)
      onClose()
    } catch (err: any) {
      console.error("Erro ao salvar setor:", err)
      setError(err.message || "Erro ao atualizar o setor")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Setor</DialogTitle>
            <DialogDescription>Atualize as informações do setor #{setor?.id}.</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              <p className="font-medium">Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Setor</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Desenvolvimento"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva a função deste setor"
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funcionarioId">Funcionário Responsável</Label>
              <Select
                value={formData.funcionarioId}
                onValueChange={(value) => handleSelectChange("funcionarioId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">Nenhum</SelectItem>
                  {funcionarios.map((funcionario) => (
                    <SelectItem key={funcionario.id.toString()} value={funcionario.id.toString()}>
                      {funcionario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
