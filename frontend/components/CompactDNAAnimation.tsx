'use client'

import { useEffect, useRef } from 'react'

export function CompactDNAAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return

    const ctx = c.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!c) return
      c.width = c.offsetWidth
      c.height = c.offsetHeight
    }

    resize()
    window.addEventListener('resize', resize)

    let t = 0

    function draw() {
      if (!c || !ctx) return
      const W = c.width
      const H = c.height

      ctx.clearRect(0, 0, W, H)

      const PAIRS = 22
      const stepX = W / PAIRS
      const amp = H * 0.28
      const midY = H * 0.5

      // Glow gradient backdrop
      const grd = ctx.createLinearGradient(W * 0.4, 0, W, H)
      grd.addColorStop(0, 'rgba(0,207,255,0)')
      grd.addColorStop(0.5, 'rgba(0,207,255,0.03)')
      grd.addColorStop(1, 'rgba(0,207,255,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, H)

      // Draw rungs
      for (let i = 0; i < PAIRS; i++) {
        const x = i * stepX + stepX / 2
        const y1 = midY + Math.sin((i / PAIRS) * Math.PI * 2 - t) * amp
        const y2 = midY - Math.sin((i / PAIRS) * Math.PI * 2 - t) * amp

        const bases = 'ATGCATGCGCATTAGCGG'
        const base = bases[i % bases.length]
        const cols: Record<string, string> = {
          A: 'rgba(79,142,247,',
          T: 'rgba(247,111,79,',
          G: 'rgba(0,212,170,',
          C: 'rgba(199,125,255,',
        }
        const col = cols[base] || 'rgba(100,160,200,'

        ctx.beginPath()
        ctx.moveTo(x, y1)
        ctx.lineTo(x, y2)
        ctx.strokeStyle = col + '0.35)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // nodes
        ;[y1, y2].forEach((y) => {
          ctx.beginPath()
          ctx.arc(x, y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = col + '0.7)'
          ctx.fill()
        })
      }

      // Strand 1 (top)
      ctx.beginPath()
      for (let i = 0; i <= PAIRS; i++) {
        const x = i * stepX + stepX / 2
        const y = midY + Math.sin((i / PAIRS) * Math.PI * 2 - t) * amp
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(0,207,255,0.6)'
      ctx.lineWidth = 2
      ctx.shadowColor = '#00cfff'
      ctx.shadowBlur = 8
      ctx.stroke()

      // Strand 2 (bottom)
      ctx.beginPath()
      for (let i = 0; i <= PAIRS; i++) {
        const x = i * stepX + stepX / 2
        const y = midY - Math.sin((i / PAIRS) * Math.PI * 2 - t) * amp
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(0,255,190,0.5)'
      ctx.lineWidth = 2
      ctx.shadowColor = '#00ffbe'
      ctx.shadowBlur = 8
      ctx.stroke()

      ctx.shadowBlur = 0

      t += 0.012
      requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: '#0a0f1a',
      }}
    />
  )
}
