import { z } from "zod";

export const idParamSchema = z.object({
  id: z.uuid("id must be a valid UUID"),
});

export type IdParams = z.infer<typeof idParamSchema>;
