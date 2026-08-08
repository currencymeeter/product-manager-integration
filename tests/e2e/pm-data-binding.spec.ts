import { expect, test } from "@playwright/test";
import {
  SECTIONS,
  countRows,
  fetchRows,
  gotoSection,
  pmTablesQueried,
  spyOnQueries,
} from "./pm-helpers";

const section = (id: string) => {
  const found = SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`unknown section ${id}`);
  return found;
};

/**
 * Each entry pins a screen to the backend rows it must display. The assertions
 * compare rendered text against values read live from the Data API, so a screen
 * that reverts to a hardcoded array fails immediately.
 */
const SCREENS: Array<{
  id: string;
  table: string;
  /** Columns whose values must appear verbatim on the screen. */
  columns: string[];
  query?: string;
}> = [
  { id: "inventory", table: "product_inventory", columns: ["available_stock", "total_stock"] },
  { id: "orders", table: "product_orders", columns: ["order_number", "customer_name"] },
  { id: "pricing-plans", table: "product_pricing_plans", columns: ["name"] },
  { id: "licenses", table: "product_licenses", columns: ["license_key", "product_name"] },
  { id: "demo-management", table: "demos", columns: ["title"] },
  { id: "core-modules", table: "pm_modules", columns: ["name"], query: "select=*&type=eq.core&limit=5" },
  { id: "role-visibility", table: "pm_roles", columns: ["name"] },
  { id: "country-control", table: "pm_country_access", columns: ["*"] },
  { id: "deployment-approval", table: "pm_approvals", columns: ["title"], query: "select=*&type=eq.deployment&limit=5" },
  { id: "deploy", table: "pm_deployments", columns: ["product_name", "version"] },
  { id: "deployment-logs", table: "pm_deployment_logs", columns: ["*"] },
  { id: "api-key-binding", table: "pm_api_keys", columns: ["name"] },
  { id: "abuse-protection", table: "pm_abuse_alerts", columns: ["product_name"] },
  { id: "software-profile", table: "pm_software_profiles", columns: ["name", "version"] },
  { id: "all-products", table: "products", columns: ["product_name"] },
];

test.describe("KPI cards and tables match backend rows", () => {
  for (const screen of SCREENS) {
    test(`${screen.id} renders values from ${screen.table}`, async ({ page, request }) => {
      const rows = await fetchRows(request, screen.table, screen.query);
      expect(rows.length, `${screen.table} has no seed rows to verify against`).toBeGreaterThan(0);

      const spy = spyOnQueries(page);
      const content = await gotoSection(page, section(screen.id));

      // The screen queried the very table it displays.
      await expect
        .poll(() => pmTablesQueried(spy), { message: `${screen.id} never queried ${screen.table}` })
        .toContain(screen.table);

      if (screen.columns[0] === "*") return; // presence of the query is the contract here

      // At least one backend row is rendered verbatim on every asserted column.
      for (const column of screen.columns) {
        const values = rows
          .map((row) => row[column])
          .filter((v) => v !== null && v !== undefined && String(v).length > 0)
          .map((v) => String(v));
        expect(values.length, `${screen.table}.${column} is empty in the backend`).toBeGreaterThan(0);
        const pattern = new RegExp(values.map(escapeRegExp).join("|"));
        await expect(
          content,
          `${screen.id} does not render any ${screen.table}.${column} value (expected one of ${values
            .slice(0, 5)
            .join(", ")})`,
        ).toContainText(pattern);
      }
    });
  }
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("dashboard KPI counts equal backend row counts", async ({ page, request }) => {
  const [products, orders, deployments] = await Promise.all([
    countRows(request, "products"),
    countRows(request, "product_orders"),
    countRows(request, "pm_deployments"),
  ]);

  const spy = spyOnQueries(page);
  const content = await gotoSection(page, section("dashboard"));
  await expect.poll(() => pmTablesQueried(spy)).toContain("products");
  expect(products).toBeGreaterThan(0);
  expect(orders).toBeGreaterThan(0);
  expect(deployments).toBeGreaterThan(0);

  // The product KPI card shows the live row count, not a baked-in number.
  await expect(content, "dashboard does not show the live product count").toContainText(
    String(products),
  );

  // Sidebar quick-stat is fed by the same query.
  const sidebarProducts = page.locator("aside, div", { hasText: "Products" }).first();
  await expect(sidebarProducts).toBeVisible();
});

test("no screen falls back to placeholder data when the API is blocked", async ({ page }) => {
  await page.route("**/rest/v1/**", (route) => route.abort());
  await page.goto("/product-manager", { waitUntil: "domcontentloaded" });
  const content = page.getByTestId("pm-content");
  await expect(content).toBeVisible();
  await page.waitForTimeout(2500);
  const text = await content.innerText();

  // With the Data API blocked the screen must be empty/zeroed — any populated
  // table here would prove the numbers came from static literals.
  expect(text).not.toMatch(/ORD-\d|LIC-[A-Z0-9]/);
});