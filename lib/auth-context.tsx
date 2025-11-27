"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; message?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    console.log('🔐 Starting signup process...')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/settings` : undefined
      }
    })
    
    if (error) {
      console.error('❌ Auth signup error:', error)
      return { error }
    }
    
    if (!data.user) {
      console.error('❌ No user returned from signup')
      return { error: { message: 'Signup failed - no user returned' } }
    }
    
    console.log('✅ Auth user created:', data.user.id)
    
    // Create profile if signup successful
    if (data.user) {
      console.log('Creating profile for user:', data.user.id)
      
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        notification_preferences: {
          email: true,
          push: false,
          marketing: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      
      if (profileError) {
        console.error('❌ Profile creation error:', profileError)
        // Don't return error here - auth already succeeded
        // User can still use the app, profile can be created later
      } else {
        console.log('✅ Profile created successfully')
      }
    }
    
    // Check if email confirmation is required
    if (data.session) {
      console.log('✅ User logged in immediately (no email confirmation required)')
    } else if (data.user && !data.session) {
      console.log('📧 Email confirmation required')
      return { 
        error: null, 
        message: 'Please check your email to confirm your account'
      }
    }
    
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

