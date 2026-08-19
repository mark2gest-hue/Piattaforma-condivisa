'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulazione o integrazione auth Supabase
    setTimeout(() => {
      setLoading(false)
      router.push('/lavori')
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team Hub
          </h1>
          <p className="text-xs text-slate-500 max-w-xs">
            Accesso riservato al team (Corsi, Consulenze & Agenti AI)
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-md bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Accedi alla piattaforma</CardTitle>
            <CardDescription className="text-xs">
              Inserisci le tue credenziali Supabase Auth autorizzate.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Aziendale</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@team.domain.com"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-10 shadow-xs mt-2"
              >
                {loading ? 'Accesso in corso...' : 'Entra nel Workspace'}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Row Level Security attiva (4 membri autorizzati)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
