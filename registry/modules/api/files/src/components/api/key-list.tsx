import { KeyRoundIcon } from "lucide-react";

import { EmptyState } from "@/components/sections/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { revokeKeyAction } from "@/lib/api/actions";

type KeyRow = {
  id: string;
  name: string;
  start: string;
  scopes: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
};

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

function ago(date: Date) {
  const diff = date.getTime() - Date.now();
  for (const [unit, ms] of STEPS)
    if (Math.abs(diff) >= ms) return relative.format(Math.round(diff / ms), unit);
  return "just now";
}

export function KeyList({ keys }: { keys: KeyRow[] }) {
  if (keys.length === 0) {
    return (
      <EmptyState
        icon={<KeyRoundIcon />}
        title="No API keys yet"
        description="Keys let scripts and other services act on your behalf."
      />
    );
  }
  const now = new Date();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Scopes</TableHead>
          <TableHead>Last used</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => {
          const expired = key.expiresAt !== null && key.expiresAt < now;
          return (
            <TableRow key={key.id}>
              <TableCell className="font-medium">{key.name}</TableCell>
              <TableCell>
                <code className="text-muted-foreground font-mono text-xs">{key.start}…</code>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {key.scopes.map((scope) => (
                    <Badge key={scope} variant="outline" className="font-mono">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {key.lastUsedAt ? ago(key.lastUsedAt) : "Never"}
              </TableCell>
              <TableCell>
                {expired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <span className="text-muted-foreground">
                    {key.expiresAt ? ago(key.expiresAt) : "Never"}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <form action={revokeKeyAction}>
                  <input type="hidden" name="id" value={key.id} />
                  <Button type="submit" variant="ghost" size="sm" aria-label={`Revoke ${key.name}`}>
                    Revoke
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
