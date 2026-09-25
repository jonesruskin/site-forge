import type { Metadata } from "next";
import { headers } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  banUserAction,
  impersonateAction,
  revokeSessionsAction,
  setRoleAction,
  unbanUserAction,
} from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/guard";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = { title: "Users · Admin", robots: { index: false } };

const PAGE_SIZE = 25;

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const { user: me } = await requireAdmin("/admin/users");
  const { q = "", page: rawPage = "1" } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage, 10) || 1);
  const result = await auth.api.listUsers({
    query: {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      sortBy: "createdAt",
      sortDirection: "desc",
      ...(q && {
        searchValue: q,
        searchField: q.includes("@") ? "email" : "name",
        searchOperator: "contains",
      }),
    },
    headers: await headers(),
  });
  const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">{result.total.toLocaleString()} total</p>
        </div>
        <form role="search" className="flex gap-2">
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <Input
            id="user-search"
            name="q"
            defaultValue={q}
            placeholder="Name or email"
            className="w-64"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      <div className="bg-card rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.users.map((user) => {
              const isMe = user.id === me.id;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground text-xs">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <form action={setRoleAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={user.id} />
                      <label htmlFor={`role-${user.id}`} className="sr-only">
                        Role for {user.email}
                      </label>
                      <select
                        id={`role-${user.id}`}
                        name="role"
                        defaultValue={user.role ?? "user"}
                        disabled={isMe}
                        className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      {!isMe && (
                        <Button type="submit" size="sm" variant="ghost">
                          Save
                        </Button>
                      )}
                    </form>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : user.emailVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {date.format(new Date(user.createdAt))}
                  </TableCell>
                  <TableCell>
                    {!isMe && (
                      <div className="flex justify-end gap-1">
                        <form action={impersonateAction}>
                          <input type="hidden" name="id" value={user.id} />
                          <Button type="submit" size="sm" variant="ghost">
                            View as
                          </Button>
                        </form>
                        <form action={revokeSessionsAction}>
                          <input type="hidden" name="id" value={user.id} />
                          <Button type="submit" size="sm" variant="ghost">
                            Sign out
                          </Button>
                        </form>
                        <form action={user.banned ? unbanUserAction : banUserAction}>
                          <input type="hidden" name="id" value={user.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant={user.banned ? "outline" : "ghost"}
                          >
                            {user.banned ? "Unban" : "Ban"}
                          </Button>
                        </form>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Pagination
        page={page}
        pageCount={pageCount}
        href={(p) => `/admin/users?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`}
      />
    </div>
  );
}
