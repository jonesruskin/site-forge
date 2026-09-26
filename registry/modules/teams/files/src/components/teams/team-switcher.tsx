"use client";

import { CheckIcon, ChevronsUpDownIcon, PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { switchTeamAction } from "@/lib/teams/actions";

import { CreateTeamDialog } from "./create-team-dialog";

type Team = { id: string; name: string };

export function TeamSwitcher({ teams, activeId }: { teams: Team[]; activeId: string | null }) {
  const [creating, setCreating] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const active = teams.find((team) => team.id === activeId);

  return (
    <>
      <form ref={form} action={switchTeamAction} hidden>
        <input ref={input} type="hidden" name="organizationId" />
      </form>
      <DropdownMenu>
        <DropdownMenuTrigger className="hover:bg-accent focus-visible:ring-ring flex h-9 max-w-48 items-center gap-2 rounded-md border px-3 text-sm outline-none focus-visible:ring-2">
          <span className="truncate">{active?.name ?? "Personal"}</span>
          <ChevronsUpDownIcon aria-hidden className="text-muted-foreground size-3.5 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              onSelect={() => {
                if (team.id === activeId || !input.current) return;
                input.current.value = team.id;
                form.current?.requestSubmit();
              }}
            >
              <span className="truncate">{team.name}</span>
              {team.id === activeId && <CheckIcon aria-hidden className="ml-auto" />}
            </DropdownMenuItem>
          ))}
          {teams.length === 0 && (
            <p className="text-muted-foreground px-2 py-1.5 text-sm">No teams yet.</p>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreating(true)}>
            <PlusIcon aria-hidden /> Create team
          </DropdownMenuItem>
          {active && (
            <DropdownMenuItem asChild>
              <Link href="/settings/team">
                <SettingsIcon aria-hidden /> Team settings
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateTeamDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
