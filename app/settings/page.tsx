"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Check, Loader2 } from "lucide-react"
import { getUserProfile, updateUserProfile } from "@/lib/supabase-actions"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const { user, loading: authLoading, signIn, signUp } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authName, setAuthName] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSubmitting, setAuthSubmitting] = useState(false)
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load user data on mount (only when authenticated)
  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const { data } = await getUserProfile()
        if (data) {
          setName(data.name || '')
          setEmail(data.email || '')
          
          const prefs = data.notification_preferences
          if (prefs) {
            setEmailNotifications(prefs.email ?? true)
            setPushNotifications(prefs.push ?? false)
            setMarketingEmails(prefs.marketing ?? true)
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [user])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSubmitting(true)
    
    try {
      if (authMode === 'login') {
        const { error } = await signIn(authEmail, authPassword)
        if (error) {
          setAuthError(error.message)
        }
      } else {
        if (!authName.trim()) {
          setAuthError('Name is required')
          setAuthSubmitting(false)
          return
        }
        const result = await signUp(authEmail, authPassword, authName)
        if (result.error) {
          setAuthError(result.error.message)
        } else if (result.message) {
          // Email confirmation required
          setAuthError(null)
          alert(`✅ ${result.message}`)
        } else {
          // Success - user is logged in
          console.log('Signup successful!')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setAuthError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    
    try {
      console.log('Attempting to save settings...')
      
      const { data, error: saveError } = await updateUserProfile({
        name,
        email,
        notification_preferences: {
          email: emailNotifications,
          push: pushNotifications,
          marketing: marketingEmails,
        },
      })
      
      if (saveError) {
        console.error('Save failed:', saveError)
        setError(`${saveError.message}${saveError.code ? ` (${saveError.code})` : ''}`)
        return
      }
      
      console.log('Save successful:', data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
      console.log("Avatar file selected:", file.name)
    }
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
    if (confirmed) {
      console.log("Account deletion requested")
      alert("Account deletion initiated. You will be contacted shortly.")
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "JD"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // Show login/signup form if not authenticated
  if (!user) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Sign in to manage your account settings
          </p>
        </div>

        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>
              {authMode === 'login'
                ? 'Sign in to access your settings'
                : 'Create an account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Full Name</Label>
                  <Input
                    id="auth-name"
                    type="text"
                    placeholder="John Doe"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {authError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {authError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={authSubmitting}>
                {authSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {authMode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Save Failed</h3>
                <p className="text-sm text-red-800 mt-1">
                  {error}
                </p>
                <p className="text-xs text-red-700 mt-2">
                  Check the browser console for more details. You may need to run the SQL scripts to set up the database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700 font-bold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">
                Click on the avatar to upload a new photo
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, GIF or PNG. Max size 2MB.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="focus-visible:ring-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="focus-visible:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="font-medium text-base cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                id="email-notifications"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-sm"></div>
            </label>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="font-medium text-base cursor-pointer">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                id="push-notifications"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-sm"></div>
            </label>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails" className="font-medium text-base cursor-pointer">
                Marketing Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                id="marketing-emails"
                checked={marketingEmails}
                onChange={(e) => setMarketingEmails(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-sm"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-destructive/5">
            <div>
              <h3 className="font-semibold text-base">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="md:min-w-[140px] shadow-sm hover:shadow-md transition-all"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving || saved}
          className="min-w-[140px] shadow-sm hover:shadow-md transition-all"
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
