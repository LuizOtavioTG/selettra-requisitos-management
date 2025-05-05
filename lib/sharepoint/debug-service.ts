import { getTokenSilently } from "@/lib/auth/token-service"

// Função para obter os dados brutos de uma lista do SharePoint
export async function getSharePointListRaw(listName: string) {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Codificar o nome da lista para URL
    // Tratamento especial para a lista de funcionários que tem codificação diferente na URL
    let encodedListName
    if (listName === "Lista de Funcionários") {
      encodedListName = "Lista%20de%20Funcion%C3%A1rios"
    } else {
      encodedListName = encodeURIComponent(listName)
    }

    // Endpoint da API do Microsoft Graph para acessar a lista
    // Adicionando top=1000 para garantir que obtemos todos os itens (até 1000)
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/${encodedListName}/items?expand=fields&$top=1000`

    console.log(`Buscando dados da lista: ${listName}`)
    console.log(`Endpoint: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`Erro na resposta da API:`, errorData)
      throw new Error(`Erro ao obter dados da lista: ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Erro ao obter dados da lista ${listName}:`, error)
    throw error
  }
}

// Função para obter os dados brutos de um item específico de uma lista
export async function getSharePointItemRaw(listName: string, itemId: string) {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Codificar o nome da lista para URL
    // Tratamento especial para a lista de funcionários que tem codificação diferente na URL
    let encodedListName
    if (listName === "Lista de Funcionários") {
      encodedListName = "Lista%20de%20Funcion%C3%A1rios"
    } else {
      encodedListName = encodeURIComponent(listName)
    }

    // Endpoint da API do Microsoft Graph para acessar o item
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/${encodedListName}/items/${itemId}?expand=fields`

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao obter dados do item: ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Erro ao obter dados do item ${itemId} da lista ${listName}:`, error)
    throw error
  }
}

// Função para listar todas as listas do site
export async function getAllSharePointLists() {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Endpoint da API do Microsoft Graph para listar todas as listas
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists`

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao obter listas: ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao obter listas do SharePoint:", error)
    throw error
  }
}

// Função para obter detalhes de uma lista específica (incluindo campos)
export async function getSharePointListDetails(listName: string) {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Codificar o nome da lista para URL
    // Tratamento especial para a lista de funcionários que tem codificação diferente na URL
    let encodedListName
    if (listName === "Lista de Funcionários") {
      encodedListName = "Lista%20de%20Funcion%C3%A1rios"
    } else {
      encodedListName = encodeURIComponent(listName)
    }

    // Endpoint da API do Microsoft Graph para obter detalhes da lista
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/${encodedListName}?expand=columns`

    console.log(`Buscando detalhes da lista: ${listName}`)
    console.log(`Endpoint: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`Erro na resposta da API:`, errorData)
      throw new Error(`Erro ao obter detalhes da lista: ${JSON.stringify(errorData)}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Erro ao obter detalhes da lista ${listName}:`, error)
    throw error
  }
}
