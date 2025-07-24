import { LoginForm } from "@/components/login-form"

// Pagina di login semplificata, si integra nel layout principale
export default function LoginPage() {
  return (
    <div className="flex flex-grow items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
