import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { upload } from "@/db/schema/uploads";

/** Checklist item for the onboarding module (ignored when it isn't installed). */
export const uploadsOnboardingTask = {
  id: "first-upload",
  title: "Upload your first file",
  description: "Images, PDFs and documents, stored privately.",
  href: "/files",
  done: async (userId: string) =>
    !!(await db.query.upload.findFirst({
      where: and(eq(upload.userId, userId), eq(upload.status, "ready")),
      columns: { id: true },
    })),
};
