import { createFileRoute } from "@tanstack/react-router";
import PMEnterpriseLayout from "@/components/product-manager/PMEnterpriseLayout";

export const Route = createFileRoute("/product-manager")({
  head: () => ({
    meta: [
      { title: "Product Manager — Software Vala" },
      {
        name: "description",
        content:
          "Manage the Software Vala product catalog, modules, builds, deployments, approvals, pricing and reports.",
      },
      { property: "og:title", content: "Product Manager — Software Vala" },
      {
        property: "og:description",
        content: "Product operations and deployment control for Software Vala.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductManagerPage,
});

function ProductManagerPage() {
  return <PMEnterpriseLayout />;
}