"use client"

import { useEffect, useState } from "react"
import { useMsal } from "@azure/msal-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AuthStatus() {
  const { instance, accounts, inProgress } = useMsal()
  const [authState, setAuthState] = useState<{
    accounts: string[]
    inProgress: string
    activeAccount: string | null
    isLoggedIn: boolean
  }>({
    accounts: [],
    inProgress: inProgress,
    activeAccount: null,
    isLoggedIn: false,
  })

  useEffect(() => {
    const updateState = () => {
      setAuthState({
        accounts: accounts.map((acc) => acc.username || "unknown"),
        inProgress: inProgress,
        activeAccount: instance.getActiveAccount()?.username || null,
        isLoggedIn: accounts.length > 0,
      })
    }

    updateState()
    const interval = setInterval(updateState, 1000)
    return () => clearInterval(interval)
  }, [accounts, inProgress, instance])

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Estado da Autenticação</CardTitle>
        <CardDescription>Informações em tempo real sobre o estado da autenticação</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <Badge variant={authState.isLoggedIn ? "success" : "destructive"}>
            {authState.isLoggedIn ? "Autenticado" : "Não Autenticado"}
          </Badge>
        </div>
        <div>
          <span className="font-medium">Interação em Progresso:</span>
          <span className="ml-2">{authState.inProgress}</span>
        </div>
        <div>
          <span className="font-medium">Conta Ativa:</span>
          <span className="ml-2">{authState.activeAccount || "Nenhuma"}</span>
        </div>
        <div>
          <span className="font-medium">Contas ({authState.accounts.length}):</span>
          <ul className="list-disc pl-5 mt-1">
            {authState.accounts.length > 0 ? (
              authState.accounts.map((acc, idx) => <li key={idx}>{acc}</li>)
            ) : (
              <li>Nenhuma conta</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
