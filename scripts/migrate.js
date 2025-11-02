const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Supabase connection details
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const DATABASE_URL = 'postgresql://postgres.kwtjbaawngjpumggjttd:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres'

async function runMigration() {
  console.log('🚀 Running database migration...\n')

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/011_avatars_bucket.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('📄 Migration SQL:')
  console.log('─'.repeat(60))
  console.log(sql)
  console.log('─'.repeat(60))
  console.log()

  // Check if DATABASE_URL is configured
  if (DATABASE_URL.includes('[YOUR-PASSWORD]')) {
    console.log('⚠️  Database password not configured!')
    console.log()
    console.log('📝 To run this migration, you have two options:\n')
    console.log('Option 1: Use Supabase Dashboard (Recommended)')
    console.log('  1. Go to: https://supabase.com/dashboard/project/kwtjbaawngjpumggjttd/sql/new')
    console.log('  2. Paste the SQL shown above')
    console.log('  3. Click "Run"\n')
    console.log('Option 2: Use this script with your DB password')
    console.log('  1. Get your database password from Supabase Dashboard → Settings → Database')
    console.log('  2. Update the DATABASE_URL in this script')
    console.log('  3. Run: node scripts/migrate.js\n')
    return
  }

  const client = new Client({
    connectionString: DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    await client.query(sql)
    console.log('✅ Migration completed successfully!')
    console.log('📝 Created avatars storage bucket with RLS policies')
  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    console.log('\n💡 Please run this SQL manually in the Supabase SQL Editor')
  } finally {
    await client.end()
  }
}

runMigration()
