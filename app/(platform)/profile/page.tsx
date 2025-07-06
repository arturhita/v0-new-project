"use client"

import type React from "react"

import { useState, useEffect, useRef, useTransition } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProfile, updateProfile, updateAvatar } from "@/lib/actions/user.actions"
import type { UserProfile } from "@/types/user.types"
import { Loader2, Camera, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, startSavingTransition] = useTransition()
  const [isUploading, startUploadingTransition] = useTransition()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const { data, error } = await getProfile()
      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        })
      } else if (data) {
        setProfile(data as UserProfile)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [toast])

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    startSavingTransition(async () => {
      const result = await updateProfile(formData)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
        icon: result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />,
      })
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("avatar", file)

    startUploadingTransition(async () => {
      const result = await updateAvatar(formData)
      toast({
        title: result.success ? "Successo" : "Errore",
        description: result.message,
        variant: result.success ? "default" : "destructive",
        icon: result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />,
      })
      if (result.success && result.newAvatarUrl && profile) {
        setProfile({ ...profile, avatar_url: result.newAvatarUrl })
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Impossibile caricare il profilo. Prova a ricaricare la pagina.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Avatar className="w-32 h-32 border-4 border-purple-500">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.name || "User"} />
                <AvatarFallback className="bg-gray-700 text-purple-300 text-4xl">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                disabled={isUploading}
              />
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full bg-purple-600 hover:bg-purple-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              </Button>
            </div>
            <CardTitle className="text-3xl font-bold">{profile.name || "Utente"}</CardTitle>
            <CardDescription className="text-purple-300">{profile.nickname || "Nessun nickname"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="profile">Profilo</TabsTrigger>
                <TabsTrigger value="security" disabled>
                  Sicurezza
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <form onSubmit={handleSaveProfile} className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-300">
                      Nome Completo
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name || ""}
                      onChange={handleFieldChange}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="nickname" className="text-sm font-medium text-gray-300">
                      Nickname
                    </label>
                    <Input
                      id="nickname"
                      name="nickname"
                      value={profile.nickname || ""}
                      onChange={handleFieldChange}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      value={profile.email || ""}
                      disabled
                      className="bg-gray-900 border-gray-700 text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium text-gray-300">
                      Biografia
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio || ""}
                      onChange={handleFieldChange}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSaving ? "Salvataggio..." : "Salva Modifiche"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
