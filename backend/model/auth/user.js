import { supabase } from '../../config/db.js';

export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      password_hash,
      role,
      department_id,
      departments:department_id (
        id,
        name,
        description
      )
    `)
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data;
}

export async function getUserById(userId) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      role,
      department_id,
      departments:department_id (
        id,
        name,
        description
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user by id:', error);
    return null;
  }

  return data;
}
