"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage, initials } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";

type UserMenuProps = {
  user: { name: string; email: string; image?: string | null };
  links?: { label: string; href: string; icon?: ReactNode }[];
  signOutLabel?: string;
};

/** Avatar button with account links and sign-out. */
export function UserMenu({ user, links = [], signOutLabel = "Sign out" }: UserMenuProps) {
  const signOutForm = useRef<HTMLFormElement>(null);
  return (
    <>
      <form ref={signOutForm} action={signOutAction} hidden />
      <DropdownMenu>
        <DropdownMenuTrigger
          className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar className="size-8">
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback>{initials(user.name || user.email)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-foreground truncate text-sm">{user.name}</span>
            <span className="truncate font-normal">{user.email}</span>
          </DropdownMenuLabel>
          {links.length > 0 && <DropdownMenuSeparator />}
          {links.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href}>
                {link.icon}
                {link.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => signOutForm.current?.requestSubmit()}>
            <LogOutIcon aria-hidden />
            {signOutLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
