'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        if (!open) router.back()
      }}
    >
      <DialogContent className='max-w-2xl w-[90vw] max-h-[90vh] overflow-hidden p-0 bg-background border-0 shadow-2xl'>
        <DialogTitle asChild>
          <VisuallyHidden>Chi tiết món ăn</VisuallyHidden>
        </DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
}
