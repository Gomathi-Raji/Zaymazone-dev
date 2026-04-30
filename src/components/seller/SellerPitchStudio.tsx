import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, Copy, Share2, Megaphone, ArrowRight, CheckCircle } from 'lucide-react'

interface SellerPitchStudioProps {
  onGoToProducts: () => void
  onGoToOrders: () => void
}

const DEFAULT_PITCH = {
  productName: '',
  audience: 'premium buyers who value handmade craftsmanship',
  keyBenefit: 'handmade with authentic artisan detail',
  offer: 'limited-time launch offer',
  tone: 'confident and warm',
  callToAction: 'Order now while stock lasts'
}

export function SellerPitchStudio({ onGoToProducts, onGoToOrders }: SellerPitchStudioProps) {
  const [form, setForm] = useState(DEFAULT_PITCH)
  const [customNote, setCustomNote] = useState('')
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(timer)
  }, [copied])

  const pitch = useMemo(() => {
    const product = form.productName.trim() || 'this collection'

    return [
      `Introducing ${product} for ${form.audience}.`,
      `It is ${form.keyBenefit}, designed in a ${form.tone} way that helps your catalog stand out.`,
      form.offer ? `Current offer: ${form.offer}.` : '',
      customNote.trim() ? customNote.trim() : '',
      `${form.callToAction}.`
    ]
      .filter(Boolean)
      .join(' ')
  }, [form, customNote])

  const copyPitch = async () => {
    try {
      await navigator.clipboard.writeText(pitch)
      setCopied(true)
      toast({ title: 'Pitch copied', description: 'You can paste it into chat, email, or a sales page.' })
    } catch {
      toast({ title: 'Copy failed', description: 'Clipboard access was not available.', variant: 'destructive' })
    }
  }

  const sharePitch = () => {
    const text = encodeURIComponent(pitch)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-background to-muted/40">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Seller Pitch Studio
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                ready to share
              </Badge>
            </CardTitle>
            <CardDescription>
              Create a sales pitch for customers, marketplaces, or direct outreach, then move into fulfillment.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Product or collection</label>
              <Input
                value={form.productName}
                onChange={(e) => setForm(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Example: Handwoven Silk Scarves"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Audience</label>
              <Input
                value={form.audience}
                onChange={(e) => setForm(prev => ({ ...prev, audience: e.target.value }))}
                placeholder="Who should buy this?"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Key benefit</label>
              <Input
                value={form.keyBenefit}
                onChange={(e) => setForm(prev => ({ ...prev, keyBenefit: e.target.value }))}
                placeholder="What makes it desirable?"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Offer</label>
              <Input
                value={form.offer}
                onChange={(e) => setForm(prev => ({ ...prev, offer: e.target.value }))}
                placeholder="Limited-time bundle, discount, free shipping..."
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Extra note</label>
            <Textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Add a short story, material detail, or urgency line."
              className="min-h-24"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Tone</label>
              <Input
                value={form.tone}
                onChange={(e) => setForm(prev => ({ ...prev, tone: e.target.value }))}
                placeholder="confident, warm, premium..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Call to action</label>
              <Input
                value={form.callToAction}
                onChange={(e) => setForm(prev => ({ ...prev, callToAction: e.target.value }))}
                placeholder="Order now, request a sample, book a call..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={copyPitch} className="gap-2">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy pitch'}
            </Button>
            <Button variant="outline" onClick={sharePitch} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share pitch
            </Button>
            <Button variant="ghost" onClick={onGoToProducts} className="gap-2">
              Manage products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-primary/20 bg-background/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>Pitch text you can send directly to buyers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{pitch}</p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Selling flow
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>1. Build a pitch that matches the product.</p>
                <p>2. Share it with prospects or marketplaces.</p>
                <p>3. Convert the order and complete fulfillment.</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={onGoToOrders}>Go to orders</Button>
                <Button size="sm" variant="outline" onClick={onGoToProducts}>Open products</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
