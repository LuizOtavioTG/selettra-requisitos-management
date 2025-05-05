import { getTokenSilently } from "@/lib/auth/token-service"

// Interface para o tipo Requisito
export interface Requisito {
  id: string | number
  codigo: string
  descricao: string
  descricaoCompleta?: string
  status: string
  situacao: string
  funcionarioId?: string | number
  funcionarioNome?: string
  setorNome?: string
  dataCriacao: string
}

// Função para obter os requisitos do SharePoint
export async function getRequisitos(): Promise<Requisito[]> {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Endpoint da API do Microsoft Graph para acessar a lista de requisitos
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Requisitos/items?expand=fields&$top=1000`

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao obter requisitos: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Mapear os dados para o formato esperado pela aplicação
    return data.value.map((item: any) => ({
      id: item.id,
      codigo: item.fields.Title || "",
      descricao: item.fields.Descri_x00e7__x00e3_o || "",
      descricaoCompleta: item.fields.Descri_x00e7__x00e3_ocompleta || "",
      status: item.fields.Status || "Cadastrada",
      situacao: item.fields.Situa_x00e7__x00e3_o || "Ativa",
      funcionarioId: item.fields.Funcion_x00e1_rio_x0028_s_x0029_LookupId || null,
      funcionarioNome: item.fields.Funcion_x00e1_rio_x0028_s_x0029_ || "",
      dataCriacao: formatarData(item.fields.Created) || "",
    }))
  } catch (error) {
    console.error("Erro ao obter requisitos do SharePoint:", error)
    throw error
  }
}

// Função para obter um requisito específico
export async function getRequisitoById(id: string): Promise<Requisito | null> {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Endpoint da API do Microsoft Graph para acessar o item
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Requisitos/items/${id}?expand=fields`

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errorData = await response.json()
      throw new Error(`Erro ao obter requisito: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Mapear os dados para o formato esperado pela aplicação
    return {
      id: data.id,
      codigo: data.fields.Title || "",
      descricao: data.fields.Descri_x00e7__x00e3_o || "",
      descricaoCompleta: data.fields.Descri_x00e7__x00e3_ocompleta || "",
      status: data.fields.Status || "Cadastrada",
      situacao: data.fields.Situa_x00e7__x00e3_o || "Ativa",
      funcionarioId: data.fields.Funcion_x00e1_rio_x0028_s_x0029_LookupId || null,
      funcionarioNome: data.fields.Funcion_x00e1_rio_x0028_s_x0029_ || "",
      dataCriacao: formatarData(data.fields.Created) || "",
    }
  } catch (error) {
    console.error(`Erro ao obter requisito com ID ${id}:`, error)
    throw error
  }
}

// Função para adicionar um novo requisito
export async function adicionarRequisito(requisito: {
  codigo: string
  descricao: string
  descricaoCompleta?: string
  status: string
  situacao: string
  funcionarioId?: string | number
}): Promise<Requisito> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Requisitos/items`

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: requisito.codigo,
          Descri_x00e7__x00e3_o: requisito.descricao,
          Descri_x00e7__x00e3_ocompleta: requisito.descricaoCompleta || "",
          Status: requisito.status,
          Situa_x00e7__x00e3_o: requisito.situacao,
          Funcion_x00e1_rio_x0028_s_x0029_LookupId: requisito.funcionarioId,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao adicionar requisito: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return {
      id: data.id,
      codigo: data.fields.Title || "",
      descricao: data.fields.Descri_x00e7__x00e3_o || "",
      descricaoCompleta: data.fields.Descri_x00e7__x00e3_ocompleta || "",
      status: data.fields.Status || "Cadastrada",
      situacao: data.fields.Situa_x00e7__x00e3_o || "Ativa",
      funcionarioId: data.fields.Funcion_x00e1_rio_x0028_s_x0029_LookupId || null,
      funcionarioNome: data.fields.Funcion_x00e1_rio_x0028_s_x0029_ || "",
      dataCriacao: formatarData(data.fields.Created) || "",
    }
  } catch (error) {
    console.error("Erro ao adicionar requisito no SharePoint:", error)
    throw error
  }
}

// Função para atualizar um requisito existente
export async function atualizarRequisito(
  id: string,
  requisito: {
    codigo: string
    descricao: string
    descricaoCompleta?: string
    status: string
    situacao: string
    funcionarioId?: string | number
  },
): Promise<Requisito> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Requisitos/items/${id}`

    console.log("Atualizando requisito:", id, requisito)

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: requisito.codigo,
          Descri_x00e7__x00e3_o: requisito.descricao,
          Descri_x00e7__x00e3_ocompleta: requisito.descricaoCompleta || "",
          Status: requisito.status,
          Situa_x00e7__x00e3_o: requisito.situacao,
          Funcion_x00e1_rio_x0028_s_x0029_LookupId: requisito.funcionarioId,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao atualizar requisito: ${JSON.stringify(errorData)}`)
    }

    // Obter o requisito atualizado
    const requisitoAtualizado = await getRequisitoById(id)
    if (!requisitoAtualizado) {
      throw new Error("Não foi possível obter o requisito atualizado")
    }

    return requisitoAtualizado
  } catch (error) {
    console.error(`Erro ao atualizar requisito com ID ${id}:`, error)
    throw error
  }
}

// Função para excluir um requisito
export async function excluirRequisito(id: string): Promise<boolean> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Requisitos/items/${id}`

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Erro ao excluir requisito: ${errorData}`)
    }

    return true
  } catch (error) {
    console.error(`Erro ao excluir requisito com ID ${id}:`, error)
    throw error
  }
}

// Função auxiliar para formatar data
function formatarData(dataString?: string): string {
  if (!dataString) return ""

  try {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dataString
  }
}
