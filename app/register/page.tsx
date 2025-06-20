"use client"

import type React from "react"
import { useState } from "react"

const RegisterPage = () => {
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "user", // Default to "user"
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setRegisterForm((prev) => ({ ...prev, [name]: value }))
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
        // Salva i dati del consulente con stato "pending"
        const consultantData = {
          id: Date.now(),
          name: registerForm.name,
          email: registerForm.email,
          userType: "operator",
          status: "pending", // In attesa di approvazione
          approved: false,
          canGoOnline: false,
          registrationDate: new Date().toISOString(),
          approvalDate: null,
        }

        // Salva nel localStorage (in un'app reale sarebbe nel database)
        localStorage.setItem("userData", JSON.stringify(consultantData))
        localStorage.setItem("userRole", "operator")
        localStorage.setItem("user", registerForm.email)

        alert(
          "🎉 Registrazione completata!\n\n" +
            "Il tuo account consulente è stato creato con successo.\n" +
            "⏳ Stato: IN ATTESA DI APPROVAZIONE\n\n" +
            "📋 Prossimi passi:\n" +
            "1. Accedi alla tua dashboard\n" +
            "2. Completa il tuo profilo\n" +
            "3. Attendi l'approvazione dell'amministratore\n" +
            "4. Riceverai una email quando sarai approvato\n\n" +
            "💡 Nota: Potrai andare online solo dopo l'approvazione!",
        )

        // Reindirizza alla dashboard operatore
        window.location.href = "/dashboard/operator"
      } else {
        // Utenti normali accedono subito con 3 minuti gratuiti
        const userData = {
          id: Date.now(),
          name: registerForm.name,
          email: registerForm.email,
          userType: "user",
          status: "active",
          approved: true,
          registrationDate: new Date().toISOString(),
          credits: 0, // Crediti normali
          freeMinutes: 3, // 3 minuti gratuiti per nuovi utenti
          freeMinutesUsed: false, // Non ancora utilizzati
          isNewUser: true, // Flag per identificare nuovo utente
        }

        localStorage.setItem("userData", JSON.stringify(userData))
        localStorage.setItem("userRole", "user")
        localStorage.setItem("user", registerForm.email)

        alert(
          "🎉 Benvenuto su ConsultaPro!\n\n" +
            "✨ REGALO DI BENVENUTO ✨\n" +
            "🎁 Hai ricevuto 3 MINUTI GRATUITI!\n\n" +
            "💫 Puoi usarli con qualsiasi consulente\n" +
            "⏰ Validi per chat e chiamate\n" +
            "🔮 Perfetti per provare il nostro servizio\n\n" +
            "Vai alla dashboard per iniziare la tua prima consulenza gratuita!",
        )

        window.location.href = "/dashboard/user"
      }
    }, 1500)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Registrati
          </h2>
          <p className="text-gray-600">Crea il tuo account ConsultaPro</p>

          {/* Bonus Banner per utenti */}
          {registerForm.userType === "user" && (
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">🎁</span>
                <div className="text-center">
                  <p className="text-green-800 font-bold text-sm">REGALO DI BENVENUTO</p>
                  <p className="text-green-700 text-xs">3 MINUTI GRATUITI con qualsiasi consulente!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
              Nome Completo:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={registerForm.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
              placeholder="Il tuo nome completo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={registerForm.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
              placeholder="la-tua-email@esempio.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={registerForm.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
              placeholder="Minimo 6 caratteri"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">
              Conferma Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={registerForm.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
              placeholder="Ripeti la password"
            />
          </div>

          <div>
            <label htmlFor="userType" className="block text-gray-700 text-sm font-semibold mb-2">
              Tipo di Account:
            </label>
            <select
              id="userType"
              name="userType"
              value={registerForm.userType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 bg-white"
            >
              <option value="user">🙋‍♂️ Utente - Cerca consulenze</option>
              <option value="operator">🔮 Consulente - Offri consulenze</option>
            </select>
          </div>

          {registerForm.userType === "operator" && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-600 mt-1">⚠️</div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Account Consulente</h4>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    Come consulente, il tuo account dovrà essere <strong>approvato dall'amministratore</strong> prima di
                    poter andare online e ricevere clienti. Potrai accedere alla dashboard per completare il profilo, ma
                    non potrai essere visibile ai clienti fino all'approvazione.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registrazione...</span>
              </div>
            ) : registerForm.userType === "user" ? (
              "🎁 Registrati e Ricevi 3 Min Gratis!"
            ) : (
              "🚀 Registrati"
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Hai già un account?{" "}
              <a
                href="/login"
                className="font-semibold text-pink-600 hover:text-pink-700 transition-colors duration-300"
              >
                Accedi qui
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
