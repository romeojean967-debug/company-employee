import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Isuku Route System" },
      {
        name: "description",
        content:
          "Simple monthly plans for households, businesses and waste collection companies using Isuku Route System.",
      },
      { property: "og:title", content: "Pricing — Isuku Route System" },
      {
        property: "og:description",
        content: "Simple monthly plans for households, businesses and collection companies.",
      },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Household",
    price: "3,000 RWF",
    period: "per month",
    items: ["Weekly pickup", "Digital receipt", "Online payment", "Schedule alerts"],
  },
  {
    name: "Business",
    price: "25,000 RWF",
    period: "per month",
    highlight: true,
    items: ["Up to 3 pickups a week", "Sorted waste categories", "Dedicated vehicle slot", "Monthly statement"],
  },
  {
    name: "Company licence",
    price: "Contact us",
    period: "per collection company",
    items: ["Unlimited staff and drivers", "Full route management", "Reports and profit analysis", "Priority support"],
  },
];

function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-glow py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-bold md:text-5xl">Pricing</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Clear plans for customers, and a licence for the collection companies that run the
            system.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`surface-card p-8 ${p.highlight ? "border-primary" : ""}`}
              >
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="mt-4 font-display text-3xl font-bold text-primary">{p.price}</p>
                <p className="text-xs text-muted-foreground">{p.period}</p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {i}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full" variant={p.highlight ? "default" : "outline"}>
                  <Link to="/auth">Get started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
