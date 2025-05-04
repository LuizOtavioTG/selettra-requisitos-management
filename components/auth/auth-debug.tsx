"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AuthStatus } from "./auth-status"
import { msalConfig } from "@/lib/auth/msal-config"

export function AuthDebug() {
  const [showDebug, setShowDebug] = useState(false)

  // Obter o URI de redirecionamento atual
  const redirectUri = msalConfig.auth.redirectUri || "Não definido"

  return (
    <div className="mt-4">
      <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? "Ocultar" : "Mostrar"} Informações de Depuração
      </Button>

      {showDebug && (
        <div className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Depuração de Autenticação</CardTitle>
              <CardDescription>Detalhes úteis para resolver problemas de autenticação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">URI de Redirecionamento Configurado:</h3>
                <code className="block bg-muted p-2 rounded mt-1">{redirectUri}</code>
                <p className="text-sm text-muted-foreground mt-1">
                  Este é o URI que deve ser adicionado à lista de URIs de redirecionamento permitidos no portal do
                  Azure.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Client ID:</h3>
                <code className="block bg-muted p-2 rounded mt-1">
                  {process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "Não definido"}
                </code>
              </div>

              <div>
                <h3 className="font-semibold">Tenant ID:</h3>
                <code className="block bg-muted p-2 rounded mt-1">
                  {process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || "Não definido"}
                </code>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro comum: AADSTS50011</AlertTitle>
                <AlertDescription>
                  Se você estiver vendo o erro AADSTS50011, você precisa adicionar o URI de redirecionamento acima à
                  lista de URIs de redirecionamento permitidos no portal do Azure para o seu aplicativo.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Após adicionar o URI de redirecionamento no portal do Azure, pode levar alguns minutos para que as
                alterações sejam aplicadas.
              </p>
            </CardFooter>
          </Card>

          <AuthStatus />
        </div>
      )}
    </div>
  )
}
