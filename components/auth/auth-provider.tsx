"use client"

import { type ReactNode, useEffect } from "react"
import { MsalProvider, useMsal } from "@azure/msal-react"
import { EventType, type EventMessage, type AuthenticationResult } from "@azure/msal-browser"
import { msalInstance } from "@/lib/auth/msal-config"
import { useRouter, usePathname } from "next/navigation"

// Registra manipuladores de eventos
msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult
    msalInstance.setActiveAccount(payload.account)
  }
})

interface AuthProviderProps {
  children: ReactNode
}

// Componente interno para lidar com redirecionamentos após login
function AuthRedirect({ children }: { children: ReactNode }) {
  const { accounts } = useMsal()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Se o usuário está autenticado e está na raiz ou na página de login
    if ((pathname === "/" || pathname === "/login") && accounts.length > 0) {
      console.log("Redirecionando para /admin/dashboard (autenticado)")
      router.push("/admin/dashboard")
    }
  }, [accounts, pathname, router])

  return <>{children}</>
}

// Provedor principal de autenticação
export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthRedirect>{children}</AuthRedirect>
    </MsalProvider>
  )
}
