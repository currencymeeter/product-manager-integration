import { expect, test } from "@playwright/test";
import { SECTIONS, gotoSection, pmTablesQueried, spyOnQueries } from "./pm-helpers";

/**
 * Smoke pass: every Product Manager screen must render and must pull its content
 * from the Product Manager tables — a screen backed by static literals would
 * render without ever hitting the Data API.
 */
test.describe("Product Manager screens are data-backed", () => {
  for (const section of SECTIONS) {
    test(`${section.label} (${section.id}) renders from Product Manager queries`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      const spy = spyOnQueries(page);

      const content = await gotoSection(page, section);

      // Screen actually painted something.
      const text = (await content.innerText()).trim();
      expect(text.length, `${section.id} rendered an empty screen`).toBeGreaterThan(40);

      // Screen (or its layout) read live Product Manager tables.
      const tables = pmTablesQueried(spy);
      expect(tables.length, `${section.id} issued no Product Manager query`).toBeGreaterThan(0);

      // At least one query returned real rows.
      const totalRows = [...spy.rows.values()].reduce((n, rows) => n + rows.length, 0);
      expect(totalRows, `${section.id} received no rows from the backend`).toBeGreaterThan(0);

      // No loading/failure placeholders left on screen.
      expect(text).not.toMatch(/failed to load|something went wrong/i);

      expect(
        consoleErrors.filter((e) => !/favicon|ResizeObserver/i.test(e)),
        `${section.id} logged console errors`,
      ).toEqual([]);
    });
  }
});