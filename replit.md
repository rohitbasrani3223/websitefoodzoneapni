# Shakti Fast Food

A modern, mobile-first food ordering web app for Shakti Fast Food — a fast food stall near the railway station in Sagar, Madhya Pradesh. Customers can browse the menu, add items to cart, place orders, and track status. Staff manage orders and menu via a secure admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/shakti-food run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/` (categories, menu-items, orders)
- API contracts: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- API routes: `artifacts/api-server/src/routes/`
- Frontend pages: `artifacts/shakti-food/src/pages/`
- Cart context: `artifacts/shakti-food/src/context/cart.tsx`
- Theme: `artifacts/shakti-food/src/index.css`

## Pages

- `/` — Homepage (hero with shop photo, popular items, about section, CTA, location)
- `/menu` — Menu ordering (category filter, search, add to cart, floating cart)
- `/cart` — Cart review + checkout form
- `/track/:id` — Order status tracking (auto-polls every 5s)
- `/admin` — Admin login (username: admin, password: shakti123)
- `/admin/dashboard` — Dashboard stats, orders management, menu CRUD

## Architecture decisions

- Cart is client-side state (React context + localStorage), not persisted in DB — submitted on order placement
- Admin auth is a simple token stored in localStorage — not JWT-verified on backend (suitable for small restaurant MVP)
- `/menu/popular` route is registered BEFORE `/menu/:id` in Express to prevent shadowing
- All menu items are seeded from the real printed menu (see attached menu board image)
- GST (5%) is calculated on the frontend in cart total display only

## Product

- Customers: browse menu by category, search, add to cart, checkout with name/phone, track order in real-time
- Admin: view dashboard stats + weekly revenue chart, manage orders (update status), manage menu items (CRUD + availability toggle)

## User preferences

- Dark, warm cafe aesthetic — matte black with neon orange (#ff7a00 primary)
- Real shop photo used as homepage hero background
- Real menu board photo used in about section
- All prices in Indian Rupees (₹)
- No emojis in UI

## Gotchas

- Always re-run codegen after OpenAPI spec changes: `pnpm --filter @workspace/api-spec run codegen`
- The `/menu/popular` route must stay above `/menu/:id` in `artifacts/api-server/src/routes/menu.ts`
- Google Fonts `@import url(...)` must be the FIRST line in `index.css` before `@import "tailwindcss"`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
