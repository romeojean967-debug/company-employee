import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Isuku Route System" },
      {
        name: "description",
        content:
          "Household and business waste collection, route planning, digital receipts, payment tracking and performance reporting.",
      },
      { property: "og:title", content: "Services — Isuku Route System" },
      {
        property: "og:description",
        content: "Collection, route planning, digital receipts, payment tracking and reporting.",
      },
    ],
  }),
  component: Services,
});

const services = [
  {
    title: "Household collection",
    text: "Register households by district, sector, cell and village, attach them to a subscription plan and a weekly collection slot.",
  },
  {
    title: "Business & institution collection",
    text: "Larger contracts with custom frequency, waste categories and dedicated vehicles.",
  },
  {
    title: "Route planning",
    text: "Build routes per vehicle and driver, with start and end times and a live status for each trip.",
  },
  {
    title: "Payments & digital receipts",
    text: "Record cash and mobile money manually, accept online payments, and issue a receipt with a reference for every transaction.",
  },
  {
    title: "Debt follow-up",
    text: "Instantly see unpaid and overdue customers per location so the field team knows where to go.",
  },
  {
    title: "Reports & profit analysis",
    text: "Monthly revenue, collection rate and profitability by location, exported as company reports.",
  },
];

function Services() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-glow py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-bold md:text-5xl">Services</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            What the Isuku Route System covers, from the first household registration to the end of
            month report.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.title} className="surface-card p-6">
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
