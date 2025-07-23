"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { startConsultationAction, endConsultationAction } from "@/lib/actions/consultations.actions"

interface WebRTCCallProps {
  isOperator: boolean
  clientId: string
  operatorId: string
  serviceId: string
  onCallEnd: () => void
}

export function WebRTCCall({ isOperator, clientId, operatorId, serviceId, onCallEnd }: WebRTCCallProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const localAudioRef = useRef<HTMLAudioElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const supabase = createClient()

  // Effetto per il timer della durata della chiamata
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

  // Effetto per i listener Realtime di Supabase
  useEffect(() => {
    if (!consultationId) return

    // --- Listener per lo Stato della Consultazione (Terminazione Automatica) ---
    const consultationChannel = supabase
      .channel(`consultation-status-${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "consultations",
          filter: `id=eq.${consultationId}`,
        },
        (payload) => {
          if (payload.new.status === "completed") {
            setError("Credito esaurito. La chiamata è stata terminata.")
            forceEndCall()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(consultationChannel)
    }
  }, [consultationId, supabase])

  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
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
    setIsInitializing(true)
    setError(null)

    // 1. Avvia la consultazione sul backend
    const result = await startConsultationAction(clientId, operatorId, serviceId, "call")
    if (!result.success || !result.consultationId) {
      setError(result.error || "Impossibile avviare la chiamata.")
      setIsInitializing(false)
      return
    }
    setConsultationId(result.consultationId)

    // 2. Avvia la connessione WebRTC
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      localStreamRef.current = stream
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream
      }

      initializePeerConnection()
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current?.addTrack(track, stream)
      })

      if (isOperator) {
        const offer = await peerConnectionRef.current?.createOffer()
        await peerConnectionRef.current?.setLocalDescription(offer)
        // Invia offerta tramite WebSocket
        console.log("Offerta creata:", offer)
      }

      setIsCallActive(true)
    } catch (err) {
      console.error("Errore avvio chiamata WebRTC:", err)
      setError("Impossibile accedere al microfono.")
      // Se WebRTC fallisce, terminiamo anche la consultazione sul backend
      await endConsultationAction(result.consultationId, "webrtc_failed")
    } finally {
      setIsInitializing(false)
    }
  }

  const forceEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    setIsCallActive(false)
    setCallDuration(0)
  }

  const handleEndCall = async () => {
    forceEndCall()
    if (consultationId) {
      await endConsultationAction(consultationId, isOperator ? "operator_ended" : "client_ended")
    }
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

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-red-500 bg-red-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Errore Chiamata
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={onCallEnd} variant="destructive">
            Chiudi
          </Button>
        </CardContent>
      </Card>
    )
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
          <Button
            onClick={startCall}
            disabled={isInitializing}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {isInitializing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Phone className="mr-2 h-5 w-5" />}
            {isInitializing ? "Avvio in corso..." : "Avvia Chiamata"}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              <Button
                onClick={toggleSpeaker}
                variant={isSpeakerOn ? "outline" : "secondary"}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </Button>
            </div>

            <Button onClick={handleEndCall} variant="destructive" className="w-full" size="lg">
              <PhoneOff className="mr-2 h-5 w-5" />
              Termina Chiamata
            </Button>
          </div>
        )}

        {/* Elementi audio */}
        <audio ref={localAudioRef} muted autoPlay playsInline />
        <audio ref={remoteAudioRef} autoPlay playsInline />
      </CardContent>
    </Card>
  )
}
