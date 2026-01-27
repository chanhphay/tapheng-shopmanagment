import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') })

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_KEY

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? '✓ Found' : '✗ Not found')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('\n📡 Test 1: Testing basic connection...')
    const { data, error } = await supabase.from('_test_').select('*').limit(1)
    
    if (error && error.code !== 'PGRST204') {
      // PGRST204 means table doesn't exist, which is fine
      if (error.code === '42P01') {
        console.log('✓ Connection successful (table not found is expected)')
      } else {
        console.log('⚠ Connection response:', error.message)
      }
    } else {
      console.log('✓ Connection successful')
    }

    // Test 2: List tables (if we have permissions)
    console.log('\n📊 Test 2: Checking database access...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('⚠ Cannot list tables (might need elevated permissions)')
    } else if (tables) {
      console.log(`✓ Found ${tables.length} tables in database`)
      if (tables.length > 0) {
        console.log('Tables:', tables.map(t => t.table_name).join(', '))
      }
    }

    // Test 3: Auth service
    console.log('\n🔐 Test 3: Testing auth service...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log('⚠ Auth service check:', authError.message)
    } else {
      console.log('✓ Auth service is accessible')
    }

    console.log('\n✅ Supabase connection test completed!')
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message)
    process.exit(1)
  }
}

testConnection()
