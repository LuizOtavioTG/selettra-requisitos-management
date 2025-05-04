"use client"

import { useAuth } from "@/lib/auth/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Layers, Users } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  const { userInfo } = useAuth()

  const stats = [
    {
      title: "Requisitos",
      value: "124",
      description: "Total de requisitos cadastrados",
      icon: FileText,
      href: "/admin/requisitos",
    },
    {
      title: "Funcionários",
      value: "45",
      description: "Funcionários ativos no sistema",
      icon: Users,
      href: "/admin/funcionarios",
    },
    {
      title: "Setores",
      value: "12",
      description: "Setores cadastrados",
      icon: Layers,
      href: "/admin/setores",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo, {userInfo?.displayName || "Usuário"}! Visão geral do sistema de gestão de requisitos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
