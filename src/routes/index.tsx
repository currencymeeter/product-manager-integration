import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Software Vala — Module Dashboard" },
      {
        name: "description",
        content: "Open and switch between Software Vala management modules from one dashboard.",
      },
      { property: "og:title", content: "Software Vala — Module Dashboard" },
      {
        property: "og:description",
        content: "The central workspace for Software Vala management modules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModuleDashboard,
});

function ModuleDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-5 sm:px-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-foreground">Software Vala</p>
            <p className="text-xs text-muted-foreground">Module workspace</p>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Workspace</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Choose a module
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Open the management area you need. New modules will appear here when they are added.
          </p>
        </div>

        <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
          <article className="flex min-h-56 flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
                <PackageSearch className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold text-card-foreground">
                Product Manager
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Manage products, modules, builds, deployments, approvals, pricing and reports.
              </p>
            </div>
            <Button asChild className="mt-6 w-full justify-between">
              <Link to="/product-manager">
                Open Product Manager
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </article>
        </div>
      </section>
    </main>
  );
}
