'use client'

import { useEffect, useRef, useState } from 'react'
import { radioStation, RadioStream } from '@/src/config/stations'
import styles from './page.module.css'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        colorScheme: 'light' | 'dark'
        themeParams?: {
          bg_color?: string
          text_color?: string
          button_color?: string
          button_text_color?: string
        }
        onEvent: (event: string, callback: () => void) => void
      }
    }
  }
}

export default function Home() {
  const [currentStream, setCurrentStream] = useState<RadioStream | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState('Остановлено')
  const [error, setError] = useState<string | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement>(null)
  const playPauseBtnRef = useRef<HTMLButtonElement>(null)
  const canPlayHandlerRef = useRef<(() => void) | null>(null)
  const currentStreamIdRef = useRef<string | null>(null)

  // Инициализация Telegram Web App
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()

      // Применение темы Telegram
      if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark')
      }

      // Обновление цветов из Telegram
      if (tg.themeParams) {
        const root = document.documentElement
        if (tg.themeParams.bg_color) {
          root.style.setProperty('--bg-color', tg.themeParams.bg_color)
        }
        if (tg.themeParams.text_color) {
          root.style.setProperty('--text-color', tg.themeParams.text_color)
        }
        if (tg.themeParams.button_color) {
          root.style.setProperty('--button-bg', tg.themeParams.button_color)
        }
        if (tg.themeParams.button_text_color) {
          root.style.setProperty('--button-text', tg.themeParams.button_text_color)
        }
      }

      // Обработка закрытия приложения
      tg.onEvent('viewportChanged', () => {
        tg.expand()
      })
    }
  }, [])

  // Настройка аудио-плеера
  useEffect(() => {
    const audioPlayer = audioPlayerRef.current
    if (!audioPlayer) return

    const handleLoadStart = () => {
      setStatus('Загрузка...')
      if (playPauseBtnRef.current) {
        playPauseBtnRef.current.disabled = true
      }
    }

    const handleCanPlay = () => {
      if (playPauseBtnRef.current) {
        playPauseBtnRef.current.disabled = false
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleError = (e: Event) => {
      const error = audioPlayer.error
      // Ignore abort errors (code 1 = MEDIA_ERR_ABORTED) as they're expected when switching streams
      if (error && error.code === 1) {
        return
      }
      // Ignore errors when src is empty (happens during stream switching)
      if (!audioPlayer.src || audioPlayer.src.trim() === '') {
        return
      }
      // Ignore errors when src is the base URL (happens when clearing src with empty string)
      const currentSrc = audioPlayer.src
      try {
        const url = new URL(currentSrc)
        // Check if src is the current page's base URL (indicates we're switching streams)
        if (url.origin === window.location.origin && (url.pathname === '/' || url.pathname === window.location.pathname)) {
          return
        }
      } catch (e) {
        // URL parsing failed, continue with error handling
      }
      setError('Ошибка воспроизведения. Проверьте подключение к интернету.')
      setIsPlaying(false)
      if (playPauseBtnRef.current) {
        playPauseBtnRef.current.disabled = false
      }
    }

    const handleWaiting = () => {
      setStatus('Буферизация...')
    }

    const handlePlaying = () => {
      setStatus('Воспроизведение')
    }

    const handleStalled = () => {
      setStatus('Проблема с подключением...')
    }

    audioPlayer.addEventListener('loadstart', handleLoadStart)
    audioPlayer.addEventListener('canplay', handleCanPlay)
    audioPlayer.addEventListener('play', handlePlay)
    audioPlayer.addEventListener('pause', handlePause)
    audioPlayer.addEventListener('error', handleError)
    audioPlayer.addEventListener('waiting', handleWaiting)
    audioPlayer.addEventListener('playing', handlePlaying)
    audioPlayer.addEventListener('stalled', handleStalled)

    return () => {
      audioPlayer.removeEventListener('loadstart', handleLoadStart)
      audioPlayer.removeEventListener('canplay', handleCanPlay)
      audioPlayer.removeEventListener('play', handlePlay)
      audioPlayer.removeEventListener('pause', handlePause)
      audioPlayer.removeEventListener('error', handleError)
      audioPlayer.removeEventListener('waiting', handleWaiting)
      audioPlayer.removeEventListener('playing', handlePlaying)
      audioPlayer.removeEventListener('stalled', handleStalled)
    }
  }, [])

  // Скрытие ошибки через 5 секунд
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const selectStream = (stream: RadioStream) => {
    if (currentStream?.id === stream.id && isPlaying) {
      togglePlayPause()
      return
    }

    const audioPlayer = audioPlayerRef.current
    if (!audioPlayer) return

    // Validate stream URL
    if (!stream.streamUrl || stream.streamUrl.trim() === '') {
      setError('Некорректный URL потока')
      return
    }

    // Stop current playback and abort any ongoing load
    if (isPlaying) {
      audioPlayer.pause()
      setIsPlaying(false)
    }

    // Set new stream first
    setCurrentStream(stream)
    currentStreamIdRef.current = stream.id
    
    // Stop and pause current playback to abort any ongoing fetch
    audioPlayer.pause()
    
    // Remove previous canplay handler if exists
    if (canPlayHandlerRef.current) {
      audioPlayer.removeEventListener('canplay', canPlayHandlerRef.current)
      canPlayHandlerRef.current = null
    }
    
    // Set new source directly - browser will automatically abort previous load
    audioPlayer.src = stream.streamUrl
    audioPlayer.load()
    
    // Wait for canplay event before playing
    const streamId = stream.id // Capture stream.id in closure
    const handleCanPlayOnce = () => {
      // Verify this is still the current stream using stream ID
      if (currentStreamIdRef.current !== streamId) {
        return
      }
      canPlayHandlerRef.current = null
      audioPlayer.play().then(() => {
        // Play started successfully
      }).catch((err) => {
        if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
          return
        }
        console.error('Play error:', err)
        setError('Не удалось начать воспроизведение')
        setIsPlaying(false)
      })
    }
    canPlayHandlerRef.current = handleCanPlayOnce
    audioPlayer.addEventListener('canplay', handleCanPlayOnce, { once: true })
  }

  const togglePlayPause = () => {
    if (!currentStream) {
      setError('Выберите поток для воспроизведения')
      return
    }

    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const play = () => {
    if (!currentStream) {
      setError('Выберите поток для воспроизведения')
      return
    }

    const audioPlayer = audioPlayerRef.current
    if (!audioPlayer) return

    // Validate stream URL
    if (!currentStream.streamUrl || currentStream.streamUrl.trim() === '') {
      setError('Некорректный URL потока')
      return
    }

    // Set src if not already set or if it's different
    if (!audioPlayer.src || audioPlayer.src !== currentStream.streamUrl) {
      audioPlayer.src = currentStream.streamUrl
      audioPlayer.load()
    }

    // Only play if src is valid
    if (audioPlayer.src && audioPlayer.src.trim() !== '') {
      audioPlayer.play().catch((err) => {
        // Ignore abort errors when switching streams
        if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
          return
        }
        console.error('Play error:', err)
        setError('Не удалось начать воспроизведение')
        setIsPlaying(false)
      })
    } else {
      setError('Некорректный URL потока')
    }
  }

  const pause = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
    }
  }

  const getStationName = () => {
    if (currentStream) {
      return `${radioStation.name} - ${currentStream.bitrate}`
    }
    return radioStation.name
  }

  const getCurrentStationDisplay = () => {
    if (currentStream) {
      return radioStation.name
    }
    return 'Выберите поток'
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>🎵 Радио RuWorship</h1>
        <div className={styles.headerDescription}>{radioStation.description}</div>
      </header>

      <main>
        <div className={styles.playerSection}>
          <audio ref={audioPlayerRef} preload="none" />
          <div className={styles.playerControls}>
            <button
              ref={playPauseBtnRef}
              className={styles.controlBtn}
              onClick={togglePlayPause}
              aria-label="Воспроизведение/Пауза"
            >
              <span>{isPlaying ? '⏸️' : '▶️'}</span>
            </button>
            <div className={styles.stationInfo}>
              <div className={styles.stationName}>{getStationName()}</div>
              <div className={styles.stationStatus}>
                {!isPlaying && !currentStream ? 'Остановлено' : status}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.stationsSection}>
          <h2 className={styles.stationsSectionTitle}>Доступные потоки</h2>
          <div className={styles.stationsList}>
            {radioStation.streams.map((stream) => (
              <div
                key={stream.id}
                className={`${styles.stationItem} ${
                  currentStream?.id === stream.id && isPlaying ? styles.active : ''
                }`}
                onClick={() => selectStream(stream)}
              >
                <div className={styles.stationItemTitle}>
                  {stream.bitrate} ({stream.protocol})
                </div>
                {currentStream?.id === stream.id && isPlaying && (
                  <div className={styles.stationItemIndicator}>🔊</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
    </div>
  )
}

