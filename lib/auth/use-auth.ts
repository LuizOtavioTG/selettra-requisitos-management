"use client"

import { useMsal, useIsAuthenticated } from "@azure/msal-react"
import { useCallback, useEffect, useState } from "react"
import { loginRequest, graphRequest } from "./msal-config"
import { InteractionRequiredAuthError, type SilentRequest } from "@azure/msal-browser"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  // Função para login
  const login = useCallback(async () => {
    try {
      setError(null)
      console.log("Iniciando login...")
      const result = await instance.loginPopup(loginRequest)
      console.log("Login bem-sucedido:", result.account?.username)

      // Redirecionar para dashboard após login bem-sucedido
      router.push("/admin/dashboard")

      return result
    } catch (error) {
      console.error("Erro de login:", error)
      setError(error instanceof Error ? error : new Error("Erro desconhecido durante o login"))
      throw error
    }
  }, [instance, router])

  // Função para logout
  const logout = useCallback(() => {
    try {
      instance.logoutPopup()
    } catch (error) {
      console.error("Erro de logout:", error)
    }
  }, [instance])

  // Função para obter token silenciosamente
  const getTokenSilently = useCallback(
    async (request: SilentRequest = graphRequest) => {
      if (!accounts[0]) {
        throw new Error("No active account")
      }

      const silentRequest = {
        ...request,
        account: accounts[0],
      }

      try {
        return await instance.acquireTokenSilent(silentRequest)
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          // Se falhar, tente com interação
          return await instance.acquireTokenPopup(silentRequest)
        }
        throw error
      }
    },
    [instance, accounts],
  )

  // Função para chamar o Graph API
  const callGraphApi = useCallback(
    async (endpoint: string) => {
      try {
        const token = await getTokenSilently()
        const headers = new Headers()
        headers.append("Authorization", `Bearer ${token.accessToken}`)

        const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
          method: "GET",
          headers: headers,
        })

        return await response.json()
      } catch (error) {
        console.error("Error calling Graph API:", error)
        throw error
      }
    },
    [getTokenSilently],
  )

  // Carrega informações do usuário quando autenticado
  useEffect(() => {
    const loadUserInfo = async () => {
      if (isAuthenticated && accounts[0]) {
        try {
          const userDetails = await callGraphApi("/me")
          setUserInfo(userDetails)
        } catch (error) {
          console.error("Error loading user info:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadUserInfo()
  }, [isAuthenticated, accounts, callGraphApi])

  return {
    isAuthenticated,
    login,
    logout,
    user: accounts[0] || null,
    userInfo,
    loading,
    error,
    getTokenSilently,
    callGraphApi,
  }
}
