"use server";

import { APIError } from "better-auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { requireSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

import { ROLES } from "./queries";

export type TeamState = { status: "idle" | "success" | "error"; message?: string; errors?: Record<string, string[] | undefined> };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

function failure(error: unknown, fallback: string): TeamState {
  if (error instanceof APIError) return { status: "error", message: error.body?.message ?? fallback };
  throw error;
}

export async function createTeamAction(_: TeamState, formData: FormData): Promise<TeamState> {
  await requireSession("/settings/team");
  const name = z.string().trim().min(2, "Use at least 2 characters.").max(60).safeParse(formData.get("name"));
  if (!name.success) return { status: "error", errors: { name: [name.error.issues[0]!.message] } };
  const slug = `${slugify(name.data) || "team"}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    const team = await auth.api.createOrganization({ body: { name: name.data, slug }, headers: await headers() });
    if (team) await auth.api.setActiveOrganization({ body: { organizationId: team.id }, headers: await headers() });
  } catch (error) {
    return failure(error, "Couldn't create the team.");
  }
  redirect("/settings/team");
}

export async function switchTeamAction(formData: FormData) {
  await requireSession();
  const organizationId = z.string().min(1).parse(formData.get("organizationId"));
  await auth.api.setActiveOrganization({ body: { organizationId }, headers: await headers() });
  revalidatePath("/", "layout");
}

export async function updateTeamAction(_: TeamState, formData: FormData): Promise<TeamState> {
  await requireSession("/settings/team");
  const parsed = z
    .object({ organizationId: z.string().min(1), name: z.string().trim().min(2, "Use at least 2 characters.").max(60) })
    .safeParse({ organizationId: formData.get("organizationId"), name: formData.get("name") });
  if (!parsed.success) return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };
  try {
    await auth.api.updateOrganization({
      body: { organizationId: parsed.data.organizationId, data: { name: parsed.data.name } },
      headers: await headers(),
    });
  } catch (error) {
    return failure(error, "Couldn't save the team.");
  }
  revalidatePath("/", "layout");
  return { status: "success", message: "Team saved." };
}

export async function inviteMemberAction(_: TeamState, formData: FormData): Promise<TeamState> {
  await requireSession("/settings/team");
  const { success } = await rateLimit(`teams:invite:${await clientIp()}`, { limit: 20, window: "1 h" });
  if (!success) return { status: "error", message: "Too many invitations. Try again later." };
  const parsed = z
    .object({
      organizationId: z.string().min(1),
      email: z.email("Enter a valid email address.").trim().toLowerCase(),
      role: z.enum(["admin", "member"]),
    })
    .safeParse({ organizationId: formData.get("organizationId"), email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return { status: "error", errors: z.flattenError(parsed.error).fieldErrors };
  try {
    await auth.api.createInvitation({ body: parsed.data, headers: await headers() });
  } catch (error) {
    return failure(error, "Couldn't send the invitation.");
  }
  revalidatePath("/settings/team");
  return { status: "success", message: `Invitation sent to ${parsed.data.email}.` };
}

export async function cancelInvitationAction(formData: FormData) {
  await requireSession("/settings/team");
  await auth.api.cancelInvitation({ body: { invitationId: z.string().parse(formData.get("invitationId")) }, headers: await headers() });
  revalidatePath("/settings/team");
}

export async function updateRoleAction(formData: FormData) {
  await requireSession("/settings/team");
  const { memberId, organizationId, role } = z
    .object({ memberId: z.string(), organizationId: z.string(), role: z.enum(ROLES) })
    .parse(Object.fromEntries(formData));
  await auth.api.updateMemberRole({ body: { memberId, organizationId, role }, headers: await headers() });
  revalidatePath("/settings/team");
}

export async function removeMemberAction(formData: FormData) {
  await requireSession("/settings/team");
  const { memberId, organizationId } = z.object({ memberId: z.string(), organizationId: z.string() }).parse(Object.fromEntries(formData));
  await auth.api.removeMember({ body: { memberIdOrEmail: memberId, organizationId }, headers: await headers() });
  revalidatePath("/settings/team");
}

export async function leaveTeamAction(formData: FormData) {
  await requireSession("/settings/team");
  await auth.api.leaveOrganization({ body: { organizationId: z.string().parse(formData.get("organizationId")) }, headers: await headers() });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function respondToInvitationAction(formData: FormData) {
  const { invitationId, response } = z
    .object({ invitationId: z.string(), response: z.enum(["accept", "decline"]) })
    .parse(Object.fromEntries(formData));
  await requireSession(`/invite/${invitationId}`);
  if (response === "accept") {
    const result = await auth.api.acceptInvitation({ body: { invitationId }, headers: await headers() });
    if (result?.member) {
      await auth.api.setActiveOrganization({ body: { organizationId: result.member.organizationId }, headers: await headers() });
    }
    redirect("/settings/team");
  }
  await auth.api.rejectInvitation({ body: { invitationId }, headers: await headers() });
  redirect("/dashboard");
}
