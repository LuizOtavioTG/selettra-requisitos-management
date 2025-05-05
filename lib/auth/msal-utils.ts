import { msalInstance } from "@/lib/auth/msal-config"
import { graphRequest } from "@/lib/auth/msal-config"
import { InteractionRequiredAuthError } from "@azure/msal-browser"

// Função para obter token silenciosamente
export async function getTokenSilently() {
  try {
    // Verificar se há uma conta ativa
    const activeAccount = msalInstance.getActiveAccount()
    if (!activeAccount) {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0])
      } else {
        throw new Error("Nenhuma conta autenticada encontrada")
      }
    }

    // Tentar adquirir token silenciosamente
    const silentRequest = {
      ...graphRequest,
      account: msalInstance.getActiveAccount(),
      scopes: ["https://graph.microsoft.com/.default"],
    }

    try {
      const response = await msalInstance.acquireTokenSilent(silentRequest)
      return response.accessToken
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Se falhar, tente com interação
        const response = await msalInstance.acquireTokenPopup(silentRequest)
        return response.accessToken
      }
      throw error
    }
  } catch (error) {
    console.error("Erro ao obter token:", error)
    throw error
  }
}
