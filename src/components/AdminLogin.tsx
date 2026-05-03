import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield } from 'lucide-react'
import { adminService } from '@/services/adminService'

interface AdminLoginProps {
  onLogin: () => void
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await adminService.login(email, password)
      onLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_28%),radial-gradient(circle_at_top_right,hsl(var(--accent)/0.08),transparent_24%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)/0.95))] dark:bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_28%),radial-gradient(circle_at_top_right,hsl(var(--accent)/0.08),transparent_24%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)/0.96))]" />
      <Card className="relative z-10 w-full max-w-md border-border/70 bg-card/85 backdrop-blur-xl shadow-2xl dark:bg-card/75 dark:border-white/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/15">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@zaymazone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm shadow-sm dark:bg-background/35">
            <h4 className="text-sm font-medium text-foreground mb-2">Demo Credentials:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>Email:</strong> admin@zaymazone.com</div>
              <div><strong>Password:</strong> admin123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}