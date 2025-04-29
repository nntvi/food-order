import Image from 'next/image'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MenuOrder from '@/app/guest/menu/menu-order'

// fake data
const dishes = [
  {
    id: 1,
    name: 'Pizza hải sản',
    description: 'Pizza hải sản ngon nhất thế giới',
    price: 100000,
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 2,
    name: 'Pizza thịt bò',
    description: 'Pizza thịt bò ngon nhất thế giới',
    price: 150000,
    image: 'https://via.placeholder.com/150'
  }
]
export default async function MenuPage() {
  return (
    <div className='max-w-[400px] mx-auto space-y-4'>
      <h1 className='text-center text-xl font-bold'>🍕 Menu quán</h1>
      <MenuOrder />
    </div>
  )
}
