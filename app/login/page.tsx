"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useIsAuthenticated } from "@azure/msal-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/use-auth"
import { ComputerIcon as Microsoft } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const isAuthenticated = useIsAuthenticated()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Se já estiver autenticado, redireciona para o dashboard
    if (isAuthenticated) {
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, router])

  const handleLogin = async () => {
    setIsProcessing(true)
    try {
      await login()
      // O redirecionamento é feito dentro da função login
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sistema de Gestão de Requisitos</CardTitle>
          <CardDescription>Faça login com sua conta organizacional</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full max-w-xs">
            <Button
              onClick={handleLogin}
              className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white"
              size="lg"
              disabled={isProcessing}
            >
              <Microsoft className="mr-2 h-5 w-5" />
              {isProcessing ? "Processando..." : "Entrar com Microsoft"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
          <p>Ao fazer login, você concorda com os termos de uso e política de privacidade da organização.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
