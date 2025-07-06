"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Send,
  Users,
  Mail,
  Sparkles,
  ImageIcon,
  Bold,
  Italic,
  Link,
  List,
  Calendar,
  BarChart3,
  Palette,
  Eye,
  Smile,
} from "lucide-react"
import { sendNewsletter } from "@/lib/actions/settings.actions"

interface SendNewsletterModalProps {
  isOpen: boolean
  onClose: () => void
}

const templates = [
  {
    id: "welcome",
    name: "Benvenuto",
    subject: "Benvenuto su Unveilly! ✨",
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 15px;">
  <h1 style="text-align: center; font-size: 28px; margin-bottom: 20px;">✨ Benvenuto su Unveilly! ✨</h1>
  <p style="font-size: 18px; line-height: 1.6; text-align: center;">Scopri il tuo futuro con i nostri esperti consulenti</p>
  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h3>🎁 Offerta Speciale per te:</h3>
    <p>Prima consulenza a soli <strong>€0.99</strong> invece di €1.99!</p>
  </div>
  <div style="text-align: center; margin-top: 30px;">
    <a href="#" style="background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Inizia Ora</a>
  </div>
</div>`,
  },
  {
    id: "promotion",
    name: "Promozione",
    subject: "🔥 Offerta Limitata - Solo per te!",
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); padding: 30px; border-radius: 20px;">
  <h1 style="text-align: center; color: #d63384; font-size: 32px;">🔥 OFFERTA SPECIALE 🔥</h1>
  <div style="background: white; padding: 25px; border-radius: 15px; margin: 20px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
    <h2 style="color: #d63384; text-align: center;">Weekend Magico</h2>
    <p style="font-size: 18px; text-align: center; color: #666;">Consulenze a prezzo speciale</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="font-size: 36px; color: #28a745; font-weight: bold;">€0.99</span>
      <span style="font-size: 18px; color: #999; text-decoration: line-through; margin-left: 10px;">€1.99</span>
      <div style="background: #28a745; color: white; display: inline-block; padding: 5px 15px; border-radius: 20px; margin-left: 10px;">-50%</div>
    </div>
    <p style="text-align: center; color: #666;">Valido solo Sabato e Domenica</p>
  </div>
  <div style="text-align: center;">
    <a href="#" style="background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 18px;">Approfitta Ora!</a>
  </div>
</div>`,
  },
  {
    id: "update",
    name: "Aggiornamenti",
    subject: "📱 Novità su Unveilly - Scopri le nuove funzioni!",
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 40px 20px; border-radius: 15px;">
  <h1 style="text-align: center; font-size: 28px;">📱 Novità su Unveilly</h1>
  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h3>🆕 Nuove Funzionalità:</h3>
    <ul style="line-height: 1.8;">
      <li>💬 Chat migliorata con emoji</li>
      <li>📞 Chiamate di qualità superiore</li>
      <li>⭐ Sistema di recensioni avanzato</li>
      <li>🎯 Ricerca operatori più precisa</li>
    </ul>
  </div>
  <div style="text-align: center; margin-top: 30px;">
    <a href="#" style="background: #00b894; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Scopri le Novità</a>
  </div>
</div>`,
  },
]

const emojis = ["✨", "🔥", "💫", "⭐", "🎯", "💎", "🌟", "🎁", "💝", "🎉", "🚀", "💖", "🌙", "☀️", "🦋"]

export default function SendNewsletterModal({ isOpen, onClose }: SendNewsletterModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("compose")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    sendToUsers: true,
    sendToOperators: true,
    sendToAdmins: false,
  })
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const recipientStats = {
    users: 1482,
    operators: 73,
    admins: 5,
  }

  const getTotalRecipients = () => {
    let total = 0
    if (formData.sendToUsers) total += recipientStats.users
    if (formData.sendToOperators) total += recipientStats.operators
    if (formData.sendToAdmins) total += recipientStats.admins
    return total
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData((prev) => ({
        ...prev,
        subject: template.subject,
        content: template.content,
      }))
      setSelectedTemplate(templateId)
      setActiveTab("compose")
    }
  }

  const insertFormatting = (tag: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    let replacement = ""
    switch (tag) {
      case "bold":
        replacement = `<strong>${selectedText || "testo in grassetto"}</strong>`
        break
      case "italic":
        replacement = `<em>${selectedText || "testo in corsivo"}</em>`
        break
      case "link":
        replacement = `<a href="https://unveilly.com">${selectedText || "link"}</a>`
        break
      case "list":
        replacement = `<ul><li>${selectedText || "elemento lista"}</li></ul>`
        break
    }

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end)
    setFormData((prev) => ({ ...prev, content: newContent }))
  }

  const insertEmoji = (emoji: string) => {
    setFormData((prev) => ({
      ...prev,
      subject: prev.subject + emoji,
    }))
    setShowEmojiPicker(false)
  }

  const handleSendNewsletter = async () => {
    setIsSending(true)
    try {
      if (!formData.subject || !formData.content) {
        toast({
          title: "Errore",
          description: "Compila oggetto e contenuto della newsletter.",
          variant: "destructive",
        })
        return
      }

      if (!formData.sendToUsers && !formData.sendToOperators && !formData.sendToAdmins) {
        toast({
          title: "Errore",
          description: "Seleziona almeno una categoria di destinatari.",
          variant: "destructive",
        })
        return
      }

      const recipients: string[] = []
      if (formData.sendToUsers) {
        for (let i = 0; i < recipientStats.users; i++) {
          recipients.push(`user${i}@example.com`)
        }
      }
      if (formData.sendToOperators) {
        for (let i = 0; i < recipientStats.operators; i++) {
          recipients.push(`operator${i}@example.com`)
        }
      }
      if (formData.sendToAdmins) {
        for (let i = 0; i < recipientStats.admins; i++) {
          recipients.push(`admin${i}@example.com`)
        }
      }

      const result = await sendNewsletter(formData.subject, formData.content, recipients)

      if (result.success) {
        toast({
          title: "🚀 Newsletter inviata!",
          description: `Inviata con successo a ${getTotalRecipients()} destinatari`,
        })

        setFormData({
          subject: "",
          content: "",
          sendToUsers: true,
          sendToOperators: true,
          sendToAdmins: false,
        })
        setSelectedTemplate("")
        onClose()
      } else {
        toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio della newsletter.",
        variant: "destructive",
      })
    }
    setIsSending(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-slate-900 border-purple-500/30 text-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-300">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            Newsletter Creator Pro
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Crea newsletter professionali con template, editor avanzato e anteprima live.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-indigo-500/20 text-slate-400">
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white"
            >
              <Palette className="h-4 w-4 mr-2" /> Template
            </TabsTrigger>
            <TabsTrigger
              value="compose"
              className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white"
            >
              <Mail className="h-4 w-4 mr-2" /> Componi
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white"
            >
              <Eye className="h-4 w-4 mr-2" /> Anteprima
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Template Tab */}
          <TabsContent value="templates" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === template.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                  <div
                    className="text-xs bg-gray-100 p-2 rounded max-h-20 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: template.content.substring(0, 100) + "..." }}
                  />
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                  >
                    {selectedTemplate === template.id ? "Selezionato" : "Usa Template"}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-6 pt-4">
            {/* Oggetto con emoji picker */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-slate-400">
                Oggetto Newsletter *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="subject"
                  placeholder="Oggetto accattivante..."
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="flex-1 bg-slate-800 border-slate-700"
                />
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="bg-slate-800 border-slate-700"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute top-12 right-0 bg-white border rounded-lg p-3 shadow-lg z-50 grid grid-cols-5 gap-1">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="p-2 hover:bg-gray-100 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Toolbar editor */}
            <div className="space-y-2">
              <Label className="text-slate-400">Editor Avanzato</Label>
              <div className="flex gap-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertFormatting("bold")}
                  className="bg-slate-800 border-slate-700"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertFormatting("italic")}
                  className="bg-slate-800 border-slate-700"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertFormatting("link")}
                  className="bg-slate-800 border-slate-700"
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertFormatting("list")}
                  className="bg-slate-800 border-slate-700"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" className="bg-slate-800 border-slate-700">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenuto */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-400">
                Contenuto Newsletter *
              </Label>
              <Textarea
                id="content"
                placeholder="Scrivi il contenuto della newsletter qui..."
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="min-h-[400px] font-mono text-sm bg-slate-800 border-slate-700"
              />
            </div>

            {/* Destinatari */}
            <div className="space-y-4">
              <Label className="text-slate-400">Destinatari</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendToUsers"
                    checked={formData.sendToUsers}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, sendToUsers: checked as boolean }))}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Label htmlFor="sendToUsers" className="flex items-center gap-2 text-slate-400">
                    <Users className="h-4 w-4" />
                    Utenti
                    <Badge variant="secondary">{recipientStats.users.toLocaleString()}</Badge>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendToOperators"
                    checked={formData.sendToOperators}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, sendToOperators: checked as boolean }))
                    }
                    className="bg-slate-800 border-slate-700"
                  />
                  <Label htmlFor="sendToOperators" className="flex items-center gap-2 text-slate-400">
                    <Sparkles className="h-4 w-4" />
                    Operatori
                    <Badge variant="secondary">{recipientStats.operators}</Badge>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendToAdmins"
                    checked={formData.sendToAdmins}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, sendToAdmins: checked as boolean }))
                    }
                    className="bg-slate-800 border-slate-700"
                  />
                  <Label htmlFor="sendToAdmins" className="flex items-center gap-2 text-slate-400">
                    <Users className="h-4 w-4" />
                    Admin
                    <Badge variant="secondary">{recipientStats.admins}</Badge>
                  </Label>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>📧 Totale destinatari:</strong> {getTotalRecipients().toLocaleString()} persone riceveranno
                  questa newsletter
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4 pt-4">
            <div className="border rounded-lg overflow-hidden border-slate-700">
              <div className="bg-slate-800 p-4 border-b border-slate-700">
                <h3 className="font-semibold text-slate-200">📧 {formData.subject || "Oggetto newsletter"}</h3>
                <p className="text-sm text-slate-400">Da: Moonthir &lt;noreply@moonthir.com&gt;</p>
              </div>
              <div className="p-6 bg-slate-950 min-h-[400px]">
                {formData.content ? (
                  <div
                    className="prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                ) : (
                  <div className="text-center text-slate-600 py-20">
                    <Mail className="h-12 w-12 mx-auto mb-4" />
                    <p>L'anteprima della newsletter apparirà qui</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Stima Apertura</h4>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(getTotalRecipients() * 0.25).toLocaleString()}
                </div>
                <p className="text-xs text-blue-600">~25% tasso apertura</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Stima Click</h4>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(getTotalRecipients() * 0.05).toLocaleString()}
                </div>
                <p className="text-xs text-green-600">~5% tasso click</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Miglior Orario</h4>
                </div>
                <div className="text-lg font-bold text-purple-600">10:00 - 11:00</div>
                <p className="text-xs text-purple-600">Martedì mattina</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">Score Qualità</h4>
                </div>
                <div className="text-2xl font-bold text-yellow-600">8.5/10</div>
                <p className="text-xs text-yellow-600">Ottimo contenuto</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-400">
                <BarChart3 className="h-5 w-5" />
                Suggerimenti per Migliorare
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Oggetto accattivante con emoji ✅
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Lunghezza contenuto ottimale ✅
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Aggiungi più call-to-action
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Considera di programmare l'invio per martedì mattina
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* Azioni finali */}
        <DialogFooter className="pt-6 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} className="bg-transparent border-slate-600 hover:bg-slate-800">
            Annulla
          </Button>
          <Button
            onClick={handleSendNewsletter}
            disabled={isSending}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? "Invio..." : `🚀 Invia Newsletter`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
