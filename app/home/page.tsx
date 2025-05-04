"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useIsAuthenticated } from "@azure/msal-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    // Adicione um pequeno atraso para garantir que o estado de autenticação seja processado
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        console.log("Home: Redirecionando para /dashboard (autenticado)")
        router.push("/dashboard")
      } else {
        console.log("Home: Redirecionando para /login (não autenticado)")
        router.push("/login")
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  // Exibe um indicador de carregamento enquanto redireciona
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20">
      <div className="w-full max-w-md space-y-4 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Processando autenticação...</h1>
          <p className="text-muted-foreground">Por favor, aguarde enquanto verificamos suas credenciais.</p>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}
