// components/AnimatedLogo.tsx
import { Car, Wrench } from 'lucide-react'

export function AnimatedLogo() {
  return (
    <div className="relative w-14 h-14">
      <Car className="w-10 h-10 text-white animate-pulse absolute inset-0 m-auto" />
      <Wrench className="w-6 h-6 text-yellow-300 animate-spin-slow absolute top-0 right-0" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
    </div>
  )
}

export default AnimatedLogo;