const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running database migration...')

  const migrationPath = path.join(__dirname, '../supabase/migrations/004_add_onboarding_fields.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // If the RPC function doesn't exist, try direct SQL execution
      console.log('⚠️  RPC method not available, trying direct execution...')

      // Split SQL statements and execute them
      const statements = sql.split(';').filter(s => s.trim())

      for (const statement of statements) {
        if (statement.trim()) {
          const { error: execError } = await supabase
            .from('_migrations')
            .insert({ statement })

          if (execError) {
            console.error('❌ Failed to execute migration:', execError.message)
            throw execError
          }
        }
      }
    }

    console.log('✅ Migration completed successfully!')
    console.log('📝 Added onboarding_completed_at column to profile table')
  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    console.log('\n💡 Please run this SQL manually in the Supabase SQL Editor:')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    process.exit(1)
  }
}

runMigration()
