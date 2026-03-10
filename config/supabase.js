const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get credentials from .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Validate credentials
if (!supabaseUrl || !supabaseSecretKey) {
    console.error('❌ Missing Supabase credentials!');
    console.error('   Required in .env:');
    console.error('   - SUPABASE_URL');
    console.error('   - SUPABASE_SECRET_KEY');
    process.exit(1);
}

// Create Supabase client with service role key
// This bypasses Row Level Security (RLS) for backend operations
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});

// Test connection function
const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        // PGRST116 = table doesn't exist yet (ok during initial setup)
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        console.log('✅ Supabase connected successfully');
        console.log(`   URL: ${supabaseUrl}`);
        console.log(`   Database: PostgreSQL (Supabase)`);
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        console.error('   Check your .env file credentials');
        return false;
    }
};

module.exports = { supabase, testConnection };