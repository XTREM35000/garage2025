// components/AnimatedLogo.tsx
import { Car, Wrench, LucideIcon } from 'lucide-react'

interface AnimatedLogoProps {
  mainIcon?: LucideIcon;
  secondaryIcon?: LucideIcon;
  mainColor?: string;
  secondaryColor?: string;
}

export function AnimatedLogo({
  mainIcon: MainIcon = Car,
  secondaryIcon: SecondaryIcon = Wrench,
  mainColor = "text-white",
  secondaryColor = "text-yellow-300"
}: AnimatedLogoProps) {
  return (
    <div className="relative w-14 h-14">
      <MainIcon className={`w-10 h-10 ${mainColor} animate-pulse absolute inset-0 m-auto`} />
      <SecondaryIcon className={`w-6 h-6 ${secondaryColor} animate-spin-slow absolute top-0 right-0`} />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
    </div>
  )
}

export default AnimatedLogo;