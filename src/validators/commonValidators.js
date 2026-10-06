import { z } from "zod";

export const idParamSchema = z.object({
  id: z.uuid("id must be a valid UUID"),
});
