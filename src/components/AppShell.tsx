import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Recycle,
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  Truck,
  Wallet,
  BarChart3,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { roleLabels, useProfile, type AppRole } from "@/hooks/useSession";

type NavItem = { to: string; label: string; icon: typeof Users; roles: AppRole[] };

const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["admin", "company_admin", "employee", "driver", "customer"],
  },
  { to: "/companies", label: "Companies", icon: Building2, roles: ["admin"] },
  {
    to: "/customers",
    label: "Customers",
    icon: Users,
    roles: ["admin", "company_admin", "employee"],
  },
  { to: "/staff", label: "Staff & drivers", icon: UserCog, roles: ["admin", "company_admin"] },
  {
    to: "/operations",
    label: "Collections & routes",
    icon: Truck,
    roles: ["admin", "company_admin", "employee", "driver", "customer"],
  },
  {
    to: "/payments",
    label: "Payments",
    icon: Wallet,
    roles: ["admin", "company_admin", "employee", "customer"],
  },
  {
    to: "/reports",
    label: "Reports & analysis",
    icon: BarChart3,
    roles: ["admin", "company_admin"],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role, profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = navItems.filter((i) => i.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5 font-display font-bold">
          <span className="green-gradient flex size-8 items-center justify-center rounded-lg">
            <Recycle className="size-4" />
          </span>
          Isuku Route
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((i) => {
            const active = pathname === i.to;
            return (
              <Link
                key={i.to}
                to={i.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent font-medium text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <i.icon className="size-4" />
                {i.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="truncate text-sm font-medium">{profile?.full_name || "User"}</p>
          <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto md:hidden">
            {items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className="whitespace-nowrap rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground"
              >
                {i.label}
              </Link>
            ))}
          </div>
          <span className="hidden text-sm text-muted-foreground md:block">{roleLabels[role]} workspace</span>
          <Button variant="ghost" size="sm" className="md:hidden" onClick={signOut}>
            <LogOut className="size-4" />
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
