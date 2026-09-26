import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/sections/auth-card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { art } from "@/demo/content";

export const metadata: Metadata = { title: "Auth screen", robots: { index: false } };

export default function AuthDemo() {
  return (
    <AuthCard
      logo="Tidewater"
      title="Welcome back"
      description="Sign in to your clinic."
      footer={
        <>
          No account?{" "}
          <Link href="#" className="text-foreground underline underline-offset-4">
            Start a free trial
          </Link>
        </>
      }
      aside={{
        image: art(4, ""),
        content: <p className="font-display max-w-md text-2xl leading-snug font-medium">“We cut no-shows by a third in the first month.”</p>,
      }}
    >
      <form className="grid gap-4" action="#">
        <Field id="demo-email" label="Email">
          {(control) => <Input {...control} type="email" autoComplete="email" />}
        </Field>
        <Field id="demo-password" label="Password">
          {(control) => <Input {...control} type="password" autoComplete="current-password" />}
        </Field>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
