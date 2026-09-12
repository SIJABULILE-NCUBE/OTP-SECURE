// this file's only job is to set up the connection to supabase
// once it's set up, other files can just import "supabase" and use it

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// these come from the .env file, never write real keys directly in code
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// this creates the client we will use everywhere else to talk to the database
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
