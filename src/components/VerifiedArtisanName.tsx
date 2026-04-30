import { VerificationBadge } from '@/components/VerificationBadge'
import { cn } from '@/lib/utils'

interface VerifiedArtisanNameProps {
  name: string
  isVerified?: boolean
  className?: string
  nameClassName?: string
}

export function VerifiedArtisanName({
  name,
  isVerified = false,
  className,
  nameClassName,
}: VerifiedArtisanNameProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={nameClassName}>{name}</span>
      {isVerified && <VerificationBadge isVerified variant="icon-only" className="shrink-0" />}
    </span>
  )
}