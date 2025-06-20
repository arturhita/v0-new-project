"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SnowflakeIcon as Crystal, Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "user",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginForm.email || !loginForm.password) {
      alert("Inserisci email e password!")
      return
    }

    setIsLoading(true)

    // Simulazione login con controllo tipo utente
    setTimeout(() => {
      setIsLoading(false)

      // Logica di reindirizzamento basata sull'email
      if (loginForm.email.includes("admin")) {
        window.location.href = "/dashboard/admin"
      } else if (
        loginForm.email.includes("operator") ||
        loginForm.email.includes("consulente") ||
        loginForm.email.includes("cartomante")
      ) {
        window.location.href = "/dashboard/operator"
      } else {
        window.location.href = "/dashboard/user"
      }
    }, 1500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      alert("Compila tutti i campi obbligatori!")
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Le password non coincidono!")
      return
    }

    if (registerForm.password.length < 6) {
      alert("La password deve essere di almeno 6 caratteri!")
      return
    }

    setIsLoading(true)

    // Simulazione registrazione
    setTimeout(() => {
      setIsLoading(false)
      if (registerForm.userType === "operator") {
        window.location.href = "/dashboard/operator"
      } else {
        window.location.href = "/dashboard/user"
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(244, 114, 182, 0.15) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Crystal className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              ConsultaPro
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Benvenuto</h1>
          <p className="text-gray-600">Accedi al mondo delle consulenze esoteriche</p>
        </div>

        <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl shadow-pink-500/10">
          <CardHeader className="space-y-1 pb-4">
            <div className="w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                >
                  Accedi
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                >
                  Registrati
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="la-tua-email@esempio.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10 border-pink-200 focus:border-pink-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="La tua password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10 border-pink-200 focus:border-pink-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-pink-300 text-pink-600 focus:ring-pink-500" />
                      <span className="text-gray-600">Ricordami</span>
                    </label>
                    <Link href="/forgot-password" className="text-pink-600 hover:text-pink-700">
                      Password dimenticata?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 shadow-lg shadow-pink-500/25"
                    disabled={isLoading}
                  >
                    {isLoading ? "Accesso in corso..." : "Accedi"}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  <p>Account demo:</p>
                  <p className="text-xs mt-1">
                    <strong>Cliente:</strong> cliente@demo.com | <strong>Cartomante:</strong> cartomante@demo.com |{" "}
                    <strong>Admin:</strong> admin@demo.com
                  </p>
                  <p className="text-xs">Password: demo123</p>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Il tuo nome completo"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="pl-10 border-pink-200 focus:border-pink-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="la-tua-email@esempio.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="pl-10 border-pink-200 focus:border-pink-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Crea una password sicura"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="pl-10 pr-10 border-pink-200 focus:border-pink-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Conferma Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Ripeti la password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="pl-10 border-pink-200 focus:border-pink-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo di Account</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegisterForm({ ...registerForm, userType: "user" })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          registerForm.userType === "user"
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        <div className="text-sm font-medium">Cliente</div>
                        <div className="text-xs text-gray-500">Ricevi consulenze</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterForm({ ...registerForm, userType: "operator" })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          registerForm.userType === "operator"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-sm font-medium">Consulente</div>
                        <div className="text-xs text-gray-500">Offri consulenze</div>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                      required
                    />
                    <span className="text-gray-600">
                      Accetto i{" "}
                      <Link href="/terms" className="text-pink-600 hover:text-pink-700">
                        Termini di Servizio
                      </Link>{" "}
                      e la{" "}
                      <Link href="/privacy" className="text-pink-600 hover:text-pink-700">
                        Privacy Policy
                      </Link>
                    </span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 shadow-lg shadow-pink-500/25"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrazione in corso..." : "Crea Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Hai bisogno di aiuto?{" "}
            <Link href="/support" className="text-pink-600 hover:text-pink-700 font-medium">
              Contatta il supporto
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
