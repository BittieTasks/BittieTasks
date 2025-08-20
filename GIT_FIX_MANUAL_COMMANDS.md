# Fix Git Lock Issues - Manual Commands

## Current Issue:
Multiple git lock files are preventing commits and pushes:
- `.git/index.lock`
- `.git/refs/remotes/origin/HEAD.lock` 
- `.git/refs/remotes/origin/main.lock`

## Step 1: Clear All Git Locks Manually
Run these commands in your terminal:

```bash
# Remove all git lock files
rm -f .git/index.lock
rm -f .git/refs/remotes/origin/HEAD.lock
rm -f .git/refs/remotes/origin/main.lock
rm -f .git/refs/heads/main.lock

# Verify locks are gone
ls -la .git/*.lock 2>/dev/null || echo "No locks found - good!"
```

## Step 2: Check Git Status and Commit
```bash
# Check what needs to be committed
git status

# Add all changes
git add .

# Commit with a simple message
git commit -m "Fix production deployment: ESLint config and environment variables"

# Push to GitHub
git push origin main
```

## Step 3: Verify Deployment Success
After the push succeeds:
1. **GitHub Actions should pass** - Build and lint will work
2. **Vercel will auto-deploy** with updated environment variables
3. **Test production signup**: https://www.bittietasks.com/auth

## Fallback: Manual Vercel Deploy
If git issues persist, deploy directly through Vercel:
1. Go to https://vercel.com/dashboard
2. Find BittieTasks → Deployments
3. Click "Redeploy" on latest deployment

**The code fixes are complete - just need to clear the git locks and push.**