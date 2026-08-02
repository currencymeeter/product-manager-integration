import { createFileRoute } from "@tanstack/react-router";
import PMEnterpriseLayout from "@/components/product-manager/PMEnterpriseLayout";

export const Route = createFileRoute("/_authenticated/product-manager")({
  head: () => ({
    meta: [
      { title: "Product Manager — Software Vala" },
      {
        name: "description",
        content:
          "Manage the Software Vala product catalog, demos, pricing plans, licenses, builds, deployments and approvals.",
      },
      { property: "og:title", content: "Product Manager — Software Vala" },
      {
        property: "og:description",
        content: "Catalog, demos, pricing, licensing and deployment control for Software Vala products.",
      },
    ],
  }),
  component: ProductManagerPage,
});

function ProductManagerPage() {
  return <PMEnterpriseLayout />;
}