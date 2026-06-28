'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fish, Eye, EyeOff, ShieldCheck, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Toaster, toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault()
    
    const u = customUser || username
    const p = customPass || password

    if (!u || !p) {
      toast.warning('Ingresa usuario y contraseña')
      return
    }

    setLoading(true)
    try {
      await login(u, p)
      toast.success('Sesión iniciada correctamente')
      router.push('/dashboard')
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        toast.error('Usuario o contraseña incorrectos')
      } else {
        toast.error('Error de conexión con el servidor (puerto 8080)')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    handleSubmit(undefined, u, p)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-lg text-slate-900 rounded-lg">
        <CardHeader className="text-center pb-4 border-b border-slate-100">
          <div className="flex justify-center mb-3">
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
              <Fish className="h-8 w-8 text-slate-700" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
            ExporTrace Ica
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs font-medium tracking-wide mt-1">
            Sistema de Trazabilidad CHD — ExporSan Pisco
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Usuario
              </label>
              <Input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Nombre de usuario" 
                required 
                className="bg-white border-slate-300 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:ring-0 rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Contraseña
              </label>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Contraseña" 
                  required 
                  className="bg-white border-slate-300 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:ring-0 rounded-md pr-10" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-slate-800 hover:bg-slate-950 text-white font-semibold py-2.5 rounded-md shadow-sm transition-colors mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-slate-800 border-t-transparent rounded-full" /> 
                  Conectando...
                </span>
              ) : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              Acceso Rápido Demo
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => handleQuickLogin('root', 'root')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-md text-left transition-colors flex flex-col"
              >
                <span className="font-bold text-slate-700">Administrador</span>
                <span className="text-[10px] text-slate-400 mt-0.5">User: root</span>
              </button>

              <button 
                onClick={() => handleQuickLogin('calidad', 'calidad123')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-md text-left transition-colors flex flex-col"
              >
                <span className="font-bold text-slate-700">Inspector QA</span>
                <span className="text-[10px] text-slate-400 mt-0.5">User: calidad</span>
              </button>

              <button 
                onClick={() => handleQuickLogin('logistica', 'logistica123')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-md text-left transition-colors flex flex-col"
              >
                <span className="font-bold text-slate-700">Logística</span>
                <span className="text-[10px] text-slate-400 mt-0.5">User: logistica</span>
              </button>

              <button 
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-md text-left transition-colors flex flex-col"
              >
                <span className="font-bold text-slate-700">Operaciones</span>
                <span className="text-[10px] text-slate-400 mt-0.5">User: admin</span>
              </button>
            </div>
          </div>

        </CardContent>
      </Card>
      <Toaster position="top-right" richColors />
    </div>
  )
}

