// Quick script to check user verification status
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkUserStatus(email) {
  try {
    const result = await pool.query(
      'SELECT email, first_name, last_name, is_email_verified, email_verification_token, created_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }
    
    const user = result.rows[0];
    console.log(`📧 User found: ${user.first_name} ${user.last_name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`✅ Email verified: ${user.is_email_verified ? 'YES' : 'NO'}`);
    console.log(`🔑 Has verification token: ${user.email_verification_token ? 'YES' : 'NO'}`);
    console.log(`📅 Created: ${user.created_at}`);
    
    if (user.email_verification_token) {
      console.log(`🔗 Token: ${user.email_verification_token.substring(0, 12)}...`);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await pool.end();
  }
}

checkUserStatus('Caitlin.landrigan@gmail.com');