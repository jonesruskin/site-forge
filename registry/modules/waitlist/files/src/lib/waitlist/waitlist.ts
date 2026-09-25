import "server-only";

import { randomBytes } from "node:crypto";

import { and, count, desc, eq, gt, lt, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { waitlistEntry, type WaitlistEntry } from "@/db/schema/waitlist";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function referralCode() {
  return Array.from(randomBytes(8), (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

/** Adds someone to the list (idempotent by email) and credits the referrer once. */
export async function joinWaitlist(input: { email: string; name?: string; ref?: string }) {
  const email = input.email.toLowerCase();
  const existing = await db.query.waitlistEntry.findFirst({
    where: eq(waitlistEntry.email, email),
  });
  if (existing) return { entry: existing, created: false };

  return db.transaction(async (tx) => {
    const [entry] = await tx
      .insert(waitlistEntry)
      .values({
        email,
        name: input.name,
        referralCode: referralCode(),
        referredBy: input.ref || null,
      })
      .onConflictDoNothing({ target: waitlistEntry.email })
      .returning();
    if (!entry) {
      const again = await tx.query.waitlistEntry.findFirst({
        where: eq(waitlistEntry.email, email),
      });
      return { entry: again!, created: false };
    }
    if (input.ref && input.ref !== entry.referralCode) {
      await tx
        .update(waitlistEntry)
        .set({ referrals: sql`${waitlistEntry.referrals} + 1` })
        .where(eq(waitlistEntry.referralCode, input.ref));
    }
    return { entry, created: true };
  });
}

/** 1-based position: more referrals first, then earlier sign-ups. */
export async function positionOf(entry: WaitlistEntry) {
  const [ahead] = await db
    .select({ value: count() })
    .from(waitlistEntry)
    .where(
      or(
        gt(waitlistEntry.referrals, entry.referrals),
        and(
          eq(waitlistEntry.referrals, entry.referrals),
          lt(waitlistEntry.createdAt, entry.createdAt),
        ),
      ),
    );
  return (ahead?.value ?? 0) + 1;
}

export async function waitlistSize() {
  const [total] = await db.select({ value: count() }).from(waitlistEntry);
  return total?.value ?? 0;
}

export async function findByCode(code: string) {
  return (
    (await db.query.waitlistEntry.findFirst({ where: eq(waitlistEntry.referralCode, code) })) ??
    null
  );
}

export async function allEntries() {
  return db
    .select()
    .from(waitlistEntry)
    .orderBy(desc(waitlistEntry.referrals), waitlistEntry.createdAt);
}
