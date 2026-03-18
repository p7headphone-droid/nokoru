'use client'

import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────
// 時間帯の判定
// ─────────────────────────────────────────
type TimeOfDay = 'morning' | 'noon' | 'evening' | 'night'

function getTimeOfDay(dateStr: string): TimeOfDay {
  const hour = new Date(dateStr).getHours()
  if (hour >= 5  && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'noon'
  if (hour >= 17 && hour < 19) return 'evening'
  return 'night'
}

const TIME_CONFIG: Record<TimeOfDay, { gradient: string; opacity: number }> = {
  morning: {
    gradient: 'linear-gradient(160deg, #87CEEB 0%, #B8E4F9 40%, #FFF8E7 100%)',
    opacity: 0.18,
  },
  noon: {
    gradient: 'linear-gradient(160deg, #E8F4FD 0%, #FFFFFF 60%, #EEF6FF 100%)',
    opacity: 0.10,
  },
  evening: {
    gradient: 'linear-gradient(160deg, #C0392B 0%, #E74C3C 20%, #FF6B35 45%, #FFD166 80%, #FFF4D4 100%)',
    opacity: 0.22,
  },
  night: {
    gradient: 'linear-gradient(160deg, #050A1F 0%, #0D1B3E 40%, #1A2456 70%, #0F0B2E 100%)',
    opacity: 0.40,
  },
}

// ─────────────────────────────────────────
// moodパーティクル設定
// ─────────────────────────────────────────
const MOOD_CONFIG = {
  happy:    { colors: ['#FFD700', '#FFA500', '#FFE566', '#FF9F1C', '#FFEC8B', '#FFC300'] },
  sad:      { colors: ['#7B6FC4', '#8B7DD8', '#5E5A9E', '#A594E8', '#9B8FD4', '#6E64C0'] },
  positive: { colors: ['#FF6B35', '#FF8C42', '#FFA850', '#FF5722', '#FFB347', '#E64A19'] },
}

type Particle = {
  x: number; y: number
  vx: number; vy: number
  size: number; color: string
}

function runMoodEffect(canvas: HTMLCanvasElement, mood: string, onDone: () => void) {
  const ctx = canvas.getContext('2d')
  if (!ctx) { onDone(); return }

  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight

  const cfg = MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]
  if (!cfg) { onDone(); return }

  const isSad = mood === 'sad'
  const cx = canvas.width * 0.5
  const cy = canvas.height * 0.5

  const particles: Particle[] = Array.from({ length: 120 }, () => {
    if (isSad) {
      return {
        x:    Math.random() * canvas.width,
        y:    -Math.random() * 40,
        vx:   (Math.random() - 0.5) * 1.2,
        vy:   Math.random() * 5 + 3,
        size: Math.random() * 3 + 1,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
      }
    }
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 10 + 4
    return {
      x: cx, y: cy,
      vx:   Math.cos(angle) * speed,
      vy:   Math.sin(angle) * speed - 3,
      size: Math.random() * 6 + 2,
      color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
    }
  })

  let frame = 0
  const maxFrames = 90
  let rafId: number

  function animate() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
    const progress = frame / maxFrames
    const alpha = progress < 0.55 ? 1 : 1 - (progress - 0.55) / 0.45

    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      if (!isSad) p.vy += 0.18 // gravity

      ctx!.save()
      ctx!.globalAlpha = Math.max(0, alpha)
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx!.fillStyle = p.color

      // glow
      ctx!.shadowBlur  = 8
      ctx!.shadowColor = p.color
      ctx!.fill()
      ctx!.restore()
    })

    frame++
    if (frame < maxFrames) {
      rafId = requestAnimationFrame(animate)
    } else {
      onDone()
    }
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─────────────────────────────────────────
// MoodEffect — ページを開いた瞬間の一発エフェクト
// ─────────────────────────────────────────
export function MoodEffect({ mood }: { mood: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!mood || !canvasRef.current) return
    const cleanup = runMoodEffect(canvasRef.current, mood, () => setVisible(false))
    return cleanup ?? undefined
  }, [mood])

  if (!mood || !visible) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  )
}

// ─────────────────────────────────────────
// TimeBackground — 時間帯に応じた持続背景
// ─────────────────────────────────────────
export function TimeBackground({ createdAt }: { createdAt: string }) {
  const timeOfDay = getTimeOfDay(createdAt)
  const { gradient, opacity } = TIME_CONFIG[timeOfDay]
  const isNight = timeOfDay === 'night'

  // 星の位置を決定論的に生成（index基準で計算）
  const [stars] = useState(() =>
    isNight
      ? Array.from({ length: 55 }, (_, i) => ({
          id:       i,
          top:      `${(i * 17.3 + 3) % 100}%`,
          left:     `${(i * 13.7 + 7) % 100}%`,
          size:     ((i * 7 + 3) % 3) + 1,
          opacity:  (((i * 11) % 60) + 30) / 100,
          duration: `${((i * 27) % 30 + 20) / 10}s`,
          delay:    `${((i * 13) % 30) / 10}s`,
        }))
      : []
  )

  return (
    <>
      {/* グラデーション背景オーバーレイ */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: gradient, opacity, zIndex: 0 }}
      />
      {/* 夜の星 */}
      {isNight && stars.map(star => (
        <div
          key={star.id}
          className="fixed rounded-full bg-white pointer-events-none"
          style={{
            top:      star.top,
            left:     star.left,
            width:    star.size + 'px',
            height:   star.size + 'px',
            opacity:  star.opacity,
            zIndex:   0,
            animation: `twinkle ${star.duration} ${star.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </>
  )
}
