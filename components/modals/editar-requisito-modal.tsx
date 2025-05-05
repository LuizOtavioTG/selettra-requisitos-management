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
import type { Requisito } from "@/lib/sharepoint/requisitos-service"
import { atualizarRequisito } from "@/lib/sharepoint/requisitos-service"

interface EditarRequisitoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Requisito) => void
  requisito: Requisito
  funcionarios?: Array<{ id: string | number; nome: string }>
}

export function EditarRequisitoModal({
  isOpen,
  onClose,
  onSave,
  requisito,
  funcionarios = [],
}: EditarRequisitoModalProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    descricaoCompleta: "",
    status: "",
    situacao: "",
    funcionarioId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Atualiza o formulário quando o requisito muda
  useEffect(() => {
    if (requisito) {
      setFormData({
        codigo: requisito.codigo || "",
        descricao: requisito.descricao || "",
        descricaoCompleta: requisito.descricaoCompleta || "",
        status: requisito.status || "Cadastrada",
        situacao: requisito.situacao || "Ativa",
        funcionarioId: requisito.funcionarioId?.toString() || "",
      })
    }
  }, [requisito])

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
      // Atualizar o requisito no SharePoint
      const requisitoAtualizado = await atualizarRequisito(requisito.id.toString(), {
        codigo: formData.codigo,
        descricao: formData.descricao,
        descricaoCompleta: formData.descricaoCompleta,
        status: formData.status,
        situacao: formData.situacao,
        funcionarioId: formData.funcionarioId ? formData.funcionarioId : undefined,
      })

      // Notificar o componente pai sobre a atualização
      onSave(requisitoAtualizado)
      onClose()
    } catch (err: any) {
      console.error("Erro ao salvar requisito:", err)
      setError(err.message || "Erro ao atualizar o requisito")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Requisito</DialogTitle>
            <DialogDescription>Atualize as informações do requisito #{requisito?.id}.</DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              <p className="font-medium">Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código Alfanumérico</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  placeholder="Ex: REQ-001"
                  value={formData.codigo}
                  onChange={handleChange}
                  required
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

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva o requisito brevemente"
                value={formData.descricao}
                onChange={handleChange}
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricaoCompleta">Descrição Completa</Label>
              <Textarea
                id="descricaoCompleta"
                name="descricaoCompleta"
                placeholder="Descreva o requisito detalhadamente, incluindo user stories, critérios de aceite, etc."
                value={formData.descricaoCompleta}
                onChange={handleChange}
                rows={8}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cadastrada">Cadastrada</SelectItem>
                    <SelectItem value="Andamento">Andamento</SelectItem>
                    <SelectItem value="Realizada">Realizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="situacao">Situação</Label>
                <Select value={formData.situacao} onValueChange={(value) => handleSelectChange("situacao", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
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
