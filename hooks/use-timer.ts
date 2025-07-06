"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export const useTimer = (callback: () => void, interval = 60000) => {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const startTimer = useCallback(() => {
    if (isRunning) return

    setIsRunning(true)
    startTimeRef.current = Date.now() - elapsedTime

    // Timer per l'aggiornamento del tempo trascorso (ogni secondo)
    const tick = () => {
      setElapsedTime(Date.now() - startTimeRef.current)
    }
    tick() // Esegui subito
    const elapsedTimerId = setInterval(tick, 1000)

    // Timer per la callback (ogni 'interval' millisecondi)
    const callbackTimerId = setInterval(() => {
      callbackRef.current()
    }, interval)

    intervalRef.current = {
      elapsed: elapsedTimerId,
      callback: callbackTimerId,
    } as any // Cast per semplicità, in un'app reale si potrebbe usare un oggetto più strutturato
  }, [isRunning, elapsedTime, interval])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        // @ts-ignore
        clearInterval(intervalRef.current.elapsed)
        // @ts-ignore
        clearInterval(intervalRef.current.callback)
      }
    }
  }, [])

  const formatTime = (timeInMs: number) => {
    const totalSeconds = Math.floor(timeInMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0")
    const seconds = (totalSeconds % 60).toString().padStart(2, "0")
    return `${minutes}:${seconds}`
  }

  return { isRunning, elapsedTime, startTimer, stopTimer, formattedTime: formatTime(elapsedTime) }
}
