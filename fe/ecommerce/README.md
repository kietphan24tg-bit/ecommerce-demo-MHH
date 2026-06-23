# Ecommerce Frontend

React frontend workspace for the ecommerce project.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- React Hook Form
- Zod

## Current Scope

The codebase already includes page and route structure for:

- User flows: product listing, product detail, cart, checkout, saved items
- Auth flows: login, register, forgot password
- Admin flows: dashboard, category management, product management, settings

## Current Status

The route/page structure is in place, but the app entry is still partially based on the default Vite starter. More integration work is needed before the frontend reflects the full ecommerce experience end to end.

## Available Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

## Development Server

Runs on `http://127.0.0.1:5173` by default.

## Main Folders

```text
src/
|-- components/
|-- layouts/
|-- pages/
|-- routes/
|-- services/
|-- store/
`-- types/
```

## Routes

Defined in `src/routes/AppRouter.tsx`:

- `/login`
- `/register`
- `/forgot-password`
- `/`
- `/products/:id`
- `/cart`
- `/checkout`
- `/saved`
- `/admin`
- `/admin/category`
- `/admin/product`
- `/admin/settings`

## Notes

See the project-level README at [../../README.md](../../README.md) for the full monorepo overview.
