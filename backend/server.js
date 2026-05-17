import express from 'express';
import cors from 'cors';
import { supabase } from './config/db.js';

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'atomquest-backend' });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  if (!supabase) {
    console.log('Supabase environment variables are missing.');
    return;
  }

  console.log('Database Connected Successfully');
});