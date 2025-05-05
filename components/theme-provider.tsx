"use client"

import type * as React from "react"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: "light" | "dark" | "system"
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}
