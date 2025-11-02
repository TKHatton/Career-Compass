'use client'

import { useEffect, useRef, useState } from 'react'

const COLORS = [
  '#000000', // Black
  '#8B7355', // Clay Rose (brand color)
  '#D4A59A', // Sand Rose (brand color)
  '#91B5A8', // Mist Teal (brand color)
  '#6B8E7F', // Sage Gray (brand color)
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85929E', // Gray
  '#FFFFFF', // White
]

const BRUSH_SIZES = [2, 4, 8, 12, 16, 24]

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(4)
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      // Save the current canvas content
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Resize
      canvas.width = container.clientWidth
      canvas.height = Math.min(600, window.innerHeight - 300)

      // Restore content
      ctx.putImageData(imageData, 0, 0)

      // Set white background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setShowClearConfirm(false)
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `mindless-moment-${new Date().toISOString().split('T')[0]}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <div className="space-y-4">
      {/* Tools */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-mist-teal">
        {/* Tool Selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTool('brush')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              tool === 'brush'
                ? 'bg-clay-rose text-white'
                : 'bg-mist-teal text-black hover:opacity-80'
            }`}
          >
            ✏️ Brush
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              tool === 'eraser'
                ? 'bg-clay-rose text-white'
                : 'bg-mist-teal text-black hover:opacity-80'
            }`}
          >
            🧹 Eraser
          </button>
        </div>

        {/* Color Palette */}
        <div className="mb-4">
          <label className="block text-sm text-sage-gray mb-2">Colors</label>
          <div className="grid grid-cols-7 gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c)
                  setTool('brush')
                }}
                className={`w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110 ${
                  color === c && tool === 'brush'
                    ? 'border-black scale-110'
                    : 'border-sage-gray'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div className="mb-4">
          <label className="block text-sm text-sage-gray mb-2">
            Brush Size: {brushSize}px
          </label>
          <div className="flex gap-2">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  brushSize === size
                    ? 'bg-clay-rose text-white'
                    : 'bg-sand-rose text-black hover:opacity-80'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={saveDrawing}
            className="flex-1 bg-mist-teal text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            💾 Save
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex-1 bg-sand-rose text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-mist-teal">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full border border-sage-gray rounded-lg cursor-crosshair touch-none"
          style={{ backgroundColor: '#FFFFFF' }}
        />
        <p className="text-xs text-sage-gray text-center mt-2">
          Take a mindful moment to draw, doodle, or just relax
        </p>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-black mb-4">
              Clear Canvas?
            </h3>
            <p className="text-sm text-sage-gray mb-6">
              This will erase your current drawing. Make sure you've saved it if you want to keep it!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-mist-teal text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={clearCanvas}
                className="flex-1 bg-clay-rose text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
