# BittieTasks Styling Protection Guide

## Critical Files - DO NOT MODIFY WITHOUT EXTREME CAUTION

### 1. postcss.config.js
**STATUS**: PROTECTED - This file is essential for Tailwind CSS compilation
```javascript
export default {
  plugins: {
    tailwindcss: {},
  },
}
```
**WARNING**: 
- Removing this file will break ALL styling
- Adding autoprefixer without proper dependency management will cause Vercel build failures
- Must use ES module syntax (export default) due to package.json "type": "module"

### 2. app/globals.css  
**STATUS**: PROTECTED - Contains Tailwind directives and design system
- Contains @tailwind base, components, utilities directives
- Houses complete color scheme and CSS variables
- BittieTasks brand colors and design tokens

### 3. tailwind.config.ts
**STATUS**: PROTECTED - Tailwind configuration for content scanning
- Defines content paths for CSS purging
- Custom color scheme definitions
- Component configurations

## Build Process Protection

### Local Development
- Next.js dev server automatically processes CSS with PostCSS
- Changes to styling files trigger automatic recompilation
- Check for "✓ Compiled successfully" in terminal

### Production Deployment  
- Vercel build process requires postcss.config.js for CSS compilation
- Missing PostCSS config causes "Cannot find module" errors
- Build must complete with "✓ Compiled successfully" status

## Emergency Recovery

If styling breaks:
1. Verify postcss.config.js exists with correct ES module syntax
2. Check app/globals.css contains @tailwind directives
3. Restart development server
4. Run `npm run build` to test compilation
5. If autoprefixer errors occur, remove from postcss.config.js

## Prevention Checklist

✅ Never delete postcss.config.js
✅ Never modify @tailwind directives in globals.css  
✅ Always test build locally before deployment
✅ Keep PostCSS config minimal (Tailwind only)
✅ Document any CSS architecture changes

## Current Working Configuration (August 2025)

- PostCSS: Tailwind CSS only (no autoprefixer)
- Build Status: ✓ Compiles successfully 
- Deployment: Ready for production
- Styling: Complete BittieTasks branding active