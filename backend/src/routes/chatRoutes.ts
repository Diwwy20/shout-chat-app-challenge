import { Router } from "express";
import chatController from "../controllers/ChatController";
import { validateRequest } from "../middleware/validateRequest";
import {
  sendMessageSchema,
  getHistorySchema,
} from "../validators/chatValidators";

const router = Router();

router.get(
  "/history/:sessionId",
  validateRequest(getHistorySchema),
  chatController.getHistory
);

router.post(
  "/message",
  validateRequest(sendMessageSchema),
  chatController.sendMessage
);

router.put("/message/:messageId", chatController.regenerateMessage);

router.delete("/message/:messageId", chatController.deleteMessage);

router.delete(
  "/history/:sessionId",
  validateRequest(getHistorySchema),
  chatController.clearHistory
);

export default router;
