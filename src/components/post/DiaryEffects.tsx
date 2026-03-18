'use client'

import { useEffect, useRef } from 'react'

type TimeOfDay = 'day' | 'night'

function getTimeOfDay(dateStr: string): TimeOfDay {
  const hour = new Date(dateStr).getHours()
  return hour >= 6 && hour < 19 ? 'day' : 'night'
}

// ─── Happy / Day: Swaying Grass ──────────────────────────────────────────────
function runHappyDay(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const W = canvas.width
  const H = canvas.height

  const GREENS = [
    '#1B4332', '#2D6A4F', '#40916C', '#52B788',
    '#74C69D', '#3D8B5A', '#245F3B', '#4DA96B',
  ]
  const FLOWER_COLORS = ['#FF6B6B', '#FFD93D', '#FF9FF3', '#FFC3A0', '#DDA0DD']

  type Blade = {
    x: number
    height: number
    width: number
    phase: number
    swayAmount: number
    speed: number
    color: string
    tipColor: string
    hasFlower: boolean
    flowerColor: string
    flowerSize: number
  }

  const bladeCount = Math.ceil(W / 6)
  const blades: Blade[] = Array.from({ length: bladeCount }, (_, i) => {
    const base = GREENS[Math.floor(Math.random() * GREENS.length)]
    return {
      x: (W / bladeCount) * i + (Math.random() - 0.5) * 4,
      height: H * 0.12 + Math.random() * H * 0.22,
      width: 2 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      swayAmount: 18 + Math.random() * 22,
      speed: 0.018 + Math.random() * 0.012,
      color: base,
      tipColor: '#A8D5BA',
      hasFlower: Math.random() < 0.07,
      flowerColor: FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)],
      flowerSize: 3 + Math.random() * 3,
    }
  })

  let t = 0
  let rafId: number

  function drawBlade(blade: Blade) {
    const windSway = Math.sin(t * blade.speed + blade.phase) * blade.swayAmount
      + Math.sin(t * blade.speed * 2.3 + blade.phase * 1.7) * (blade.swayAmount * 0.3)

    const baseX = blade.x
    const baseY = H
    const tipX = baseX + windSway
    const tipY = H - blade.height

    // Control points for natural bezier curve
    const cp1x = baseX + windSway * 0.25
    const cp1y = H - blade.height * 0.35
    const cp2x = baseX + windSway * 0.65
    const cp2y = H - blade.height * 0.72

    // Gradient from base to tip
    const grad = ctx.createLinearGradient(baseX, baseY, tipX, tipY)
    grad.addColorStop(0, blade.color)
    grad.addColorStop(0.6, blade.tipColor)
    grad.addColorStop(1, '#C8ECD5')

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(baseX, baseY)
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tipX, tipY)
    ctx.strokeStyle = grad
    ctx.lineWidth = blade.width
    ctx.lineCap = 'round'
    ctx.stroke()

    if (blade.hasFlower) {
      ctx.beginPath()
      ctx.arc(tipX, tipY, blade.flowerSize, 0, Math.PI * 2)
      ctx.fillStyle = blade.flowerColor
      ctx.shadowBlur = 4
      ctx.shadowColor = blade.flowerColor
      ctx.fill()
      ctx.beginPath()
      ctx.arc(tipX, tipY, blade.flowerSize * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFDE4'
      ctx.shadowBlur = 0
      ctx.fill()
    }
    ctx.restore()
  }

  function animate() {
    ctx.clearRect(0, 0, W, H)

    // Soft sky tint at top
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, 'rgba(120, 200, 240, 0.18)')
    sky.addColorStop(0.5, 'rgba(200, 240, 220, 0.06)')
    sky.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    // Ground
    const ground = ctx.createLinearGradient(0, H * 0.82, 0, H)
    ground.addColorStop(0, 'rgba(27, 67, 50, 0.18)')
    ground.addColorStop(1, 'rgba(27, 67, 50, 0.32)')
    ctx.fillStyle = ground
    ctx.fillRect(0, H * 0.82, W, H * 0.18)

    blades.forEach(b => drawBlade(b))

    t++
    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── Happy / Night: Shooting Stars ───────────────────────────────────────────
function runHappyNight(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const W = canvas.width
  const H = canvas.height

  type Star = { x: number; y: number; size: number; opacity: number; phase: number }
  const stars: Star[] = Array.from({ length: 160 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.85,
    size: Math.random() * 1.6 + 0.3,
    opacity: Math.random() * 0.7 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }))

  type ShootingStar = {
    x: number; y: number
    vx: number; vy: number
    tailLen: number
    opacity: number
    life: number
    maxLife: number
    active: boolean
  }
  const shooters: ShootingStar[] = Array.from({ length: 6 }, () => ({
    x: 0, y: 0, vx: 0, vy: 0,
    tailLen: 0, opacity: 0, life: 0, maxLife: 0, active: false,
  }))

  function spawn(s: ShootingStar) {
    const angle = (Math.PI * 5) / 12 + (Math.random() - 0.5) * 0.6
    const speed = 9 + Math.random() * 9
    s.x = Math.random() * W * 1.2
    s.y = Math.random() * H * 0.55
    s.vx = -Math.cos(angle) * speed
    s.vy = Math.sin(angle) * speed
    s.tailLen = 90 + Math.random() * 130
    s.maxLife = 35 + Math.random() * 20
    s.life = 0
    s.opacity = 1
    s.active = true
  }

  let t = 0
  let spawnCooldown = 40
  let rafId: number

  function animate() {
    ctx.clearRect(0, 0, W, H)

    // Night sky tint
    ctx.fillStyle = 'rgba(2, 5, 28, 0.3)'
    ctx.fillRect(0, 0, W, H)

    // Static stars
    stars.forEach(star => {
      const alpha = star.opacity + Math.sin(t * 0.025 + star.phase) * 0.18
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.shadowBlur = 5
      ctx.shadowColor = '#99ccff'
      ctx.fill()
      ctx.restore()
    })

    // Spawn cooldown
    spawnCooldown--
    if (spawnCooldown <= 0) {
      const idle = shooters.find(s => !s.active)
      if (idle) {
        spawn(idle)
        spawnCooldown = 50 + Math.floor(Math.random() * 80)
      }
    }

    // Draw shooting stars
    shooters.forEach(s => {
      if (!s.active) return
      s.x += s.vx
      s.y += s.vy
      s.life++
      s.opacity = s.life < 8 ? s.life / 8 : Math.max(0, 1 - (s.life - 8) / (s.maxLife - 8))

      const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      const nx = s.vx / spd
      const ny = s.vy / spd
      const tailX = s.x - nx * s.tailLen
      const tailY = s.y - ny * s.tailLen

      const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY)
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`)
      grad.addColorStop(0.25, `rgba(180, 210, 255, ${s.opacity * 0.55})`)
      grad.addColorStop(1, 'rgba(180, 210, 255, 0)')

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(tailX, tailY)
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.8
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(150, 200, 255, 0.7)'
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`
      ctx.shadowBlur = 14
      ctx.shadowColor = '#ffffff'
      ctx.fill()
      ctx.restore()

      if (s.life >= s.maxLife || s.x < -200 || s.y > H + 100) s.active = false
    })

    t++
    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── Sad: Dark Clouds + Rain ──────────────────────────────────────────────────
function runSad(canvas: HTMLCanvasElement, isNight: boolean): () => void {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const W = canvas.width
  const H = canvas.height

  const cloudFill = isNight
    ? (a: number) => `rgba(18, 25, 55, ${a})`
    : (a: number) => `rgba(70, 78, 92, ${a})`
  const rainStroke = isNight
    ? (a: number) => `rgba(90, 120, 175, ${a})`
    : (a: number) => `rgba(140, 155, 170, ${a})`
  const bgColor = isNight
    ? 'rgba(4, 8, 28, 0.38)'
    : 'rgba(88, 96, 108, 0.22)'

  type Cloud = {
    x: number; y: number
    rx: number; ry: number
    speed: number
    opacity: number
    bumps: { ox: number; oy: number; rx: number; ry: number }[]
  }
  function makeCloud(x: number, y: number, rx: number, ry: number, sp: number, op: number): Cloud {
    return {
      x, y, rx, ry, speed: sp, opacity: op,
      bumps: Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => ({
        ox: (Math.random() - 0.5) * rx * 1.2,
        oy: -(Math.random() * ry * 0.6),
        rx: rx * (0.35 + Math.random() * 0.35),
        ry: ry * (0.4 + Math.random() * 0.35),
      })),
    }
  }

  const clouds: Cloud[] = [
    makeCloud(W * 0.0,  H * 0.04, 260, 75, 0.28, 0.95),
    makeCloud(W * 0.35, H * 0.0,  310, 90, 0.22, 0.90),
    makeCloud(W * 0.65, H * 0.06, 280, 80, 0.30, 0.88),
    makeCloud(-W * 0.1, H * 0.12, 240, 65, 0.18, 0.80),
    makeCloud(W * 0.75, H * 0.14, 200, 60, 0.25, 0.85),
    makeCloud(W * 0.2,  H * 0.18, 290, 70, 0.20, 0.78),
  ]

  function drawCloud(c: Cloud) {
    ctx.save()
    ctx.globalAlpha = c.opacity
    ctx.fillStyle = cloudFill(1)

    // Main body
    ctx.beginPath()
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2)
    ctx.fill()
    // Bumps on top
    c.bumps.forEach(b => {
      ctx.beginPath()
      ctx.ellipse(c.x + b.ox, c.y + b.oy, b.rx, b.ry, 0, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()
  }

  type Drop = { x: number; y: number; len: number; speed: number; alpha: number }
  const drops: Drop[] = Array.from({ length: 240 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    len: 12 + Math.random() * 18,
    speed: 9 + Math.random() * 7,
    alpha: 0.25 + Math.random() * 0.45,
  }))

  let rafId: number

  function animate() {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, W, H)

    clouds.forEach(c => {
      c.x += c.speed
      if (c.x - c.rx > W) c.x = -c.rx * 2
      drawCloud(c)
    })

    // Rain
    ctx.save()
    drops.forEach(d => {
      d.y += d.speed
      d.x -= 1.5
      if (d.y - d.len > H) { d.y = -d.len; d.x = Math.random() * W }

      ctx.beginPath()
      ctx.moveTo(d.x, d.y)
      ctx.lineTo(d.x - 1.5, d.y + d.len)
      ctx.strokeStyle = rainStroke(d.alpha)
      ctx.lineWidth = 0.9
      ctx.stroke()
    })
    ctx.restore()

    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── Positive / Day: Sunbeams Through Parting Clouds ─────────────────────────
function runPositiveDay(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const W = canvas.width
  const H = canvas.height

  const SUN_X = W * 0.5
  const SUN_Y = H * -0.05

  type Cloud = {
    x: number; y: number
    rx: number; ry: number
    dirX: number
    opacity: number
    bumps: { ox: number; oy: number; rx: number; ry: number }[]
  }
  function makeCloud(x: number, y: number, rx: number, ry: number, dir: number): Cloud {
    return {
      x, y, rx, ry, dirX: dir, opacity: 0.88,
      bumps: Array.from({ length: 4 }, () => ({
        ox: (Math.random() - 0.5) * rx,
        oy: -(Math.random() * ry * 0.6),
        rx: rx * (0.3 + Math.random() * 0.3),
        ry: ry * (0.4 + Math.random() * 0.3),
      })),
    }
  }

  const clouds: Cloud[] = [
    makeCloud(W * 0.15,  H * 0.12, 260, 80, -1),
    makeCloud(W * 0.7,   H * 0.10, 300, 90, 1),
    makeCloud(-80,        H * 0.22, 220, 65, -1),
    makeCloud(W * 0.78,  H * 0.24, 250, 72, 1),
    makeCloud(W * 0.3,   H * 0.28, 200, 60, -1),
  ]

  const RAY_COUNT = 20
  const rays = Array.from({ length: RAY_COUNT }, (_, i) => ({
    angle: (i / RAY_COUNT) * Math.PI * 2,
    len: 280 + Math.random() * 220,
    halfW: 15 + Math.random() * 28,
    phase: Math.random() * Math.PI * 2,
  }))

  let t = 0
  let rafId: number

  function drawCloud(c: Cloud) {
    ctx.save()
    ctx.globalAlpha = c.opacity
    ctx.fillStyle = 'rgba(240, 248, 255, 1)'
    ctx.beginPath()
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2)
    ctx.fill()
    c.bumps.forEach(b => {
      ctx.beginPath()
      ctx.ellipse(c.x + b.ox, c.y + b.oy, b.rx, b.ry, 0, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()
  }

  function animate() {
    ctx.clearRect(0, 0, W, H)

    // Warm sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, 'rgba(255, 228, 100, 0.22)')
    sky.addColorStop(0.4, 'rgba(255, 245, 200, 0.10)')
    sky.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    // Sun rays
    rays.forEach(ray => {
      const pulse = 0.32 + 0.1 * Math.sin(t * 0.018 + ray.phase)
      const endX = SUN_X + Math.cos(ray.angle) * ray.len
      const endY = SUN_Y + Math.sin(ray.angle) * ray.len

      const grad = ctx.createLinearGradient(SUN_X, SUN_Y, endX, endY)
      grad.addColorStop(0, `rgba(255, 235, 80, ${pulse})`)
      grad.addColorStop(0.35, `rgba(255, 215, 60, ${pulse * 0.28})`)
      grad.addColorStop(1, 'rgba(255, 205, 50, 0)')

      const perp = ray.angle + Math.PI / 2
      const hw = ray.halfW

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(SUN_X + Math.cos(perp) * hw, SUN_Y + Math.sin(perp) * hw)
      ctx.lineTo(endX + Math.cos(perp) * hw * 2.5, endY + Math.sin(perp) * hw * 2.5)
      ctx.lineTo(endX - Math.cos(perp) * hw * 2.5, endY - Math.sin(perp) * hw * 2.5)
      ctx.lineTo(SUN_X - Math.cos(perp) * hw, SUN_Y - Math.sin(perp) * hw)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    })

    // Sun glow
    ctx.save()
    const sunGrad = ctx.createRadialGradient(SUN_X, SUN_Y, 0, SUN_X, SUN_Y, 90)
    sunGrad.addColorStop(0, 'rgba(255, 255, 210, 0.95)')
    sunGrad.addColorStop(0.4, 'rgba(255, 235, 100, 0.55)')
    sunGrad.addColorStop(1, 'rgba(255, 210, 60, 0)')
    ctx.beginPath()
    ctx.arc(SUN_X, SUN_Y, 90, 0, Math.PI * 2)
    ctx.fillStyle = sunGrad
    ctx.shadowBlur = 40
    ctx.shadowColor = 'rgba(255, 230, 80, 0.5)'
    ctx.fill()
    ctx.restore()

    // Parting clouds
    clouds.forEach(c => {
      c.x += c.dirX * 0.45
      drawCloud(c)
    })

    t++
    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── Positive / Night: Moon Emerging ─────────────────────────────────────────
function runPositiveNight(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const W = canvas.width
  const H = canvas.height

  const MOON_X = W * 0.5
  const MOON_Y = H * 0.14
  const MOON_R = 52

  type Star = { x: number; y: number; size: number; opacity: number; phase: number }
  const stars: Star[] = Array.from({ length: 130 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.75,
    size: Math.random() * 1.5 + 0.3,
    opacity: Math.random() * 0.7 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }))

  type Cloud = {
    x: number; y: number
    rx: number; ry: number
    dirX: number
    bumps: { ox: number; oy: number; rx: number; ry: number }[]
  }
  function makeCloud(x: number, y: number, rx: number, ry: number, dir: number): Cloud {
    return {
      x, y, rx, ry, dirX: dir,
      bumps: Array.from({ length: 4 }, () => ({
        ox: (Math.random() - 0.5) * rx,
        oy: -(Math.random() * ry * 0.65),
        rx: rx * (0.32 + Math.random() * 0.3),
        ry: ry * (0.4 + Math.random() * 0.3),
      })),
    }
  }

  const clouds: Cloud[] = [
    makeCloud(W * 0.08,  H * 0.09, 290, 90, -1),
    makeCloud(W * 0.62,  H * 0.07, 330, 100, 1),
    makeCloud(-100,       H * 0.2,  240, 70, -1),
    makeCloud(W * 0.76,  H * 0.22, 260, 75, 1),
  ]

  let t = 0
  let rafId: number

  function drawCloud(c: Cloud) {
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.fillStyle = 'rgba(15, 22, 52, 1)'
    ctx.beginPath()
    ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2)
    ctx.fill()
    c.bumps.forEach(b => {
      ctx.beginPath()
      ctx.ellipse(c.x + b.ox, c.y + b.oy, b.rx, b.ry, 0, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()
  }

  function animate() {
    ctx.clearRect(0, 0, W, H)

    // Dark sky
    ctx.fillStyle = 'rgba(3, 7, 30, 0.32)'
    ctx.fillRect(0, 0, W, H)

    // Stars
    stars.forEach(star => {
      const alpha = star.opacity + Math.sin(t * 0.025 + star.phase) * 0.16
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.shadowBlur = 4
      ctx.shadowColor = '#99bbff'
      ctx.fill()
      ctx.restore()
    })

    // Moon halo
    const halo = ctx.createRadialGradient(MOON_X, MOON_Y, MOON_R, MOON_X, MOON_Y, MOON_R * 5.5)
    halo.addColorStop(0, 'rgba(215, 228, 255, 0.28)')
    halo.addColorStop(0.35, 'rgba(200, 218, 255, 0.12)')
    halo.addColorStop(1, 'rgba(200, 218, 255, 0)')
    ctx.save()
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(MOON_X, MOON_Y, MOON_R * 5.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Moon
    const moonGrad = ctx.createRadialGradient(
      MOON_X - 12, MOON_Y - 12, 0,
      MOON_X, MOON_Y, MOON_R,
    )
    moonGrad.addColorStop(0, 'rgba(255, 255, 248, 0.98)')
    moonGrad.addColorStop(0.55, 'rgba(225, 230, 248, 0.85)')
    moonGrad.addColorStop(1, 'rgba(190, 205, 230, 0.65)')
    ctx.save()
    ctx.beginPath()
    ctx.arc(MOON_X, MOON_Y, MOON_R, 0, Math.PI * 2)
    ctx.fillStyle = moonGrad
    ctx.shadowBlur = 28
    ctx.shadowColor = 'rgba(200, 220, 255, 0.55)'
    ctx.fill()
    ctx.restore()

    // Moonbeam
    const beamW = 90 + 35 * Math.sin(t * 0.012)
    const beamGrad = ctx.createLinearGradient(MOON_X, MOON_Y + MOON_R, MOON_X, H)
    beamGrad.addColorStop(0, 'rgba(200, 218, 255, 0.14)')
    beamGrad.addColorStop(0.5, 'rgba(200, 218, 255, 0.05)')
    beamGrad.addColorStop(1, 'rgba(200, 218, 255, 0)')
    ctx.save()
    ctx.fillStyle = beamGrad
    ctx.beginPath()
    ctx.moveTo(MOON_X - beamW / 2, MOON_Y + MOON_R)
    ctx.lineTo(MOON_X - beamW * 2.5, H)
    ctx.lineTo(MOON_X + beamW * 2.5, H)
    ctx.lineTo(MOON_X + beamW / 2, MOON_Y + MOON_R)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Parting clouds (dark, over the moon)
    clouds.forEach(c => {
      c.x += c.dirX * 0.5
      drawCloud(c)
    })

    t++
    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── DiaryCanvas ─────────────────────────────────────────────────────────────
interface DiaryCanvasProps {
  mood: string | null
  createdAt: string
}

export function DiaryCanvas({ mood, createdAt }: DiaryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isNight = getTimeOfDay(createdAt) === 'night'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !mood) return

    let cleanup: (() => void) | undefined

    if (mood === 'happy') {
      cleanup = isNight ? runHappyNight(canvas) : runHappyDay(canvas)
    } else if (mood === 'sad') {
      cleanup = runSad(canvas, isNight)
    } else if (mood === 'positive') {
      cleanup = isNight ? runPositiveNight(canvas) : runPositiveDay(canvas)
    }

    const handleResize = () => {
      if (!canvas) return
      cleanup?.()
      if (mood === 'happy') {
        cleanup = isNight ? runHappyNight(canvas) : runHappyDay(canvas)
      } else if (mood === 'sad') {
        cleanup = runSad(canvas, isNight)
      } else if (mood === 'positive') {
        cleanup = isNight ? runPositiveNight(canvas) : runPositiveDay(canvas)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      cleanup?.()
    }
  }, [mood, isNight])

  if (!mood) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// ─── Legacy exports (backward compat — replaced by DiaryCanvas) ───────────────
export function MoodEffect({ mood: _ }: { mood: string | null }) { return null }
export function TimeBackground({ createdAt: _ }: { createdAt: string }) { return null }
