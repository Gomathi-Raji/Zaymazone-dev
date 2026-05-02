import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  isVerified: boolean;
  variant?: 'default' | 'compact' | 'icon-only';
  showIcon?: boolean;
  className?: string;
}

export function VerificationBadge({ 
  isVerified, 
  variant = 'default',
  showIcon = true,
  className 
}: VerificationBadgeProps) {
  if (!isVerified) return null;

  if (variant === 'icon-only') {
    return (
      <div className={cn("inline-flex items-center", className)} title="Verified Artisan">
        <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-500" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge className={cn("bg-blue-500 text-white border-blue-600 gap-1", className)}>
        {showIcon && <CheckCircle className="w-3 h-3 fill-white" />}
        Verified
      </Badge>
    );
  }

  return (
    <Badge className={cn("bg-blue-500 text-white border-blue-600 gap-1.5 px-3 py-1", className)}>
      {showIcon && <Shield className="w-3.5 h-3.5" />}
      <CheckCircle className="w-3.5 h-3.5 fill-white" />
      <span className="font-medium">Verified Artisan</span>
    </Badge>
  );
}
