"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { JsonViewer } from "@/components/debug/json-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSharePointListRaw, getSharePointListDetails } from "@/lib/sharepoint/debug-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Lista de opções disponíveis
const listaOptions = [
  { value: "Lista de Requisitos", label: "Lista de Requisitos" },
  { value: "Lista de Setores", label: "Lista de Setores" },
  { value: "Lista de Funcionários", label: "Lista de Funcionários" },
]

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listData, setListData] = useState<any>(null)
  const [columnsData, setColumnsData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("items")
  const [selectedList, setSelectedList] = useState("Lista de Requisitos")

  // Carregar dados automaticamente ao montar o componente ou quando a lista selecionada mudar
  useEffect(() => {
    loadListData()
  }, [selectedList])

  // Função para carregar os dados da lista selecionada
  const loadListData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar itens da lista
      const listResult = await getSharePointListRaw(selectedList)
      setListData(listResult)

      // Carregar detalhes da lista (colunas)
      const columnsResult = await getSharePointListDetails(selectedList)
      setColumnsData(columnsResult)
    } catch (err: any) {
      setError(err.message || `Erro ao carregar dados da ${selectedList}`)
      console.error("Erro ao carregar dados:", err)
    } finally {
      setLoading(false)
    }
  }

  // Função para lidar com a mudança de lista selecionada
  const handleListChange = (value: string) => {
    setSelectedList(value)
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Debug SharePoint</h2>
            <p className="text-muted-foreground">Visualização dos dados brutos das listas do SharePoint</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadListData} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar Dados
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label htmlFor="list-select" className="whitespace-nowrap">
            Selecionar Lista:
          </Label>
          <Select value={selectedList} onValueChange={handleListChange}>
            <SelectTrigger id="list-select" className="w-[300px]">
              <SelectValue placeholder="Selecione uma lista" />
            </SelectTrigger>
            <SelectContent>
              {listaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="items">Registros</TabsTrigger>
            <TabsTrigger value="columns">Colunas</TabsTrigger>
            <TabsTrigger value="raw">Dados Brutos</TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Registros da {selectedList}</CardTitle>
                <CardDescription>Todos os itens da lista com seus campos</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : listData?.value ? (
                  <div className="space-y-6">
                    <div className="text-sm text-muted-foreground">
                      Total de registros: <strong>{listData.value.length}</strong>
                    </div>

                    {listData.value.map((item: any, index: number) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 py-2">
                          <CardTitle className="text-base flex justify-between">
                            <span>
                              Item #{index + 1} (ID: {item.id})
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
                            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(item.fields, null, 2)}</pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="columns">
            <Card>
              <CardHeader>
                <CardTitle>Colunas da {selectedList}</CardTitle>
                <CardDescription>Definição de todas as colunas da lista</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : columnsData?.columns ? (
                  <div className="space-y-6">
                    <div className="text-sm text-muted-foreground">
                      Total de colunas: <strong>{columnsData.columns.length}</strong>
                    </div>

                    <div className="overflow-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Nome</th>
                            <th className="border p-2 text-left">Display Name</th>
                            <th className="border p-2 text-left">Tipo</th>
                            <th className="border p-2 text-left">Obrigatório</th>
                          </tr>
                        </thead>
                        <tbody>
                          {columnsData.columns.map((column: any) => (
                            <tr key={column.name} className="hover:bg-muted/50">
                              <td className="border p-2">{column.name}</td>
                              <td className="border p-2">{column.displayName}</td>
                              <td className="border p-2">{column.columnGroup || column.dataType || "N/A"}</td>
                              <td className="border p-2">{column.required ? "Sim" : "Não"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="raw">
            <div className="grid gap-6 md:grid-cols-2">
              {listData && (
                <JsonViewer title="Dados da Lista" description="JSON completo dos itens da lista" data={listData} />
              )}

              {columnsData && (
                <JsonViewer
                  title="Estrutura da Lista"
                  description="JSON completo da definição da lista"
                  data={columnsData}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
