import { Router } from 'express';
import { migrateUsersToSupabase, setupSupabaseProfiles } from '../migrations/supabase-user-migration';

const router = Router();

/**
 * Admin endpoint to migrate users from memory storage to Supabase
 * Only available in development mode
 */
router.post('/migrate-to-supabase', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    console.log('🚀 Starting Supabase migration...');
    
    // First, ensure the profiles table is set up
    await setupSupabaseProfiles();
    
    // Then migrate users
    const results = await migrateUsersToSupabase();
    
    res.json({
      success: true,
      message: `Migration completed successfully!`,
      results: {
        migrated: results.migrated.length,
        errors: results.errors.length,
        skipped: results.skipped.length,
        details: results
      }
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Admin endpoint to setup Supabase profiles table
 */
router.post('/setup-supabase', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    await setupSupabaseProfiles();
    res.json({
      success: true,
      message: 'Supabase profiles table set up successfully'
    });
  } catch (error) {
    console.error('❌ Supabase setup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Supabase setup failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get migration status
 */
router.get('/migration-status', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    res.json({
      status: 'ready',
      message: 'Migration endpoints available in development mode',
      endpoints: {
        'POST /api/admin/migrate-to-supabase': 'Migrate users from memory to Supabase',
        'POST /api/admin/setup-supabase': 'Setup Supabase profiles table',
        'GET /api/admin/migration-status': 'Check migration status'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;