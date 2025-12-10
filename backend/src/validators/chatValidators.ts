import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, "Session ID is required"),
    content: z
      .string()
      .min(1, "Content cannot be empty")
      .max(500, "Content too long"),
  }),
});

export const getHistorySchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, "Session ID is required"),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];
export type GetHistoryParams = z.infer<typeof getHistorySchema>["params"];
