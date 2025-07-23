import { LoginForm } from "@/components/login-form"
import ConstellationBackground from "@/components/constellation-background"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gray-950 overflow-hidden">
      <ConstellationBackground />
      <div className="z-10">
        <LoginForm />
      </div>
    </div>
  )
}
