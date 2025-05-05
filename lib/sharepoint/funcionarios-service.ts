import { getTokenSilently } from "@/lib/auth/token-service"

// Interface para o tipo Funcionário
export interface Funcionario {
  id: string | number
  nome: string
  usuarioId: string | number | null
  email: string
  telefone: string
  status: "Ativo" | "Inativo"
  setorId: string | number | null
  setorNome: string
}

// Função para obter os funcionários do SharePoint
export async function getFuncionarios(): Promise<Funcionario[]> {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Endpoint da API do Microsoft Graph para acessar a lista de funcionários
    // Usando a codificação correta para "Lista de Funcionários"
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Funcion%C3%A1rios/items?expand=fields&$top=1000`

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
      const setorId = item.fields.SetorLookupId || null

      return {
        id: item.id,
        nome: item.fields.Title || "Sem nome",
        usuarioId: item.fields.Usu_x00e1_rioLookupId || null,
        email: item.fields.Email || "",
        telefone: item.fields.Telefone || "",
        status: item.fields.Status === "Ativo" ? "Ativo" : "Inativo",
        setorId: setorId,
        setorNome: setorId ? setoresMap.get(setorId) || "Sem setor" : "Sem setor",
      }
    })
  } catch (error) {
    console.error("Erro ao obter funcionários do SharePoint:", error)
    // Em caso de erro, retornar array vazio para não quebrar a aplicação
    return []
  }
}

// Função para obter um funcionário específico
export async function getFuncionarioById(id: string): Promise<Funcionario | null> {
  try {
    // Obter token de acesso
    const token = await getTokenSilently()

    // Endpoint da API do Microsoft Graph para acessar o item
    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Funcion%C3%A1rios/items/${id}?expand=fields`

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
      throw new Error(`Erro ao obter funcionário: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Obter o nome do setor
    let setorNome = "Sem setor"
    if (data.fields.SetorLookupId) {
      try {
        const setorResponse = await fetch(
          `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Setores/items/${data.fields.SetorLookupId}?expand=fields`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )
        if (setorResponse.ok) {
          const setorData = await setorResponse.json()
          setorNome = setorData.fields.Title || "Sem setor"
        }
      } catch (error) {
        console.error("Erro ao obter setor do funcionário:", error)
      }
    }

    // Mapear os dados para o formato esperado pela aplicação
    return {
      id: data.id,
      nome: data.fields.Title || "Sem nome",
      usuarioId: data.fields.Usu_x00e1_rioLookupId || null,
      email: data.fields.Email || "",
      telefone: data.fields.Telefone || "",
      status: data.fields.Status === "Ativo" ? "Ativo" : "Inativo",
      setorId: data.fields.SetorLookupId || null,
      setorNome: setorNome,
    }
  } catch (error) {
    console.error(`Erro ao obter funcionário com ID ${id}:`, error)
    throw error
  }
}

// Função para adicionar um novo funcionário
export async function adicionarFuncionario(funcionario: {
  nome: string
  usuarioId?: string | number
  email: string
  telefone: string
  status: "Ativo" | "Inativo"
  setorId?: string | number
}): Promise<Funcionario> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Funcion%C3%A1rios/items`

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: funcionario.nome,
          Usu_x00e1_rioLookupId: funcionario.usuarioId,
          Email: funcionario.email,
          Telefone: funcionario.telefone,
          Status: funcionario.status,
          SetorLookupId: funcionario.setorId,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao adicionar funcionário: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Obter o nome do setor
    let setorNome = "Sem setor"
    if (funcionario.setorId) {
      try {
        const setorResponse = await fetch(
          `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Setores/items/${funcionario.setorId}?expand=fields`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )
        if (setorResponse.ok) {
          const setorData = await setorResponse.json()
          setorNome = setorData.fields.Title || "Sem setor"
        }
      } catch (error) {
        console.error("Erro ao obter setor do funcionário:", error)
      }
    }

    return {
      id: data.id,
      nome: data.fields.Title,
      usuarioId: data.fields.Usu_x00e1_rioLookupId || null,
      email: data.fields.Email || "",
      telefone: data.fields.Telefone || "",
      status: data.fields.Status === "Ativo" ? "Ativo" : "Inativo",
      setorId: data.fields.SetorLookupId || null,
      setorNome: setorNome,
    }
  } catch (error) {
    console.error("Erro ao adicionar funcionário no SharePoint:", error)
    throw error
  }
}

// Função para atualizar um funcionário existente
export async function atualizarFuncionario(
  id: string,
  funcionario: {
    nome: string
    usuarioId?: string | number
    email: string
    telefone: string
    status: "Ativo" | "Inativo"
    setorId?: string | number
  },
): Promise<Funcionario> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Funcion%C3%A1rios/items/${id}`

    console.log("Atualizando funcionário:", id, funcionario)

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: funcionario.nome,
          Usu_x00e1_rioLookupId: funcionario.usuarioId,
          Email: funcionario.email,
          Telefone: funcionario.telefone,
          Status: funcionario.status,
          SetorLookupId: funcionario.setorId,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao atualizar funcionário: ${JSON.stringify(errorData)}`)
    }

    // Obter o funcionário atualizado
    const funcionarioAtualizado = await getFuncionarioById(id)
    if (!funcionarioAtualizado) {
      throw new Error("Não foi possível obter o funcionário atualizado")
    }

    return funcionarioAtualizado
  } catch (error) {
    console.error(`Erro ao atualizar funcionário com ID ${id}:`, error)
    throw error
  }
}

// Função para excluir um funcionário
export async function excluirFuncionario(id: string): Promise<boolean> {
  try {
    const token = await getTokenSilently()

    const endpoint = `https://graph.microsoft.com/v1.0/sites/luizotg.sharepoint.com:/sites/Selettra:/lists/Lista%20de%20Funcion%C3%A1rios/items/${id}`

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Erro ao excluir funcionário: ${errorData}`)
    }

    return true
  } catch (error) {
    console.error(`Erro ao excluir funcionário com ID ${id}:`, error)
    throw error
  }
}
