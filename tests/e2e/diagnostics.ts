import fs from "node:fs";
import path from "node:path";
import { test as base, type Page } from "@playwright/test";

type SupabaseCall = {
  url: string;
  method: string;
  status: number;
  body: string;
};

/**
 * Failure diagnostics: on any failing Product Manager test we persist a
 * screenshot, the rendered DOM, the console log and every Supabase REST
 * response recorded during the run.
 */
export const test = base.extend<{ diagnostics: void }>({
  diagnostics: [
    async ({ page }, use, testInfo) => {
      const calls: SupabaseCall[] = [];
      const console_: string[] = [];

      page.on("console", (msg) => console_.push(`[${msg.type()}] ${msg.text()}`));
      page.on("pageerror", (err) => console_.push(`[pageerror] ${err.message}`));
      page.on("response", async (response) => {
        if (!/\/rest\/v1\//.test(response.url())) return;
        let body = "";
        try {
          body = (await response.text()).slice(0, 4000);
        } catch {
          body = "<unavailable>";
        }
        calls.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          body,
        });
      });

      await use();

      if (testInfo.status === testInfo.expectedStatus) return;

      const dir = path.join(testInfo.outputDir);
      fs.mkdirSync(dir, { recursive: true });
      await safe(() => page.screenshot({ path: path.join(dir, "failure.png") }));
      await safe(async () =>
        fs.writeFileSync(path.join(dir, "dom.html"), await page.content(), "utf8"),
      );
      await safe(async () => {
        const content = page.getByTestId("pm-content");
        const text = (await content.count()) ? await content.innerText() : "<no pm-content>";
        fs.writeFileSync(path.join(dir, "pm-content.txt"), text, "utf8");
      });
      fs.writeFileSync(
        path.join(dir, "supabase-network.json"),
        JSON.stringify(calls, null, 2),
        "utf8",
      );
      fs.writeFileSync(path.join(dir, "console.log"), console_.join("\n"), "utf8");

      await testInfo.attach("failure screenshot", {
        path: path.join(dir, "failure.png"),
        contentType: "image/png",
      });
      await testInfo.attach("supabase network", {
        path: path.join(dir, "supabase-network.json"),
        contentType: "application/json",
      });
      await testInfo.attach("dom snapshot", {
        path: path.join(dir, "dom.html"),
        contentType: "text/html",
      });
    },
    { auto: true },
  ],
});

async function safe(fn: () => unknown | Promise<unknown>) {
  try {
    await fn();
  } catch {
    /* diagnostics must never fail a test */
  }
}

export { expect } from "@playwright/test";
export type { Page };