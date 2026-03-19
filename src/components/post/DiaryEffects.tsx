'use client'

import { useEffect, useRef } from 'react'

type TimeOfDay = 'day' | 'night'

// 現在時刻で昼夜を判定（投稿作成時刻ではなく閲覧時刻ベース）
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 19 ? 'day' : 'night'
}

// ─── 共通ヘルパー: 月（右上固定・白銀暖色・穏やかな光） ────────────────────
function drawMoonTopRight(ctx: CanvasRenderingContext2D, W: number) {
  const x = W - 88
  const y = 82
  const r = 44

  // 外側のハロー
  const halo = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 4.5)
  halo.addColorStop(0, 'rgba(255, 248, 228, 0.26)')
  halo.addColorStop(0.4, 'rgba(255, 240, 210, 0.10)')
  halo.addColorStop(1, 'rgba(255, 235, 200, 0)')
  ctx.save()
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(x, y, r * 4.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 月本体（白銀・少し暖色）
  const moonGrad = ctx.createRadialGradient(x - 12, y - 12, 0, x, y, r)
  moonGrad.addColorStop(0, 'rgba(255, 254, 245, 0.99)')
  moonGrad.addColorStop(0.45, 'rgba(245, 240, 222, 0.93)')
  moonGrad.addColorStop(1, 'rgba(225, 218, 200, 0.78)')
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = moonGrad
  ctx.shadowBlur = 28
  ctx.shadowColor = 'rgba(255, 235, 180, 0.55)'
  ctx.fill()
  ctx.restore()
}

// ─── 共通ヘルパー: 太陽（右上固定・暖色・穏やかな光）月と統一感のあるデザイン ─
function drawSunTopRight(ctx: CanvasRenderingContext2D, W: number, t: number) {
  const x = W - 88
  const y = 82
  const r = 42

  // 脈動するハロー
  const pulse = 0.48 + 0.12 * Math.sin(t * 0.02)
  const halo = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 4.8)
  halo.addColorStop(0, `rgba(255, 215, 80, ${pulse})`)
  halo.addColorStop(0.35, `rgba(255, 195, 50, ${pulse * 0.32})`)
  halo.addColorStop(1, 'rgba(255, 180, 30, 0)')
  ctx.save()
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(x, y, r * 4.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 太陽本体（暖かみのある白〜オレンジ）
  const sunGrad = ctx.createRadialGradient(x - 10, y - 10, 0, x, y, r)
  sunGrad.addColorStop(0, 'rgba(255, 252, 230, 0.99)')
  sunGrad.addColorStop(0.4, 'rgba(255, 230, 110, 0.94)')
  sunGrad.addColorStop(1, 'rgba(255, 190, 55, 0.80)')
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = sunGrad
  ctx.shadowBlur = 32
  ctx.shadowColor = 'rgba(255, 210, 80, 0.62)'
  ctx.fill()
  ctx.restore()
}

// ─── 共通ヘルパー: 自然で柔らかい雲を描画 ───────────────────────────────────
// 複数の円を重ねてシームレスな雲の輪郭を作る
function drawSoftCloud(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number,
  color: string, opacity: number
) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = color

  // 各パフ: { ox, oy, r } — 重なり合うことで自然な雲の形になる
  const puffs = [
    { ox: 0,          oy: 0,          r: ry * 1.00 }, // 中央ベース（最大）
    { ox: -rx * 0.38, oy:  ry * 0.05, r: ry * 0.88 }, // 左ベース
    { ox:  rx * 0.38, oy:  ry * 0.05, r: ry * 0.82 }, // 右ベース
    { ox: -rx * 0.65, oy:  ry * 0.15, r: ry * 0.65 }, // 左端
    { ox:  rx * 0.65, oy:  ry * 0.18, r: ry * 0.60 }, // 右端
    { ox: -rx * 0.15, oy: -ry * 0.52, r: ry * 0.72 }, // 中央左上
    { ox:  rx * 0.22, oy: -ry * 0.58, r: ry * 0.65 }, // 中央右上
    { ox: -rx * 0.48, oy: -ry * 0.30, r: ry * 0.55 }, // 左上
  ]

  puffs.forEach(p => {
    ctx.beginPath()
    ctx.arc(cx + p.ox, cy + p.oy, p.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.restore()
}

// ─── 共通ヘルパー: 雲オブジェクト生成 ──────────────────────────────────────
function makeCloud(
  x: number, y: number, rx: number, ry: number, dirX: number
) {
  return { x, y, rx, ry, dirX, opacity: 0.88 }
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
    x: number; height: number; width: number
    phase: number; swayAmount: number; speed: number
    color: string; tipColor: string
    hasFlower: boolean; flowerColor: string; flowerSize: number
  }

  const bladeCount = Math.ceil(W / 6)
  const blades: Blade[] = Array.from({ length: bladeCount }, (_, i) => {
    const base = GREENS[Math.floor(Math.random() * GREENS.length)]
    return {
      x: (W / bladeCount) * i + (Math.random() - 0.5) * 4,
      height: H * 0.10 + Math.random() * H * 0.20,
      width: 2 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      swayAmount: 8 + Math.random() * 10,             // 風でゆっくり穏やかに揺れる（8-18px）
      speed: 0.015 + Math.random() * 0.010,           // 穏やかな速度（約4-8秒で1周期）
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
      + Math.sin(t * blade.speed * 1.6 + blade.phase * 1.3) * (blade.swayAmount * 0.20) // 第2高調波
    const baseX = blade.x
    const baseY = H + 6                             // 画面下端より少し下から生やす
    const tipX = baseX + windSway
    const tipY = baseY - blade.height
    const cp1x = baseX + windSway * 0.20
    const cp1y = baseY - blade.height * 0.32
    const cp2x = baseX + windSway * 0.58
    const cp2y = baseY - blade.height * 0.68
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
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, 'rgba(120, 200, 240, 0.18)')
    sky.addColorStop(0.5, 'rgba(200, 240, 220, 0.06)')
    sky.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)
    // 地面パッチ: 草の根元が自然に見えるよう下部をグラデーション
    const ground = ctx.createLinearGradient(0, H * 0.80, 0, H)
    ground.addColorStop(0, 'rgba(27, 67, 50, 0.0)')
    ground.addColorStop(0.6, 'rgba(27, 67, 50, 0.28)')
    ground.addColorStop(1, 'rgba(22, 55, 40, 0.55)')
    ctx.fillStyle = ground
    ctx.fillRect(0, H * 0.80, W, H * 0.20)
    blades.forEach(b => drawBlade(b))
    t++
    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── Happy / Night: 流れ星（右上→左下固定方向・少なめ・大きめ・キラッと） ──
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
  // 3個に減らして頻度を半減
  const shooters: ShootingStar[] = Array.from({ length: 3 }, () => ({
    x: 0, y: 0, vx: 0, vy: 0,
    tailLen: 0, opacity: 0, life: 0, maxLife: 0, active: false,
  }))

  function spawn(s: ShootingStar) {
    // 右上エリアから左下方向に固定（多少のランダム性あり）
    const angle = (Math.PI * 5) / 12 + (Math.random() - 0.5) * 0.4
    const speed = 11 + Math.random() * 8
    // 右側上部から出現
    s.x = W * 0.45 + Math.random() * W * 0.7
    s.y = Math.random() * H * 0.35
    s.vx = -Math.cos(angle) * speed
    s.vy = Math.sin(angle) * speed
    s.tailLen = 150 + Math.random() * 140   // 大きくする
    s.maxLife = 40 + Math.random() * 25
    s.life = 0
    s.opacity = 1
    s.active = true
  }

  let t = 0
  // 頻度を半減: 旧 50-130f → 新 120-280f
  let spawnCooldown = 80
  let rafId: number

  function drawSparkle(x: number, y: number, opacity: number) {
    if (opacity < 0.3) return
    const arms = 4
    const len = 14 * opacity
    ctx.save()
    ctx.globalAlpha = opacity * 0.9
    ctx.strokeStyle = 'rgba(255, 255, 220, 0.95)'
    ctx.lineWidth = 1.8
    ctx.shadowBlur = 8
    ctx.shadowColor = 'rgba(255, 255, 200, 0.9)'
    for (let i = 0; i < arms; i++) {
      const angle = (i / arms) * Math.PI * 2 + Math.PI / 4
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
      ctx.stroke()
    }
    ctx.restore()
  }

  function animate() {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(2, 5, 28, 0.3)'
    ctx.fillRect(0, 0, W, H)

    // 月（右上固定）
    drawMoonTopRight(ctx, W)

    // 静止星
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

    spawnCooldown--
    if (spawnCooldown <= 0) {
      const idle = shooters.find(s => !s.active)
      if (idle) {
        spawn(idle)
        spawnCooldown = 120 + Math.floor(Math.random() * 160)
      }
    }

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
      grad.addColorStop(0.2, `rgba(200, 225, 255, ${s.opacity * 0.65})`)
      grad.addColorStop(1, 'rgba(180, 210, 255, 0)')

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(tailX, tailY)
      ctx.strokeStyle = grad
      ctx.lineWidth = 2.8
      ctx.shadowBlur = 12
      ctx.shadowColor = 'rgba(180, 220, 255, 0.8)'
      ctx.stroke()

      // 明るい頭部
      ctx.beginPath()
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ffffff'
      ctx.fill()
      ctx.restore()

      // キラッとスパークル
      drawSparkle(s.x, s.y, s.opacity)

      if (s.life >= s.maxLife || s.x < -200 || s.y > H + 100) s.active = false
    })

    t++
    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── Sad: 曇り（雨なし・自然な雲・ゆっくり流れる） ───────────────────────────
function runSad(canvas: HTMLCanvasElement, isNight: boolean): () => void {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const W = canvas.width
  const H = canvas.height

  // 昼：明るめ水色グレー / 夜：柔らかな青みがかったグレー（どす黒くない）
  const cloudColor = isNight
    ? 'rgba(85, 100, 138, 0.88)'
    : 'rgba(172, 195, 218, 0.90)'
  const bgOverlay = isNight
    ? 'rgba(12, 18, 45, 0.30)'
    : 'rgba(165, 195, 220, 0.18)'

  type Cloud = { x: number; y: number; rx: number; ry: number; dirX: number; opacity: number }

  // 画面を覆うように雲を配置
  const clouds: Cloud[] = [
    makeCloud(W * 0.05,   H * 0.06,  270, 74, 0.12),
    makeCloud(W * 0.38,   H * 0.03,  310, 84, 0.10),
    makeCloud(W * 0.72,   H * 0.07,  280, 78, 0.14),
    makeCloud(-W * 0.05,  H * 0.17,  240, 68, 0.11),
    makeCloud(W * 0.52,   H * 0.16,  295, 80, 0.09),
    makeCloud(W * 0.84,   H * 0.18,  215, 62, 0.13),
    makeCloud(W * 0.24,   H * 0.24,  255, 70, 0.10),
  ]

  let rafId: number

  function animate() {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = bgOverlay
    ctx.fillRect(0, 0, W, H)

    clouds.forEach(c => {
      c.x += c.dirX * 0.12  // ゆっくり自然に流れる
      if (c.x - c.rx > W + 60) c.x = -c.rx * 2.5
      if (c.x + c.rx < -60) c.x = W + c.rx * 2.5
      drawSoftCloud(ctx, c.x, c.y, c.rx, c.ry, cloudColor, c.opacity)
    })

    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── Positive / Day: 雲がよけて太陽が現れる ──────────────────────────────────
function runPositiveDay(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const W = canvas.width
  const H = canvas.height

  // 太陽位置（右上固定）
  const SUN_X = W - 88
  const SUN_Y = 82

  type Cloud = { x: number; y: number; rx: number; ry: number; dirX: number; opacity: number }

  // 太陽を隠すように右上に配置し、両側に退く
  const clouds: Cloud[] = [
    makeCloud(SUN_X - 180, SUN_Y + 20, 260, 78, -1),
    makeCloud(SUN_X + 160, SUN_Y + 15, 280, 82,  1),
    makeCloud(SUN_X - 60,  SUN_Y + 80, 230, 65, -1),
    makeCloud(SUN_X + 40,  SUN_Y + 90, 200, 60,  1),
    makeCloud(W * 0.25,    H * 0.28,   220, 62, -1),
  ]

  let t = 0
  let rafId: number

  function animate() {
    ctx.clearRect(0, 0, W, H)

    // 暖かい空グラデーション
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, 'rgba(255, 230, 110, 0.20)')
    sky.addColorStop(0.4, 'rgba(255, 245, 200, 0.08)')
    sky.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    // 太陽（右上固定）
    drawSunTopRight(ctx, W, t)

    // 雲が左右に退く
    clouds.forEach(c => {
      c.x += c.dirX * 0.40
      drawSoftCloud(ctx, c.x, c.y, c.rx, c.ry, 'rgba(238, 246, 255, 1)', c.opacity)
    })

    t++
    rafId = requestAnimationFrame(animate)
  }

  rafId = requestAnimationFrame(animate)
  return () => cancelAnimationFrame(rafId)
}

// ─── Positive / Night: 雲がよけて月が現れる ──────────────────────────────────
function runPositiveNight(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const W = canvas.width
  const H = canvas.height

  // 月位置（右上固定・夜背景と同じ）
  const MOON_X = W - 88
  const MOON_Y = 82

  type Star = { x: number; y: number; size: number; opacity: number; phase: number }
  const stars: Star[] = Array.from({ length: 130 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.75,
    size: Math.random() * 1.5 + 0.3,
    opacity: Math.random() * 0.7 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }))

  type Cloud = { x: number; y: number; rx: number; ry: number; dirX: number; opacity: number }

  // 月を隠すように配置し、両側に退く
  const clouds: Cloud[] = [
    makeCloud(MOON_X - 185, MOON_Y + 18, 270, 82, -1),
    makeCloud(MOON_X + 155, MOON_Y + 12, 285, 86,  1),
    makeCloud(MOON_X - 55,  MOON_Y + 85, 225, 68, -1),
    makeCloud(MOON_X + 35,  MOON_Y + 92, 205, 62,  1),
  ]

  let t = 0
  let rafId: number

  function animate() {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(3, 7, 30, 0.32)'
    ctx.fillRect(0, 0, W, H)

    // 星
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

    // 月光ビーム
    const beamW = 85 + 30 * Math.sin(t * 0.012)
    const beamGrad = ctx.createLinearGradient(MOON_X, MOON_Y + 44, MOON_X, H)
    beamGrad.addColorStop(0, 'rgba(255, 248, 228, 0.12)')
    beamGrad.addColorStop(0.5, 'rgba(255, 242, 215, 0.05)')
    beamGrad.addColorStop(1, 'rgba(255, 240, 210, 0)')
    ctx.save()
    ctx.fillStyle = beamGrad
    ctx.beginPath()
    ctx.moveTo(MOON_X - beamW / 2, MOON_Y + 44)
    ctx.lineTo(MOON_X - beamW * 2.5, H)
    ctx.lineTo(MOON_X + beamW * 2.5, H)
    ctx.lineTo(MOON_X + beamW / 2, MOON_Y + 44)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // 月（右上固定）
    drawMoonTopRight(ctx, W)

    // 雲が左右に退く（夜の雲: 柔らかな青みがかったグレー）
    clouds.forEach(c => {
      c.x += c.dirX * 0.40
      drawSoftCloud(ctx, c.x, c.y, c.rx, c.ry, 'rgba(55, 68, 105, 0.88)', c.opacity)
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

export function DiaryCanvas({ mood }: DiaryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // 投稿作成時刻ではなく現在時刻で昼夜を判定
  const isNight = getTimeOfDay() === 'night'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !mood) return

    let cleanup: (() => void) | undefined

    function startEffect() {
      if (!canvas) return
      if (mood === 'happy') {
        cleanup = isNight ? runHappyNight(canvas) : runHappyDay(canvas)
      } else if (mood === 'sad') {
        cleanup = runSad(canvas, isNight)
      } else if (mood === 'positive') {
        cleanup = isNight ? runPositiveNight(canvas) : runPositiveDay(canvas)
      }
    }

    startEffect()

    const handleResize = () => {
      cleanup?.()
      startEffect()
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

// ─── Legacy exports (backward compat) ────────────────────────────────────────
export function MoodEffect({ mood: _ }: { mood: string | null }) { return null }
export function TimeBackground({ createdAt: _ }: { createdAt: string }) { return null }
