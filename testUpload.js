import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wxtnuxlzogcizssdjnio.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dG51eGx6b2djaXpzc2RqbmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MTI4NzQsImV4cCI6MjA4NTM4ODg3NH0.7n-3h9KQD7X9-uYE6fMHt7Pmfmdx3y5kZ7yo5AKdV94'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testUpload() {
    try {
        console.log('Authenticating offline-like behavior (anonymous / dummy)...')
        // We can't easily sign in with a real user without a password, but we can try to upload
        // and see if it throws RLS error or hangs

        console.log('Testing upload to documents bucket...')
        const dummyFile = new Blob(['Hello World!'], { type: 'text/plain' })
        // Attempting to upload to a path. It should fail RLS quickly.
        const { data, error } = await supabase.storage
            .from('documents')
            .upload('test_user/test_file.txt', dummyFile, {
                cacheControl: '3600',
                upsert: false
            })

        console.log('Upload completed:', { data, error })
    } catch (err) {
        console.error('Exception caught:', err)
    }
}

testUpload()
