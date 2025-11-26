"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type ColorScheme = "blue" | "green" | "orange" | "purple" | "red"

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ColorScheme>("blue")

  useEffect(() => {
    const saved = localStorage.getItem("colorTheme") as ColorScheme
    if (saved) {
      setCurrentTheme(saved)
      applyTheme(saved)
    }
  }, [])

  const applyTheme = (theme: ColorScheme) => {
    const root = document.documentElement
    const themes: Record<ColorScheme, Record<string, string>> = {
      blue: {
        "--color-token-primary": "oklch(0.5 0.2 254)",
        "--color-token-secondary": "oklch(0.6 0.22 50)",
        "--color-token-surface": "oklch(1 0 0)",
        "--color-token-error": "oklch(0.577 0.245 27.325)",
        "--color-token-success": "oklch(0.556 0.15 142)",
      },
      green: {
        "--color-token-primary": "oklch(0.556 0.15 142)",
        "--color-token-secondary": "oklch(0.6 0.22 50)",
        "--color-token-surface": "oklch(1 0 0)",
        "--color-token-error": "oklch(0.577 0.245 27.325)",
        "--color-token-success": "oklch(0.556 0.15 142)",
      },
      orange: {
        "--color-token-primary": "oklch(0.6 0.22 50)",
        "--color-token-secondary": "oklch(0.5 0.2 254)",
        "--color-token-surface": "oklch(1 0 0)",
        "--color-token-error": "oklch(0.577 0.245 27.325)",
        "--color-token-success": "oklch(0.556 0.15 142)",
      },
      purple: {
        "--color-token-primary": "oklch(0.55 0.2 280)",
        "--color-token-secondary": "oklch(0.6 0.22 50)",
        "--color-token-surface": "oklch(1 0 0)",
        "--color-token-error": "oklch(0.577 0.245 27.325)",
        "--color-token-success": "oklch(0.556 0.15 142)",
      },
      red: {
        "--color-token-primary": "oklch(0.577 0.245 27.325)",
        "--color-token-secondary": "oklch(0.6 0.22 50)",
        "--color-token-surface": "oklch(1 0 0)",
        "--color-token-error": "oklch(0.577 0.245 27.325)",
        "--color-token-success": "oklch(0.556 0.15 142)",
      },
    }

    const themeColors = themes[theme]
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    localStorage.setItem("colorTheme", theme)
    setCurrentTheme(theme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium capitalize">{currentTheme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["blue", "green", "orange", "purple", "red"] as const).map((theme) => (
          <DropdownMenuItem key={theme} onClick={() => applyTheme(theme)} className="capitalize">
            {theme}
            {currentTheme === theme && " ✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
