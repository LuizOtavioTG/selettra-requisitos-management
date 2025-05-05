import { getTokenSilently } from "@/lib/auth/token-service"

// URL base do site SharePoint
const SHAREPOINT_SITE_URL = "https://luizotg.sharepoint.com/sites/Selettra"

// Interface para o tipo Setor
export interface Setor {
  id: string | number
  nome: string
  totalFuncionarios: number
  descricao: string
  funcionarioId?: string | number
}

// Interface para o tipo Funcionário
export interface Funcionario {
  id: string | number
  nome: string
  email: string
  telefone: string
  status: string
  setorId: string | number
  setorNome: string
}

// Função para obter os setores do SharePoint
export async function getSetores(): Promise<Setor[]> {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Endpoint da API do Microsoft Graph para acessar a lista de setores
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Setores/items?expand=fields&$top=1000`

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao obter setores: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Obter funcionários para contagem
    const funcionarios = await getFuncionarios()

    // Contar funcionários por setor
    const funcionariosPorSetor = funcionarios.reduce((acc: Record<string, number>, funcionario: Funcionario) => {
      const setorId = funcionario.setorId.toString()
      acc[setorId] = (acc[setorId] || 0) + 1
      return acc
    }, {})

    // Mapear os dados para o formato esperado pela aplicação
    return data.value.map((item: any) => ({
      id: item.id,
      nome: item.fields.Title || "Sem nome",
      // Usar o nome correto do campo de descrição conforme o JSON
      descricao: item.fields.Descri_x00e7__x00e3_o || "Sem descrição",
      // Usar a contagem de funcionários ou o valor do campo, ou zero
      totalFuncionarios: funcionariosPorSetor[item.id] || 0,
      // Adicionar o ID do funcionário associado, se existir
      funcionarioId: item.fields.Funcin_x00e1_rio_x0028_s_x0029_LookupId || null,
    }))
  } catch (error) {
    console.error("Erro ao obter setores do SharePoint:", error)
    throw error
  }
}

// Função para obter os funcionários do SharePoint
export async function getFuncionarios(): Promise<Funcionario[]> {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Endpoint da API do Microsoft Graph para acessar a lista de funcionários
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Funcionários/items?expand=fields&$top=1000`

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // Se a lista não existir ou houver outro erro, retornar array vazio
      console.warn("Não foi possível obter a lista de funcionários. Retornando array vazio.")
      return []
    }

    const data = await response.json()

    // Obter setores para mapear IDs para nomes
    const setoresResponse = await fetch(
      `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Setores/items?expand=fields&$top=1000`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    )

    const setoresData = await setoresResponse.json()
    const setoresMap = new Map(setoresData.value.map((setor: any) => [setor.id, setor.fields.Title]))

    // Mapear os dados para o formato esperado pela aplicação
    return data.value.map((item: any) => {
      // Tentar obter o ID do setor do funcionário
      const setorId = item.fields.SetorLookupId || ""

      return {
        id: item.id,
        nome: item.fields.Title || "Sem nome",
        email: item.fields.Email || "",
        telefone: item.fields.Telefone || "",
        status: item.fields.Status || "Ativo",
        setorId: setorId,
        setorNome: setoresMap.get(setorId) || "Sem setor",
      }
    })
  } catch (error) {
    console.error("Erro ao obter funcionários do SharePoint:", error)
    // Em caso de erro, retornar array vazio para não quebrar a aplicação
    return []
  }
}

// Função para adicionar um novo setor
export async function adicionarSetor(setor: { nome: string; descricao: string }): Promise<Setor> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Setores/items`

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: setor.nome,
          // Usar o nome correto do campo de descrição
          Descri_x00e7__x00e3_o: setor.descricao,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao adicionar setor: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return {
      id: data.id,
      nome: data.fields.Title,
      descricao: data.fields.Descri_x00e7__x00e3_o || "",
      totalFuncionarios: 0,
    }
  } catch (error) {
    console.error("Erro ao adicionar setor no SharePoint:", error)
    throw error
  }
}

// Função para atualizar um setor existente
export async function atualizarSetor(
  id: string,
  setor: {
    nome: string
    descricao: string
    funcionarioId?: string | number
  },
): Promise<Setor> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Setores/items/${id}`

    console.log("Atualizando setor:", id, setor)

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: setor.nome,
          Descri_x00e7__x00e3_o: setor.descricao,
          Funcin_x00e1_rio_x0028_s_x0029_LookupId: setor.funcionarioId,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao atualizar setor: ${JSON.stringify(errorData)}`)
    }

    // Obter o setor atualizado
    const setorAtualizado = await getSetorById(id)
    if (!setorAtualizado) {
      throw new Error("Não foi possível obter o setor atualizado")
    }

    return setorAtualizado
  } catch (error) {
    console.error(`Erro ao atualizar setor com ID ${id}:`, error)
    throw error
  }
}

// Função para excluir um setor
export async function excluirSetor(id: string): Promise<boolean> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Setores/items/${id}`

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Erro ao excluir setor: ${errorData}`)
    }

    return true
  } catch (error) {
    console.error(`Erro ao excluir setor com ID ${id}:`, error)
    throw error
  }
}

// Função para obter detalhes de um setor específico
export async function getSetorById(id: string): Promise<Setor | null> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Setores/items/${id}?expand=fields`

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
      throw new Error(`Erro ao obter setor: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Obter funcionários para contagem
    const funcionarios = await getFuncionarios()
    const funcionariosDoSetor = funcionarios.filter((f) => f.setorId.toString() === id.toString())

    return {
      id: data.id,
      nome: data.fields.Title || "Sem nome",
      descricao: data.fields.Descri_x00e7__x00e3_o || "Sem descrição",
      totalFuncionarios: funcionariosDoSetor.length,
      funcionarioId: data.fields.Funcin_x00e1_rio_x0028_s_x0029_LookupId || null,
    }
  } catch (error) {
    console.error(`Erro ao obter setor com ID ${id}:`, error)
    throw error
  }
}

// Função para obter funcionários de um setor específico
export async function getFuncionariosPorSetor(setorId: string): Promise<Funcionario[]> {
  try {
    const funcionarios = await getFuncionarios()
    return funcionarios.filter((funcionario) => funcionario.setorId.toString() === setorId.toString())
  } catch (error) {
    console.error(`Erro ao obter funcionários do setor ${setorId}:`, error)
    return []
  }
}
