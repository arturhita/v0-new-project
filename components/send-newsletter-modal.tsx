"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { sendNewsletter } from "@/lib/actions/messaging.actions"

export function SendNewsletterModal() {
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [open, setOpen] = useState(false)

  const handleSendNewsletter = async () => {
    await sendNewsletter({ email, subject, body })
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Send Newsletter</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send Newsletter</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to send a newsletter?</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="Email Address"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
              placeholder="Subject"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="body" className="text-right">
              Body
            </Label>
            <Input
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="col-span-3"
              placeholder="Body"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSendNewsletter}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
