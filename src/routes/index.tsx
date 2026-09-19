import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  Wallet,
  MapPinned,
  BarChart3,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import heroTruck from "@/assets/hero-truck.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Isuku Route System — Waste Collection Management Platform" },
      {
        name: "description",
        content:
          "Record collections, track paid and unpaid customers, manage drivers and vehicles, and see profit by location — all in one waste management platform.",
      },
      { property: "og:title", content: "Isuku Route System" },
      {
        property: "og:description",
        content:
          "Record collections, track payments, manage staff and see profit by location in one platform.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Wallet,
    title: "Every transaction recorded",
    text: "Cash, mobile money or online payments — each one logged with a digital receipt, and unpaid customers flagged automatically.",
  },
  {
    icon: MapPinned,
    title: "Routes and schedules",
    text: "Plan collection routes, assign vehicles and drivers, and follow each pickup from planned to completed.",
  },
  {
    icon: Users,
    title: "Staff and drivers",
    text: "Companies create their own office staff, field employees and drivers, each with the right access.",
  },
  {
    icon: BarChart3,
    title: "Profit and location analysis",
    text: "See revenue, collection rate and which districts and sectors pay best.",
  },
  {
    icon: ShieldCheck,
    title: "One login, many roles",
    text: "Administrators, companies, employees, drivers and customers share one sign-in and land on their own workspace.",
  },
  {
    icon: Truck,
    title: "Fleet and waste types",
    text: "Keep vehicles, capacity and waste categories organised for each company.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" />
              AI-Powered EcoRoute · Prime Soft Ltd
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              Run your waste collection business from{" "}
              <span className="text-primary">one system</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Isuku Route System records every activity and transaction, shows who has paid and who
              has not, and turns your collections into clear reports and profit analysis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Open your workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/services">See what it does</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                ["100%", "Transactions traced"],
                ["5", "User roles"],
                ["24/7", "Customer access"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-primary">{n}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={heroTruck}
              alt="Waste collection truck on a city street at dawn"
              width={1600}
              height={1008}
              className="w-full rounded-2xl border border-border object-cover shadow-[var(--shadow-green)]"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-sidebar py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl">Everything the business needs</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Built around how waste collection companies really work — from the household to the
            monthly profit report.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="surface-card p-6">
                <span className="green-gradient mb-4 flex size-10 items-center justify-center rounded-lg">
                  <f.icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">One login, five workspaces</h2>
            <p className="mt-3 text-muted-foreground">
              Everyone signs in at the same place. The system opens the workspace that matches the
              person.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "System administrator oversees every company on the platform",
              "Company manager controls staff, fleet, customers and finances",
              "Office employees register customers and record payments",
              "Drivers see their assigned routes and mark collections done",
              "Customers check their schedule, receipts and pay online",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-sidebar py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to clean up your records?</h2>
          <p className="mt-3 text-muted-foreground">
            Create your account and start recording collections and payments today.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
