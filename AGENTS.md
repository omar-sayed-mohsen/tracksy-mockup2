# AGENTS.md — Tracksy Prototype

## Quick start

```bash
npm install
npm run dev      # Vite dev server
npm run build    # TypeScript check + Vite bundle
npm run preview  # Serve built output
```

**No lint, typecheck, or test npm scripts exist.** Use `npx tsc --noEmit` to typecheck (tsconfig has `"noUnusedLocals": true`, `"noUnusedParameters": true`). Tests are manual QA steps in `tests/tests.txt` — there is no test runner.

## Architecture

All source code lives in `src/App.tsx` (~1500+ lines, single-file). Entrypoint: `src/main.tsx` → `App`. No routing, no state library, no barrel exports. Views are switched via a `View` union type and conditional rendering.

Directories:
- `src/` — React app (`App.tsx`, `main.tsx`, `index.css`)
- `tests/` — manual test descriptions only (`tests.txt`)
- `index.html` — mounts `#root`, loads `main.tsx`

## Tech stack

- React 19, TypeScript 5.7, Vite 6, Tailwind CSS 3, PostCSS + autoprefixer
- Icons: `lucide-react`
- Font: Sora (declared in CSS `font-family`, not imported — ensure it's available)
- No lockfile committed, no CI, no pre-commit hooks, no GitHub config

## Conventions

- `base: './'` in vite config — assets use relative paths
- `type: "module"` in package.json — ESM throughout
- Destructive actions (delete, clear archive) use a countdown guard pattern
- Theme system: CSS custom properties on `.tracksy-shell`, toggled via class names (`theme-luminous`, `theme-night`, `theme-nature`, `theme-sunset`, `theme-custom`)
- Glass effect toggles via `.glass-on` / `.glass-off` classes
- Cursor glow trail: pointer tracking with `requestAnimationFrame` lerp
