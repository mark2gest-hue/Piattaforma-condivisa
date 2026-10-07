'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Check,
  CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message || 'Credenziali non valide o utente non trovato.')
      setLoading(false)
      return
    }

    // Login riuscito -> avvia l'animazione di chiusura fluida (fold/shrink) prima del redirect
    setIsClosing(true)
    setTimeout(() => {
      window.location.href = '/lavori'
    }, 600)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070A12] text-slate-100 font-sans relative overflow-hidden p-4 sm:p-6 selection:bg-blue-500 selection:text-white">
      
      {/* 3D Flowing Cyber-Blue & Indigo Fluid Ambient Glowing Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-20 w-[650px] h-[650px] bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-transparent rounded-full blur-[140px] animate-pulse" />
        <div className="absolute -bottom-40 -right-20 w-[700px] h-[700px] bg-gradient-to-tl from-cyan-600/20 via-blue-700/15 to-transparent rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-radial from-blue-500/10 via-slate-900/40 to-transparent blur-[130px]" />
        
        {/* Subtle Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Glassmorphic Futuristic Container con Animazione di Chiusura al Click */}
      <div
        className={`relative z-10 w-full max-w-[460px] transition-all duration-500 ease-in-out transform ${
          isClosing
            ? 'opacity-0 scale-75 -translate-y-12 blur-md rotate-1 pointer-events-none'
            : mounted
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-6'
        }`}
      >
        
        {/* Top-Left Futuristic Corner Wing / Flap (Glow Blue) */}
        <div className={`absolute -top-3.5 -left-3.5 w-16 h-16 border-t-2 border-l-2 border-blue-400 rounded-tl-2xl bg-blue-500/15 backdrop-blur-md pointer-events-none z-20 shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 ${isClosing ? 'scale-0' : 'animate-pulse'}`} />
        
        {/* Bottom-Right Futuristic Corner Wing / Flap (Glow Blue) */}
        <div className={`absolute -bottom-3.5 -right-3.5 w-16 h-16 border-b-2 border-r-2 border-blue-400 rounded-br-2xl bg-blue-500/15 backdrop-blur-md pointer-events-none z-20 shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300 ${isClosing ? 'scale-0' : 'animate-pulse'}`} />

        {/* Card Body */}
        <div className="relative bg-[#0d1424]/85 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(59,130,246,0.15)] overflow-hidden">
          
          {/* Top Radial Highlight Beam */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-blue-500/25 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="mb-8 text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/40 text-blue-300 text-[11px] font-bold tracking-wider uppercase mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AIUTIAMOCI • WORKSPACE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">Back</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-normal">
              Enter your credentials to access your secure workspace
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center gap-2.5 animate-bounce shadow-lg shadow-red-950/50">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-300 tracking-wide">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#11192e]/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25 shadow-inner transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-300 tracking-wide">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#11192e]/90 border border-slate-700/80 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25 shadow-inner transition-all duration-200 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-300 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                  rememberMe
                    ? 'bg-blue-500 border-blue-400 text-white font-black shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                    : 'border-slate-700 bg-slate-800/80'
                }`}>
                  {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>Remember me</span>
              </label>

              <Link
                href="/corso-base"
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Main Blue Glowing Submit CTA Button */}
            <button
              type="submit"
              disabled={loading || isClosing}
              className="group relative w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm tracking-wide uppercase shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.65)] hover:scale-[1.01] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4 overflow-hidden"
            >
              {/* Button Shimmer / Reflection Animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-out pointer-events-none" />

              {isClosing ? (
                <div className="flex items-center gap-2 text-white font-bold animate-pulse">
                  <CheckCircle2 className="w-5 h-5 text-cyan-300" />
                  <span>Accesso Eseguito...</span>
                </div>
              ) : loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer Direct Assistance & Security Badge */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400/80" />
              <span>Encrypted Session • Supabase Auth Guard</span>
            </div>

            <div className="text-center text-xs text-slate-400">
              Hai problemi con il tuo account?{' '}
              <Link
                href="/servizi-ai"
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Assistenza AIutiamoci
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
