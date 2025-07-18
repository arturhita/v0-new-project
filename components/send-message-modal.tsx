"use client"

import type React from "react"
import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@nextui-org/react"
import { sendInternalMessage } from "@/lib/actions/messaging.actions"

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ isOpen, onClose, recipientId }) => {
  const [messageContent, setMessageContent] = useState("")
  const [subject, setSubject] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    setIsLoading(true)
    try {
      await sendInternalMessage({
        recipientId: recipientId,
        content: messageContent,
        subject: subject,
      })
      onClose()
    } catch (error) {
      console.error("Error sending message:", error)
      // Optionally display an error message to the user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Send Message</ModalHeader>
            <ModalBody>
              <Input
                type="text"
                label="Subject"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Textarea
                label="Message"
                placeholder="Enter your message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={close}>
                Close
              </Button>
              <Button color="primary" onPress={handleSendMessage} isLoading={isLoading}>
                Send
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default SendMessageModal
