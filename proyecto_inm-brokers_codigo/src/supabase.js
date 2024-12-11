// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VUE_APP_SUPABASE_URL;
const supabaseKey = process.env.VUE_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;