import { supabase } from './supabase'

export interface UserProfile {
  id: string
  name: string
  email: string
  status: string
  plan: string
  created_at: string
  stripe_customer_id?: string | null
  subscription_status?: string | null
  subscription_id?: string | null
  notification_preferences?: {
    email: boolean
    push: boolean
    marketing: boolean
  } | null
}

export interface UpdateUserData {
  name?: string
  email?: string
  notification_preferences?: {
    email: boolean
    push: boolean
    marketing: boolean
  }
}

export async function updateUserProfile(data: UpdateUserData) {
  console.log('Updating user profile:', { data })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const error = { message: 'Not authenticated', code: 'NO_AUTH' }
    console.error('Supabase update error:', error)
    return { data: null, error }
  }
  
  const { data: updated, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...data,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase update error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
  } else {
    console.log('Update successful:', updated)
  }

  return { data: updated as UserProfile | null, error }
}

export async function getUserProfile() {
  console.log('Fetching authenticated user profile')
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const error = { message: 'Not authenticated', code: 'NO_AUTH' }
    console.error('Supabase fetch error:', error)
    return { data: null, error }
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Supabase fetch error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
  } else {
    console.log('Fetch successful:', data)
  }

  return { data: data as UserProfile | null, error }
}

export async function updateSubscriptionStatus(
  userId: string, 
  subscriptionStatus: string,
  subscriptionId?: string
) {
  const updateData: any = { 
    subscription_status: subscriptionStatus,
    plan: subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)
  }
  
  if (subscriptionId) {
    updateData.subscription_id = subscriptionId
  }

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()

  return { data: data as UserProfile | null, error }
}

