import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Isuku Route System" },
      {
        name: "description",
        content:
          "Talk to the Isuku Route System team about waste collection management for your company or neighbourhood.",
      },
      { property: "og:title", content: "Contact — Isuku Route System" },
      {
        property: "og:description",
        content: "Talk to the Isuku Route System team about your waste collection needs.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-glow py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold md:text-5xl">Contact us</h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Tell us about your collection area and we will set your company up on the system.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-primary" /> info@isukuroute.rw
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-primary" /> +250 780 000 000
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="size-4 text-primary" /> Kigali, Rwanda
              </li>
            </ul>
          </div>
          <form
            className="surface-card space-y-4 p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSending(true);
              setTimeout(() => {
                setSending(false);
                (e.target as HTMLFormElement).reset();
                toast.success("Message noted. Our team will call you back.");
              }, 500);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email or phone</Label>
              <Input id="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" required rows={5} placeholder="How can we help?" />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Sending..." : "Send message"}
            </Button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
