import fs from "node:fs";
import path from "node:path";
import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Read VITE_SUPABASE_* from .env so tests can query the same backend the UI uses. */
function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  const file = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return { ...out, ...process.env } as Record<string, string>;
}

const env = loadEnv();
export const SUPABASE_URL = env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? "";

/** Every table the Product Manager module reads from. */
export const PM_TABLES = [
  "products",
  "demos",
  "product_inventory",
  "product_orders",
  "product_pricing_plans",
  "product_licenses",
  "product_action_logs",
  "product_demo_mappings",
  "pm_modules",
  "pm_roles",
  "pm_country_access",
  "pm_approvals",
  "pm_servers",
  "pm_deployments",
  "pm_deployment_logs",
  "pm_builds",
  "pm_build_versions",
  "pm_api_keys",
  "pm_abuse_alerts",
  "pm_product_performance",
  "pm_demo_funnel",
  "pm_country_sales",
  "pm_settings",
  "pm_software_profiles",
] as const;

export type Section = { group?: string; id: string; label: string };

/** Sidebar map: every navigable Product Manager screen. */
export const SECTIONS: Section[] = [
  { id: "dashboard", label: "Dashboard" },

  { group: "software-products", id: "all-products", label: "All Software" },
  { group: "software-products", id: "active-products", label: "Active" },
  { group: "software-products", id: "development-products", label: "In Development" },
  { group: "software-products", id: "deployed-products", label: "Deployed" },
  { group: "software-products", id: "locked-products", label: "Locked" },
  { group: "software-products", id: "archived-products", label: "Archived" },
  { group: "software-products", id: "software-profile", label: "Software Profile" },

  { group: "commerce", id: "pricing-plans", label: "Pricing Plans" },
  { group: "commerce", id: "inventory", label: "Inventory" },
  { group: "commerce", id: "orders", label: "Orders" },
  { group: "commerce", id: "licenses", label: "License Manager" },
  { group: "commerce", id: "demo-management", label: "Demo Management" },
  { group: "commerce", id: "analytics", label: "Analytics" },

  { group: "product-structure", id: "main-category", label: "Category" },
  { group: "product-structure", id: "sub-category", label: "Sub-Category" },
  { group: "product-structure", id: "micro-category", label: "Micro-Category" },
  { group: "product-structure", id: "nano-category", label: "Nano-Category" },
  { group: "product-structure", id: "feature-binding", label: "Feature Binding" },

  { group: "module-management", id: "core-modules", label: "Core Modules" },
  { group: "module-management", id: "optional-modules", label: "Optional Modules" },
  { group: "module-management", id: "role-modules", label: "Role-Based Modules" },
  { group: "module-management", id: "locked-modules", label: "Locked Modules" },
  { group: "module-management", id: "disabled-modules", label: "Disabled Modules" },

  { group: "access-control", id: "view-permission", label: "View Permission" },
  { group: "access-control", id: "copy-permission", label: "Copy Permission" },
  { group: "access-control", id: "download-permission", label: "Download Permission" },
  { group: "access-control", id: "edit-permission", label: "Edit Permission" },
  { group: "access-control", id: "role-visibility", label: "Role Visibility" },
  { group: "access-control", id: "country-control", label: "Country/Franchise" },

  { group: "file-build", id: "upload-build", label: "Upload Build Files" },
  { group: "file-build", id: "apk-builds", label: "APK Builds" },
  { group: "file-build", id: "web-builds", label: "Web Builds" },
  { group: "file-build", id: "assets", label: "Assets" },
  { group: "file-build", id: "file-lock", label: "File Lock" },
  { group: "file-build", id: "view-only-mode", label: "View-Only Mode" },
  { group: "file-build", id: "version-history", label: "Version History" },

  { group: "deployment-control", id: "server-assignment", label: "Server Assignment" },
  { group: "deployment-control", id: "environment-select", label: "Environment Select" },
  { group: "deployment-control", id: "deploy", label: "Deploy" },
  { group: "deployment-control", id: "rollback", label: "Rollback" },
  { group: "deployment-control", id: "stop-deployment", label: "Stop Deployment" },
  { group: "deployment-control", id: "deployment-logs", label: "Deployment Logs" },

  { group: "approval-flow", id: "deployment-approval", label: "Deployment Approval" },
  { group: "approval-flow", id: "version-approval", label: "Version Approval" },
  { group: "approval-flow", id: "module-approval", label: "Module Approval" },
  { group: "approval-flow", id: "emergency-override", label: "Emergency Override" },

  { group: "security-license", id: "license-lock", label: "License Lock" },
  { group: "security-license", id: "domain-lock", label: "Domain Lock" },
  { group: "security-license", id: "api-key-binding", label: "API Key Binding" },
  { group: "security-license", id: "expiry-control", label: "Expiry Control" },
  { group: "security-license", id: "abuse-protection", label: "Abuse Protection" },

  { group: "activity-logs", id: "product-changes", label: "Product Changes" },
  { group: "activity-logs", id: "file-upload-logs", label: "File Upload Logs" },
  { group: "activity-logs", id: "lock-unlock-history", label: "Lock/Unlock History" },
  { group: "activity-logs", id: "deployment-history", label: "Deployment History" },
  { group: "activity-logs", id: "approval-history", label: "Approval History" },

  { group: "reports", id: "software-usage", label: "Software Usage" },
  { group: "reports", id: "deployment-success", label: "Deployment Success" },
  { group: "reports", id: "failure-reports", label: "Failure Reports" },
  { group: "reports", id: "export-reports", label: "Export (Admin)" },

  { group: "settings", id: "notifications", label: "Notifications" },
  { group: "settings", id: "security-settings", label: "Security" },
  { group: "settings", id: "profile", label: "Profile" },
];

export type QuerySpy = {
  /** PostgREST table names requested since page load. */
  tables: Set<string>;
  /** Rows returned per table, merged across requests. */
  rows: Map<string, unknown[]>;
};

/** Records every Supabase REST read the page performs. */
export function spyOnQueries(page: Page): QuerySpy {
  const spy: QuerySpy = { tables: new Set(), rows: new Map() };

  page.on("response", async (response) => {
    const url = response.url();
    const match = url.match(/\/rest\/v1\/([a-z0-9_]+)/i);
    if (!match) return;
    const table = match[1];
    spy.tables.add(table);
    if (!response.ok()) return;
    try {
      const body = await response.json();
      if (Array.isArray(body)) {
        spy.rows.set(table, [...(spy.rows.get(table) ?? []), ...body]);
      }
    } catch {
      /* non-JSON (HEAD/count) responses are fine */
    }
  });

  return spy;
}

export function pmTablesQueried(spy: QuerySpy): string[] {
  return [...spy.tables].filter((t) => (PM_TABLES as readonly string[]).includes(t));
}

/** Open the Product Manager and switch to a screen via the real sidebar. */
export async function gotoSection(page: Page, section: Section) {
  await page.goto("/product-manager", { waitUntil: "domcontentloaded" });
  const content = page.getByTestId("pm-content");
  await expect(content).toBeVisible();

  if (section.group) {
    const groupButton = page.getByTestId(`pm-nav-${section.group}`);
    await groupButton.click();
    const child = page.getByTestId(`pm-nav-${section.id}`);
    if (!(await child.isVisible().catch(() => false))) {
      await groupButton.click(); // group was already expanded and we collapsed it
    }
  }

  if (section.id !== "dashboard") {
    await page.getByTestId(`pm-nav-${section.id}`).click();
  }

  await expect(content).toHaveAttribute("data-active-section", section.id);
  await page.waitForLoadState("networkidle").catch(() => undefined);
  return content;
}

/** Read rows straight from the Product Manager backend for expected-value assertions. */
export async function fetchRows(
  request: APIRequestContext,
  table: string,
  query = "select=*&limit=5",
): Promise<Record<string, any>[]> {
  const res = await request.get(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  expect(res.ok(), `${table} read failed: ${res.status()}`).toBeTruthy();
  return (await res.json()) as Record<string, any>[];
}

export async function countRows(request: APIRequestContext, table: string): Promise<number> {
  const res = await request.get(`${SUPABASE_URL}/rest/v1/${table}?select=id`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
  });
  const range = res.headers()["content-range"] ?? "0/0";
  return Number(range.split("/")[1] ?? 0);
}

export function digitsOf(text: string): string[] {
  return (text.match(/\d[\d,]*/g) ?? []).map((n) => n.replace(/,/g, ""));
}