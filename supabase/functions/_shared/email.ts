import { z } from "zod";

export const SendData = z.object({
  to: z.string(),
  subject: z.string(),
  html: z.string(),
});
export type SendData = z.infer<typeof SendData>;
