import { ArrowRightIcon, BellIcon, SparklesIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const SWATCHES = [
  "background",
  "foreground",
  "card",
  "muted",
  "muted-foreground",
  "accent",
  "primary",
  "primary-foreground",
  "secondary",
  "border",
  "ring",
  "destructive",
  "success",
  "warning",
];

/** A specimen of real components. Placeholder copy exists only in this dev tool. */
export function Preview() {
  return (
    <div className="flex flex-col">
      <section className="container-page flex flex-col gap-6 py-16">
        <p className="text-eyebrow text-muted-foreground">Typography</p>
        <h2 className="text-display">The quick brown fox jumps over the lazy dog</h2>
        <p className="text-lead text-muted-foreground max-w-2xl">
          A lead paragraph sets up the section. It uses the lead role: slightly larger, relaxed line
          height, pretty wrapping.
        </p>
        <h3 className="text-heading">Section heading</h3>
        <p className="max-w-prose leading-7">
          Body copy in the body typeface.{" "}
          <a href="#links" className="underline underline-offset-4">
            Inline links
          </a>{" "}
          stay readable, and{" "}
          <code className="bg-muted rounded-sm px-1.5 py-0.5 font-mono text-sm">code</code> uses the
          mono face.
        </p>
      </section>

      <section className="container-page grid gap-6 pb-16 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Buttons, inputs and badges in every variant.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Delete</Button>
            </div>
            <Field id="lab-email" label="Email" description="We never share it.">
              {(control) => <Input {...control} type="email" placeholder="you@example.com" />}
            </Field>
            <Field id="lab-error" label="With an error" error="This field is required.">
              {(control) => <Input {...control} />}
            </Field>
            <div className="flex flex-wrap gap-2">
              <Badge>Neutral</Badge>
              <Badge variant="default">Primary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Error</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <Badge variant="default" className="mb-2">
                <SparklesIcon aria-hidden /> Popular
              </Badge>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>
                Elevation uses the shadow dial; corners use the radius dial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl font-semibold tracking-tight">
                $24<span className="text-muted-foreground text-base font-normal">/month</span>
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Get started <ArrowRightIcon aria-hidden />
              </Button>
            </CardFooter>
          </Card>
          <Alert>
            <BellIcon aria-hidden />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>Alerts use card surfaces and semantic colors.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Something failed</AlertTitle>
            <AlertDescription>Destructive color is fixed for recognizability.</AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="tone-inverted bg-background text-foreground">
        <div className="container-page flex flex-col items-start gap-4 py-16">
          <p className="text-eyebrow text-muted-foreground">Inverted tone</p>
          <h3 className="text-heading">Any section can flip light and dark.</h3>
          <p className="text-muted-foreground max-w-xl">
            Add the tone-inverted class (or tone=&quot;inverted&quot;) and every token follows.
          </p>
          <div className="flex gap-2">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <p className="text-eyebrow text-muted-foreground mb-4">Tokens</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {SWATCHES.map((token) => (
            <li key={token} className="flex flex-col gap-2">
              <span className="h-14 rounded-md border" style={{ background: `var(--${token})` }} />
              <span className="text-muted-foreground font-mono text-xs">{token}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
