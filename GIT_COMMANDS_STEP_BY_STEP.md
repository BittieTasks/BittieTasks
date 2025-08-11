# Git Push Commands - Step by Step

## Current Status
- ✅ Local app running perfectly on port 5000
- ✅ Temporary Vercel deployment successful
- ❌ Main domain needs the fixes

## Files That Need to Be Pushed
- `vercel.json` - Fixed environment variables and runtime
- `deploy.sh` - Deployment helper script
- `force-deploy.txt` - Deployment trigger
- Other deployment configuration files

## Copy and paste these commands one by one:

```bash
rm -f .git/index.lock .git/refs/remotes/origin/main.lock
```

```bash
git add .
```

```bash
git commit -m "Deploy fixes: Update Vercel config and resolve JSX errors"
```

```bash
git push origin main --force
```

## After pushing, verify:
1. GitHub repository shows the latest commit
2. Main BittieTasks domain automatically redeploys
3. Build succeeds with all 16 pages generated