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

interface EditarRequisitoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  requisito: any
}

export function EditarRequisitoModal({ isOpen, onClose, onSave, requisito }: EditarRequisitoModalProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    status: "",
    situacao: "",
    funcionario: "",
  })

  // Atualiza o formulário quando o requisito muda
  useEffect(() => {
    if (requisito) {
      // Mapear o nome do funcionário para o ID (simplificado para este exemplo)
      const funcionarioIds: { [key: string]: string } = {
        "João Silva": "1",
        "Maria Oliveira": "2",
        "Carlos Santos": "3",
        "Ana Pereira": "4",
        "Roberto Alves": "5",
      }

      setFormData({
        codigo: requisito.codigo || "",
        descricao: requisito.descricao || "",
        status: requisito.status || "Cadastrada",
        situacao: requisito.situacao || "Ativa",
        funcionario: funcionarioIds[requisito.funcionario] || "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: requisito.id })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Requisito</DialogTitle>
            <DialogDescription>Atualize as informações do requisito #{requisito?.id}.</DialogDescription>
          </DialogHeader>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva o requisito detalhadamente"
                value={formData.descricao}
                onChange={handleChange}
                rows={4}
                required
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
