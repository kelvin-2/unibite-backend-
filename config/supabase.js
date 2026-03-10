const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    console.error('❌ Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});

const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        
        if (error && error.code !== 'PGRST116') throw error;
        
        console.log('✅ Supabase connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return false;
    }
};

module.exports = { supabase, testConnection };