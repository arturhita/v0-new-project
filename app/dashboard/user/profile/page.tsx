"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, Camera, Shield, Bell } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "Mario",
    lastName: "Rossi",
    nickname: "mario_mystic",
    email: "mario@example.com",
    phone: "+39 123 456 7890",
    birthDate: "1985-03-15",
    city: "Milano",
    bio: "Appassionato di esoterismo e arti divinatorie. Cerco sempre consulenti esperti per guidarmi nel mio percorso spirituale.",
    interests: ["Tarocchi", "Astrologia", "Numerologia", "Cristalli"],
    privacy: {
      showEmail: false,
      showPhone: false,
      showBirthDate: false,
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  })

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving profile data:", formData)
    setIsEditing(false)
    // Show success message
  }

  const handleCancel = () => {
    // Reset form data to original values
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePrivacyChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Il Mio Profilo
          </h1>
          <p className="text-muted-foreground mt-2">Gestisci le tue informazioni personali</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifica Profilo
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Salva
            </Button>
            <Button onClick={handleCancel} variant="outline" className="border-gray-300">
              <X className="mr-2 h-4 w-4" />
              Annulla
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture and Basic Info */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Foto Profilo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-pink-200">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-r from-pink-200 to-blue-200 text-xl font-bold">
                    {formData.firstName[0]}
                    {formData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-pink-500 to-blue-500"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-pink-600">@{formData.nickname}</p>
                <Badge className="mt-2 bg-gradient-to-r from-pink-500 to-blue-500">Utente Verificato</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="md:col-span-2 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Informazioni Personali
            </CardTitle>
            <CardDescription>Le tue informazioni di base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="border-pink-200 focus:border-pink-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{formData.firstName}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="border-pink-200 focus:border-pink-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{formData.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              {isEditing ? (
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  className="border-pink-200 focus:border-pink-400"
                  placeholder="Il tuo nome utente unico"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <span className="text-pink-600">@{formData.nickname}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{formData.email}</span>
                <Badge variant="secondary" className="ml-auto">
                  Verificata
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="border-pink-200 focus:border-pink-400"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{formData.phone}</span>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data di Nascita</Label>
                {isEditing ? (
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="border-pink-200 focus:border-pink-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(formData.birthDate).toLocaleDateString("it-IT")}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="border-pink-200 focus:border-pink-400"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{formData.city}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="border-pink-200 focus:border-pink-400"
                  rows={3}
                  placeholder="Raccontaci qualcosa di te..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-700">{formData.bio}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Interessi</Label>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="border-pink-200 text-pink-600 bg-pink-50">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Settings */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            <Shield className="mr-2 h-5 w-5 text-pink-500" />
            Impostazioni Privacy
          </CardTitle>
          <CardDescription>Controlla quali informazioni sono visibili agli altri utenti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Mostra Email</span>
              </div>
              <input
                type="checkbox"
                checked={formData.privacy.showEmail}
                onChange={(e) => handlePrivacyChange("showEmail", e.target.checked)}
                className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Mostra Telefono</span>
              </div>
              <input
                type="checkbox"
                checked={formData.privacy.showPhone}
                onChange={(e) => handlePrivacyChange("showPhone", e.target.checked)}
                className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Mostra Data Nascita</span>
              </div>
              <input
                type="checkbox"
                checked={formData.privacy.showBirthDate}
                onChange={(e) => handlePrivacyChange("showBirthDate", e.target.checked)}
                className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            <Bell className="mr-2 h-5 w-5 text-blue-500" />
            Notifiche
          </CardTitle>
          <CardDescription>Scegli come ricevere le notifiche</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Email</span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.email}
                onChange={(e) => handleNotificationChange("email", e.target.checked)}
                className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Push</span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.push}
                onChange={(e) => handleNotificationChange("push", e.target.checked)}
                className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">SMS</span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.sms}
                onChange={(e) => handleNotificationChange("sms", e.target.checked)}
                className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
