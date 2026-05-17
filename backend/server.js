import express from 'express';
import cors from 'cors';
import { supabase } from './config/db.js';
import authRoutes from './routes/auth/authRoutes.js';
import adminRoutes from './routes/admin/adminRoutes.js';
import employeeRoutes from './routes/employee/employeeRoutes.js';
import managerRoutes from './routes/manager/managerRoutes.js';

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);

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