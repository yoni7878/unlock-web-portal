import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xzcrqnufqbvbprtjxzqp.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y3JxbnVmcWJ2YnBydGp4enFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NTI1MDYsImV4cCI6MjA1MDEyODUwNn0.wNz8Hs1KZ8Vsx-2M9Vr0CQsUV6_FaaMp8LGlE-mGYvo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)