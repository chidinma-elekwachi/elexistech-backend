import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hzvndoqkvopyiyeszsuc.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dm5kb3Frdm9weWl5ZXN6c3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTA2MjMsImV4cCI6MjA3NDM4NjYyM30.R2QAv9yL-u4PO9_kdE7h4vgR6MwdvbjvYWVLAu-afak"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
