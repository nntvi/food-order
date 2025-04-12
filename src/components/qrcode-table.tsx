'use client'
import { getTableLink } from '@/lib/utils'
import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'
export default function QRCodeTable({
  token,
  tableNumber,
  width = 150
}: {
  token: string
  tableNumber: number
  width?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, getTableLink({ token, tableNumber }), { width }, function (error) {
        if (error) console.error(error)
        console.log('success!')
      })
    }
  }, [token, tableNumber, width])
  return <canvas ref={canvasRef} />
}
