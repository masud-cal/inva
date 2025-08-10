import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wqveejyuoglyocazexep.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxdmVlanl1b2dseW9jYXpleGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTkwMjIsImV4cCI6MjA3MDM3NTAyMn0.APc7CJxhPfetG8laVR2lxco_7ByQiCyWBL7_w7MnYZI'

export const supabase = createClient(supabaseUrl, supabaseKey)