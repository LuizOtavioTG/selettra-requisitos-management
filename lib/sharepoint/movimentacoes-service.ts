import { getTokenSilently } from "@/lib/auth/token-service"
import { getFuncionarioById } from "./funcionarios-service"

// Interface para o tipo Movimentacao
export interface Movimentacao {
  id: string | number
  descricao: string
  requisitoId: string | number
  funcionarioId: string | number
  funcionarioNome: string
  dataCriacao: string
}

// Função para obter movimentações por ID do requisito
export async function getMovimentacoesByRequisitoId(requisitoId: string): Promise<Movimentacao[]> {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Endpoint da API do Microsoft Graph para acessar a lista de movimentações
    // Removendo a ordenação da URL para evitar o erro
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Movimenta%C3%A7%C3%A3o/items?expand=fields`

    console.log(`Buscando movimentações para o requisito ${requisitoId}`)

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "HonorNonIndexedQueriesWarningMayFailRandomly",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`Erro na resposta da API:`, errorData)
      throw new Error(`Erro ao obter movimentações: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log(`Total de movimentações encontradas:`, data.value.length)

    // Filtrar manualmente as movimentações pelo ID do requisito
    const filteredItems = data.value.filter((item: any) => {
      return item.fields.RequisitoLookupId?.toString() === requisitoId.toString()
    })

    console.log(`Movimentações filtradas para o requisito ${requisitoId}:`, filteredItems.length)

    // Ordenar manualmente as movimentações por data de criação (mais recentes primeiro)
    filteredItems.sort((a, b) => {
      const dateA = new Date(a.fields.Created || 0).getTime()
      const dateB = new Date(b.fields.Created || 0).getTime()
      return dateB - dateA // Ordem decrescente (mais recentes primeiro)
    })

    // Mapear os dados para o formato esperado pela aplicação
    const movimentacoes = await Promise.all(
      filteredItems.map(async (item: any) => {
        // Tentar obter o nome do funcionário
        let funcionarioNome = "Usuário do sistema"
        try {
          if (item.fields.Funcion_x00e1_rioLookupId) {
            const funcionario = await getFuncionarioById(item.fields.Funcion_x00e1_rioLookupId)
            if (funcionario) {
              funcionarioNome = funcionario.nome
            }
          }
        } catch (error) {
          console.error("Erro ao obter nome do funcionário:", error)
        }

        // Formatar a data
        const dataCriacao = formatarData(item.fields.Created)

        return {
          id: item.id,
          descricao: item.fields.Title || "",
          requisitoId: item.fields.RequisitoLookupId || "",
          funcionarioId: item.fields.Funcion_x00e1_rioLookupId || "",
          funcionarioNome: funcionarioNome,
          dataCriacao: dataCriacao,
        }
      }),
    )

    return movimentacoes
  } catch (error) {
    console.error(`Erro ao obter movimentações do requisito ${requisitoId}:`, error)
    throw error
  }
}

// Função para adicionar uma nova movimentação
export async function adicionarMovimentacao(movimentacao: {
  descricao: string
  requisitoId: string | number
  funcionarioId?: string | number
}): Promise<Movimentacao | null> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Movimenta%C3%A7%C3%A3o/items`

    console.log("Adicionando movimentação:", movimentacao)

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: movimentacao.descricao,
          RequisitoLookupId: movimentacao.requisitoId,
          Funcion_x00e1_rioLookupId: movimentacao.funcionarioId,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro ao adicionar movimentação:", errorData)
      throw new Error(`Erro ao adicionar movimentação: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log("Movimentação adicionada com sucesso:", data)

    // Obter o nome do funcionário
    let funcionarioNome = "Usuário do sistema"
    if (movimentacao.funcionarioId) {
      try {
        const funcionario = await getFuncionarioById(movimentacao.funcionarioId.toString())
        if (funcionario) {
          funcionarioNome = funcionario.nome
        }
      } catch (error) {
        console.error("Erro ao obter nome do funcionário:", error)
      }
    }

    return {
      id: data.id,
      descricao: data.fields.Title || "",
      requisitoId: data.fields.RequisitoLookupId || "",
      funcionarioId: data.fields.Funcion_x00e1_rioLookupId || "",
      funcionarioNome: funcionarioNome,
      dataCriacao: formatarData(data.fields.Created),
    }
  } catch (error) {
    console.error("Erro ao adicionar movimentação:", error)
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
