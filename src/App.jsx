import React, { useEffect, useRef, useState } from 'react'
import { Download, Square, Circle, ImageIcon, Copy, Palette, Layers, RefreshCw, Cog, Sun, Moon } from 'lucide-react'

export default function App() {
  const [initials, setInitials] = useState('JD')
  const [size, setSize] = useState(256)
  const [fontSize, setFontSize] = useState(0.5)
  const [bgColor, setBgColor] = useState('#7c3aed')
  const [textColor, setTextColor] = useState('#ffffff')
  const [shape, setShape] = useState('round')
  const [fontFamily, setFontFamily] = useState('Lato')
  const fontWeight = 600
  const [gradient, setGradient] = useState(false)
  const [gradColor2, setGradColor2] = useState('#0ea5a4')
  const [gradAngle, setGradAngle] = useState(45)
  const [textOffsetY, setTextOffsetY] = useState(0)

  const [toast, setToast] = useState(null)

  const palettes = [
    { name: 'Verde-azulado', bg: '#0ea5a4', text: '#ffffff' },
    { name: 'Roxo', bg: '#7c3aed', text: '#fff' },
    { name: 'Âmbar', bg: '#f59e0b', text: '#111827' },
    { name: 'Ardósia', bg: '#64748b', text: '#fff' },
    { name: 'Rosa', bg: '#ec4899', text: '#fff' },
  ]

  const [customPalettes, setCustomPalettes] = useState(() => {
    try {
      const raw = localStorage.getItem('avatar:palettes')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('avatar:palettes', JSON.stringify(customPalettes))
    } catch (e) {
    }
  }, [customPalettes])

  function addCustomPalette() {
    const name = prompt('Nome da paleta (ex: Meu Tema)') || `Paleta ${customPalettes.length + 1}`
    const p = { name, bg: bgColor, text: textColor }
    setCustomPalettes((s) => [p, ...s])
    showToast('Paleta salva')
  }

  function removeCustomPalette(idx) {
    setCustomPalettes((s) => s.filter((_, i) => i !== idx))
    showToast('Paleta removida')
  }

  const canvasRef = useRef(null)
  const [canCopyPNG, setCanCopyPNG] = useState(false)
  const [canCopySVG, setCanCopySVG] = useState(true)
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem('avatar:theme')
      if (v) return v === 'dark'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    if (fontFamily && fontFamily !== 'Inter') {
      ensureFontLoaded(fontFamily, fontWeight).then(() => draw())
    } else {
      draw()
    }
   }, [initials, size, fontSize, bgColor, textColor, shape, textOffsetY])

  useEffect(() => {
    try {
      setCanCopyPNG(!!navigator.clipboard && typeof ClipboardItem !== 'undefined')
    } catch (e) {
      setCanCopyPNG(false)
    }
    setCanCopySVG(!!navigator.clipboard)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('avatar:theme', dark ? 'dark' : 'light')
    } catch (e) {}
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  useEffect(() => {
    if (fontFamily && fontFamily !== 'Inter') {
      ensureFontLoaded(fontFamily, fontWeight).then(() => draw())
    } else {
      draw()
    }
   }, [fontFamily])

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradient, gradColor2, gradAngle])

  function ensureFontLoaded(family, weight = 400) {
    return new Promise((resolve) => {
      if (family === 'Inter') return resolve()
      // Build Google Fonts link id
      const id = `gf-${family.replace(/\s+/g, '-')}-${weight}`
      if (!document.getElementById(id)) {
        const link = document.createElement('link')
        link.id = id
        link.rel = 'stylesheet'
        const familyQuery = family.replace(/\s+/g, '+')
        link.href = `https://fonts.googleapis.com/css2?family=${familyQuery}:wght@400;600&display=swap`
        document.head.appendChild(link)
      }
      // Use FontFaceSet to ensure the font is usable in canvas
      try {
        document.fonts.load(`${weight} 16px '${family}'`).then(() => resolve()).catch(() => resolve())
      } catch (e) {
        resolve()
      }
    })
  }

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const px = size
    canvas.width = px * dpr
    canvas.height = px * dpr
    canvas.style.width = px + 'px'
    canvas.style.height = px + 'px'

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, px, px)

    if (gradient) {
      const angleRad = (gradAngle * Math.PI) / 180
      const cx = px / 2
      const cy = px / 2
      const vx = Math.cos(angleRad)
      const vy = Math.sin(angleRad)
      const x0 = cx - vx * px / 2
      const y0 = cy - vy * px / 2
      const x1 = cx + vx * px / 2
      const y1 = cy + vy * px / 2
      const lg = ctx.createLinearGradient(x0, y0, x1, y1)
      lg.addColorStop(0, bgColor)
      lg.addColorStop(1, gradColor2)
      ctx.fillStyle = lg
    } else {
      ctx.fillStyle = bgColor
    }

    if (shape === 'round') {
      ctx.beginPath()
      ctx.arc(px / 2, px / 2, px / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, px, px)
    }

    const txt = (initials || '').trim().toUpperCase().slice(0, 7)
    const computedFont = Math.floor(px * fontSize)
    ctx.fillStyle = textColor

    ctx.font = `${fontWeight} ${computedFont}px '${fontFamily}', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    const y = px / 2 + textOffsetY
    ctx.fillText(txt, px / 2, y)
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `avatar-${initials || 'avatar'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function generateSVGString() {
    const px = size
    const txt = (initials || '').trim().toUpperCase().slice(0, 7)
    const fontPx = Math.floor(px * fontSize)
    const radius = shape === 'round' ? px / 2 : 0

    const shadowFilter = ''

    let bgShape = ''
    let gradDefs = ''
    if (gradient) {
      const angleRad = (gradAngle * Math.PI) / 180
      const vx = Math.cos(angleRad)
      const vy = Math.sin(angleRad)
      const x1 = 50 + vx * 50
      const y1 = 50 + vy * 50
      const x0 = 50 - vx * 50
      const y0 = 50 - vy * 50
      gradDefs = `\n    <linearGradient id="g1" x1="${x0}%" y1="${y0}%" x2="${x1}%" y2="${y1}%">\n      <stop offset="0%" stop-color="${bgColor}"/>\n      <stop offset="100%" stop-color="${gradColor2}"/>\n    </linearGradient>`
      if (shape === 'round') {
        bgShape = `<circle cx="${px/2}" cy="${px/2}" r="${px/2}" fill="url(#g1)" />`
      } else {
        bgShape = `<rect x="0" y="0" width="${px}" height="${px}" rx="4" fill="url(#g1)"/>`
      }
    } else {
      if (shape === 'round') {
        bgShape = `<circle cx="${px/2}" cy="${px/2}" r="${px/2}" fill="${bgColor}" />`
      } else {
        bgShape = `<rect x="0" y="0" width="${px}" height="${px}" rx="4" fill="${bgColor}"/>`
      }
    }

    const borderElem = ''

    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${px}' height='${px}' viewBox='0 0 ${px} ${px}'>\n  <defs>${shadowFilter}${gradDefs}\n  </defs>\n  ${bgShape}\n  ${borderElem}\n  <text x='50%' y='calc(50% + ${textOffsetY}px)' text-anchor='middle' dominant-baseline='middle' fill='${textColor}' font-family="${fontFamily}, system-ui, Arial" font-weight='${fontWeight}' font-size='${fontPx}px'>${txt}</text>\n</svg>`
    return svg
  }

  function showToast(msg, type = 'success', timeout = 2000) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), timeout)
  }

  async function copyPNG() {
    const canvas = canvasRef.current
    if (!canvas) return showToast('Canvas não disponível', 'error')
    try {
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
      if (!blob) throw new Error('Falha ao gerar blob')

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      showToast('PNG copiado para clipboard')
    } catch (e) {
      console.error(e)
      showToast('Falha ao copiar PNG', 'error')
    }
  }

  async function copySVG() {
    try {
      const svg = generateSVGString()
      await navigator.clipboard.writeText(svg)
      showToast('SVG copiado para clipboard')
    } catch (e) {
      console.error(e)
      showToast('Falha ao copiar SVG', 'error')
    }
  }

  function downloadSVG() {
    const svgStr = generateSVGString()
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `avatar-${initials || 'avatar'}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold">Gerador de Avatar com Letras</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Digite as letras, escolha formato, tamanho da fonte e cor e faça o download.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setDark(!dark)} title={dark ? 'Ativar claro' : 'Ativar escuro'} className="w-8 h-8 border rounded-full flex items-center justify-center border-slate-300  hover:bg-slate-100 dark:hover:bg-slate-700">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-64 h-64 flex items-center justify-center bg-white dark:bg-slate-700 rounded-md overflow-hidden">
                <canvas ref={canvasRef} className={`shadow-lg transition-transform duration-150 ${shape === 'round' ? 'rounded-full' : 'rounded-sm'}`} />
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 gap-4">
                <section className="appearance-section p-4 border rounded-md bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700">
                   <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-100"><Layers size={16}/> Aparência</h3>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600">Cor de Fundo</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-10 p-0 border-0" />
                        <div className="flex gap-2 items-center">
                          <div className="flex gap-2">
                            {palettes.map((p) => (
                               <button key={p.name} title={p.name} onClick={() => { setBgColor(p.bg); setTextColor(p.text); }} className="w-8 h-8 rounded shadow-sm border" style={{ background: p.bg }} />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            {customPalettes.map((p, i) => (
                              <div key={`${p.name}-${i}`} className="relative">
                                 <button title={p.name} onClick={() => { setBgColor(p.bg); setTextColor(p.text); }} className="w-8 h-8 rounded shadow-sm border" style={{ background: p.bg }} />
                                <button onClick={() => removeCustomPalette(i)} title="Remover" className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 text-xs border">×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                         <label className="block text-xs text-slate-600 dark:text-slate-300">Gradiente</label>
                         <div className="flex items-center gap-2 mt-1">
                            <input type="checkbox" checked={gradient} onChange={(e) => setGradient(e.target.checked)} />
                            <input type="color" value={gradColor2} onChange={(e) => setGradColor2(e.target.value)} className="w-12 h-10 p-0 border-0" />
                          </div>
                            {gradient && (
                             <div className="mt-2 flex items-center gap-2">
                                 <input className="flex-1" type="range" min={0} max={360} value={gradAngle} onChange={(e) => setGradAngle(Number(e.target.value))} />
                                 <span className="inline-block text-xs text-slate-500 dark:text-slate-300" style={{ transform: `rotate(${gradAngle}deg)` }}>→</span>
                                 <span className="text-xs text-slate-500 dark:text-slate-300">{gradAngle}°</span>
                             </div>
                           )}
                        </div>
                       </div>
                    </div>


                </section>

                <section className="p-4 border rounded-md bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700">
                   <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-100"><Palette size={16}/> Texto / Conteúdo</h3>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-300">Letras</label>
                       <input value={initials} onChange={(e) => setInitials(e.target.value)} placeholder="ABCDEFG" className="mt-1 p-2 border border-slate-300  rounded-md w-full bg-white dark:bg-slate-800 dark:text-white" maxLength={7} />

                      <div className="mt-3">
                        <label className="block text-xs text-slate-600 dark:text-slate-300">Fonte</label>
                        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="mt-1 p-2 border border-slate-300 rounded-md w-full bg-white dark:bg-slate-800 dark:text-white">
                          <option>Inter</option>
                          <option>Roboto</option>
                          <option>Montserrat</option>
                          <option>Nunito</option>
                          <option>Poppins</option>
                          <option>Lato</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-300">Tamanho</label>
                       <div className="mt-1">
                         <input className="w-full" type="range" min={64} max={1024} value={size} onChange={(e) => setSize(Number(e.target.value))} />
                         <div className="text-xs text-slate-500 dark:text-slate-300 mt-1">{size}px</div>
                       </div>

                      <div className="mt-3">
                        <label className="block text-xs text-slate-600 dark:text-slate-300">Tamanho da Fonte</label>
                        <div className="mt-1">
                          <input className="w-full" type="range" min={0.2} max={0.9} step={0.01} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                          <div className="text-xs text-slate-500 dark:text-slate-300 mt-1">{Math.round(fontSize * 100)}% do avatar</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs text-slate-600 dark:text-slate-300">Ajuste Vertical (px)</label>
                        <div className="mt-1">
                          <input className="w-full" type="range" min={-50} max={50} value={textOffsetY} onChange={(e) => setTextOffsetY(Number(e.target.value))} />
                          <div className="text-xs text-slate-500 dark:text-slate-300 mt-1">{textOffsetY}px</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setShape('square')} className={`px-3 py-2 border border-slate-300 rounded-md flex items-center gap-2 text-slate-700 dark:text-slate-200 ${shape === 'square' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}><Square size={14}/> Quadrado</button>
                    <button onClick={() => setShape('round')} className={`px-3 py-2 border border-slate-300 rounded-md flex items-center gap-2 text-slate-700 dark:text-slate-200 ${shape === 'round' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}><Circle size={14}/> Redondo</button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="p-4 border rounded-md bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700">
             <h3 className="font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100"><Download size={16}/> Exportar</h3>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={handleDownload} className="flex-1 flex items-center gap-2 justify-center px-3 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"><Download size={14}/> Baixar PNG</button>
                <button onClick={downloadSVG} className="flex-1 flex items-center gap-2 justify-center px-3 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"><ImageIcon size={14}/> Baixar SVG</button>
              </div>
              <div className="flex gap-2">
                <button onClick={copyPNG} disabled={!canCopyPNG} className={`flex-1 flex items-center gap-2 justify-center px-3 py-2 border rounded-md border-slate-300 dark:hover:bg-slate-700  ${!canCopyPNG ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}><Copy size={14}/> Copiar PNG</button>
                <button onClick={copySVG} className="flex-1 flex items-center gap-2 justify-center px-3 py-2 border rounded-md border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"><Copy size={14}/> Copiar SVG</button>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-md bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700">
             <h3 className="font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100"><Layers size={16}/> Tamanhos Rápidos</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[64, 128, 256, 512, 1024].map((p) => (
                 <button key={p} onClick={() => setSize(p)} className={`px-3 py-2 border border-slate-300 rounded ${size === p ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{p}px</button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button onClick={() => { setInitials('JD'); setBgColor('#7c3aed'); setTextColor('#ffffff'); setFontSize(0.5); setFontFamily('Lato'); setGradient(false); setGradColor2('#0369a1'); setGradAngle(45); showToast('Reiniciar'); }} className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-slate-300  rounded-md hover:bg-red-300 dark:hover:bg-red-700"><RefreshCw size={14}/> Reiniciar</button>
          </div>


          {toast && (
            <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow">{toast.msg}</div>
          )}

        </aside>

        <div className="fixed bottom-2 right-4 text-xs text-slate-500">
          coded by opencode / copilot / big pickle
        </div>
      </div>
    </div>
  )
}
