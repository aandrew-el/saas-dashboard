"use client"

import { createContext, useContext, ReactNode } from "react"

interface UserContextType {
  userId: string
}

const UserContext = createContext<UserContextType>({ userId: 'user-123' })

export function UserProvider({ children }: { children: ReactNode }) {
  // For now, hardcode userId. In production, implement proper authentication
  // with NextAuth.js, Supabase Auth, or similar
  const userId = 'user-123'
  
  return (
    <UserContext.Provider value={{ userId }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

