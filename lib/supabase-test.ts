import { supabase } from './supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  console.log('-----------------------------------')
  
  // Test 1: Basic connection
  console.log('Test 1: Basic connection')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error)
      return false
    }
    console.log('✅ Connection successful')
  } catch (err) {
    console.error('❌ Connection error:', err)
    return false
  }
  
  // Test 2: Check if user-123 exists
  console.log('\nTest 2: Check if user-123 exists')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'user-123')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️  User user-123 does not exist')
        console.log('💡 Run supabase-test-user.sql to create the test user')
        return false
      }
      console.error('❌ Error fetching user:', error)
      return false
    }
    console.log('✅ User user-123 exists:', data)
  } catch (err) {
    console.error('❌ Error:', err)
    return false
  }
  
  // Test 3: Try to update user-123
  console.log('\nTest 3: Try to update user-123')
  try {
    const testName = `Test Update ${new Date().getTime()}`
    const { data, error } = await supabase
      .from('users')
      .update({ name: testName })
      .eq('id', 'user-123')
      .select()
    
    if (error) {
      console.error('❌ Update blocked:', error)
      if (error.code === '42501') {
        console.log('💡 This is an RLS policy issue. Run supabase-rls-policies.sql to fix.')
      } else {
        console.log('💡 Check browser console for error details')
      }
      return false
    }
    console.log('✅ Update successful:', data)
    console.log('-----------------------------------')
    console.log('✅ All tests passed! Settings save should work.')
    return true
  } catch (err) {
    console.error('❌ Update error:', err)
    return false
  }
}

