import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        realtime: {
          transport: WebSocket
        }
      })
    : null;
