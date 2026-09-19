import { Link } from "@tanstack/react-router";
import { Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

export function SiteHeader() {
  const { user } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="green-gradient flex size-9 items-center justify-center rounded-lg">
            <Recycle className="size-5" />
          </span>
          Isuku Route
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/services" className="transition-colors hover:text-foreground">
            Services
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link to="/contact" className="transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm text-muted-foreground md:grid-cols-3">
        <div>
          <p className="font-display text-base font-semibold text-foreground">Isuku Route System</p>
          <p className="mt-2 max-w-xs">
            AI-powered EcoRoute platform by Prime Soft Ltd for waste collection companies.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Platform</p>
          <Link to="/services" className="block hover:text-foreground">
            Services
          </Link>
          <Link to="/pricing" className="block hover:text-foreground">
            Pricing
          </Link>
          <Link to="/auth" className="block hover:text-foreground">
            Sign in
          </Link>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Contact</p>
          <p>info@isukuroute.rw</p>
          <p>+250 780 000 000</p>
          <p>Kigali, Rwanda</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Isuku Route System. All rights reserved.
      </div>
    </footer>
  );
}
