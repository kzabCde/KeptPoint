import { z } from "zod";

export const programTypeSchema = z.enum(["points", "stamps", "hybrid"]);
export const visibilitySchema = z.enum(["public", "private", "invite_only"]);

export const createProgramSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).default(""),
  programType: programTypeSchema,
  visibility: visibilitySchema.default("public"),
  currencyName: z.string().trim().min(1).max(30).default("Points"),
  requiredStamps: z.coerce.number().int().min(2).max(100).optional(),
}).superRefine((value, ctx) => {
  if ((value.programType === "stamps" || value.programType === "hybrid") && !value.requiredStamps) {
    ctx.addIssue({ code: "custom", path: ["requiredStamps"], message: "requiredStamps is required for stamp and hybrid programs" });
  }
});

export const issueAmountSchema = z.object({
  programId: z.string().uuid(),
  memberId: z.string().uuid(),
  amount: z.coerce.number().int().positive().max(1_000_000),
  note: z.string().trim().max(240).optional(),
  idempotencyKey: z.string().uuid(),
});
