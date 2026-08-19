'use client'

import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg transition-colors"
      title={`Cambia Tema (Attuale: ${theme === 'light' ? 'Chiaro' : theme === 'dark' ? 'Scuro' : 'Sistema'})`}
    >
      {theme === 'light' && <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200" />}
      {theme === 'dark' && <Moon className="h-4 w-4 text-blue-400 transition-transform duration-200" />}
      {theme === 'system' && <Laptop className="h-4 w-4 text-slate-500 transition-transform duration-200" />}
    </Button>
  )
}
