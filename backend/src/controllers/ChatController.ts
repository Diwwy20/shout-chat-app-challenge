import { Request, Response } from "express";
import chatService from "../services/ChatService";
import { asyncHandler } from "../utils/asyncHandler";
import {
  SendMessageInput,
  GetHistoryParams,
} from "../validators/chatValidators";

export class ChatController {
  sendMessage = asyncHandler(
    async (req: Request<{}, {}, SendMessageInput>, res: Response) => {
      const { sessionId, content } = req.body;

      const result = await chatService.processUserMessage(sessionId, content);

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params as unknown as GetHistoryParams;

    const history = await chatService.getHistory(sessionId);

    res.status(200).json({
      success: true,
      data: history,
    });
  });

  deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    await chatService.deleteMessage(messageId);
    res.status(200).json({ success: true, message: "Message deleted" });
  });

  clearHistory = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params as unknown as GetHistoryParams;

    await chatService.clearHistory(sessionId);

    res.status(200).json({
      success: true,
      message: "Chat history cleared",
    });
  });
}

export default new ChatController();
