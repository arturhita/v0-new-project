"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react"

interface WebRTCCallProps {
  sessionId: string
  isOperator: boolean
  onCallEnd: () => void
}

export function WebRTCCall({ sessionId, isOperator, onCallEnd }: WebRTCCallProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)

  const localAudioRef = useRef<HTMLAudioElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCallActive])

  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Aggiungi TURN server per produzione
      ],
    }

    peerConnectionRef.current = new RTCPeerConnection(configuration)

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Invia ICE candidate tramite WebSocket
        console.log("ICE candidate:", event.candidate)
      }
    }

    peerConnectionRef.current.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0]
      }
    }
  }

  const startCall = async () => {
    try {
      // Richiedi accesso al microfono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      localStreamRef.current = stream

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream
      }

      initializePeerConnection()

      // Aggiungi stream locale alla connessione
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current?.addTrack(track, stream)
      })

      if (isOperator) {
        // L'operatore crea l'offerta
        const offer = await peerConnectionRef.current?.createOffer()
        await peerConnectionRef.current?.setLocalDescription(offer)

        // Invia offerta tramite WebSocket
        console.log("Offerta creata:", offer)
      }

      setIsCallActive(true)
    } catch (error) {
      console.error("Errore avvio chiamata:", error)
      alert("Impossibile accedere al microfono")
    }
  }

  const endCall = () => {
    // Chiudi stream locale
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Chiudi peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    setIsCallActive(false)
    setCallDuration(0)
    onCallEnd()
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerOn
      setIsSpeakerOn(!isSpeakerOn)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="h-5 w-5" />
          {isCallActive ? "Chiamata in corso" : "Chiamata vocale"}
        </CardTitle>
        {isCallActive && <p className="text-lg font-mono text-sky-600">{formatDuration(callDuration)}</p>}
      </CardHeader>

      <CardContent className="space-y-4">
        {!isCallActive ? (
          <Button onClick={startCall} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
            <Phone className="mr-2 h-5 w-5" />
            Avvia Chiamata
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="rounded-full"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button
                onClick={toggleSpeaker}
                variant={isSpeakerOn ? "outline" : "secondary"}
                size="lg"
                className="rounded-full"
              >
                {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            </div>

            <Button onClick={endCall} variant="destructive" className="w-full" size="lg">
              <PhoneOff className="mr-2 h-5 w-5" />
              Termina Chiamata
            </Button>
          </div>
        )}

        {/* Audio elements */}
        <audio ref={localAudioRef} muted autoPlay />
        <audio ref={remoteAudioRef} autoPlay />
      </CardContent>
    </Card>
  )
}
