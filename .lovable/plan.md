# Import the Product Manager module into Software Vala

Bring the complete Product Manager module from the `sapphire-nexus-command` repo into this project, rebuilt on the Software Vala design system and backed by a real database — no mock data, no fake APIs.

## Decisions made (questions were skipped)

- **Design system**: this project is currently an empty template, so the Software Vala theme is ported in first — dark sapphire/indigo palette, Space Grotesk / Outfit / JetBrains Mono typography, 0.875rem radius, gradient and sidebar tokens — and every Product Manager screen is rebuilt on those tokens.
- **Shell**: Product Manager only. No other modules, no Author Login. A thin Software Vala top bar (brand, search, notifications, user menu) wraps the module sidebar.
- **Backend**: Lovable Cloud with email/password sign-in, real tables, RLS, and realistic seed rows inserted by migration.

## What gets imported (complete list, nothing dropped)

Core layout and shell
- PMEnterpriseLayout (section router for all ~50 sections), PMSidebar (grouped, collapsible, live badge counts)

Main screens
- PMDashboard (KPI cards, trends, quick actions)
- PMAllProducts (filter/search/status views: active, development, deployed, locked, archived)
- PMProductForm (full multi-tab create/edit product form)
- PMCategories (main / sub / micro / nano categories, feature binding)
- PMDemoManagement, PMPricingPlans, PMInventory, PMOrders, PMAnalytics
- PMActivityLog, PMSettings
- PMBulkOperations, PMLicenseManager, PMProductHealthScore, PMProductVersionHistory

Enterprise screens
- PMSoftwareProfile, PMModuleManagement (core / optional / role / locked / disabled modules)
- PMAccessControl (view, copy, download, edit permissions, role visibility, country control)
- PMFileBuild (upload build, APK builds, web builds, assets, file lock, view-only, version history)
- PMDeploymentControl (server assignment, environment select, deploy, rollback, stop, logs)
- PMApprovalFlow (deployment / version / module approval, emergency override)
- PMSecurityLicense (license lock, domain lock, API key binding)
- PMReports

Supporting code
- `types/productTypes.ts`, the product actions hook, and all shared helpers the screens use

## Data layer (replaces every mock array)

Tables created with grants, RLS, and realistic seed data:
`products`, `business_categories`, `business_subcategories`, `product_micro_categories`, `product_nano_categories`, `demos`, `product_demo_mappings`, `pricing_plans`, `inventory_items`, `orders` + `order_items`, `product_modules`, `product_permissions`, `product_builds`, `deployments` + `deployment_logs`, `approval_requests`, `product_licenses`, `product_action_logs`, `product_versions`, `pm_settings`, plus `user_roles` + `has_role()` for role-gated actions.

Screens that shipped with hard-coded arrays in the source (Inventory, Orders, Pricing, Analytics, Access Control, Approvals, Deployment, Builds, Reports, Modules, Security, Health Score) are wired to these tables instead. Analytics and reports compute from real rows.

## Technical notes

- Source is Vite + React Router + Tailwind v3; this project is TanStack Start + Tailwind v4. Every file is ported: `@tailwind` directives and HSL tokens converted to `@theme inline` + oklch in `src/styles.css`, React Router navigation replaced with TanStack Router, motion and `sonner` used as in the source.
- Routes: `/` redirects to `/product-manager`; the module lives under `_authenticated/product-manager` with in-app section state matching the source layout, plus `/auth` for sign-in.
- All reads/writes go through the Supabase browser client with RLS, or `createServerFn` where privileged work is needed. No edge functions.
- Delivered in phases: theme + shell + Cloud/auth/schema/seed → dashboard, products, form, categories → demos, pricing, inventory, orders, analytics, activity, settings → enterprise screens (modules, access, builds, deployment, approvals, security, reports, profile) → bulk ops, licenses, health score, version history + a final pass for leftover placeholder data.

## Out of scope (per your instructions)

No Author Login, no other modules from the source repo (demo dashboards, wireframes, POS, SEO, AI panels), no Capacitor/mobile build workflows.