'use client'
import { getTableLink } from '@/lib/utils'
import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'
export default function QRCodeTable({
  token,
  tableNumber,
  width = 250
}: {
  token: string
  tableNumber: number
  width?: number
}) {
  // canvas thật
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = width
      canvas.height = width + 70
      const canvasContext = canvas.getContext('2d')!
      canvasContext.fillStyle = '#fff'
      canvasContext.fillRect(0, 0, canvas.width, canvas.height)
      canvasContext.font = '17px Arial'
      canvasContext.textAlign = 'center'
      canvasContext.fillStyle = '#000'
      canvasContext.fillText(`Bàn số ${tableNumber}`, width / 2, width + 20)
      canvasContext.fillStyle = '#000'
      canvasContext.fillText(`Quét mã QR để gọi món`, width / 2, width + 50)

      const virtualCanvas = document.createElement('canvas')
      QRCode.toCanvas(virtualCanvas, getTableLink({ token, tableNumber }), function (error) {
        if (error) console.error(error)
        canvasContext.drawImage(virtualCanvas, 0, 0, width, width)
      })
    }
  }, [token, tableNumber, width])
  return <canvas ref={canvasRef} />
}
