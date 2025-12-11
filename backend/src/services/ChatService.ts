import { IAIService } from "../interfaces/IAIService";
import { ChatRepository } from "../repositories/ChatRepository";
import { MessageRole } from "../models/Message";
import ollamaService from "./OllamaService";
import chatRepositoryInstance from "../repositories/ChatRepository";
import { AppError } from "../utils/AppError";
import Message from "../models/Message";
import axios from "axios";

export class ChatService {
  private aiService: IAIService;
  private chatRepository: ChatRepository;

  constructor(aiService: IAIService, chatRepository: ChatRepository) {
    this.aiService = aiService;
    this.chatRepository = chatRepository;
  }

  async processUserMessage(
    sessionId: string,
    userContent: string,
    signal?: AbortSignal
  ) {
    const userMessage = await this.chatRepository.createMessage(
      sessionId,
      MessageRole.USER,
      userContent
    );

    const aiMessage = await this.generateAIResponse(sessionId, signal);

    return { userMessage, aiMessage };
  }

  private async generateAIResponse(sessionId: string, signal?: AbortSignal) {
    const history = await this.chatRepository.getMessagesBySession(sessionId);

    const chatHistoryForAI = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let aiResponseContent = "";
    try {
      aiResponseContent = await this.aiService.generateResponse(
        chatHistoryForAI,
        signal
      );
    } catch (error) {
      if (axios.isCancel(error) || signal?.aborted) {
        throw new AppError("Generation aborted by user", 499);
      }

      console.error("AI Error:", error);
      aiResponseContent = "ขออภัย ระบบ AI ไม่พร้อมใช้งานในขณะนี้";
    }

    const aiMessage = await this.chatRepository.createMessage(
      sessionId,
      MessageRole.AI,
      aiResponseContent
    );

    return aiMessage;
  }

  async getHistory(sessionId: string) {
    return await this.chatRepository.getMessagesBySession(sessionId);
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.chatRepository.deleteMessage(messageId);
  }

  async clearHistory(sessionId: string): Promise<void> {
    await this.chatRepository.clearSession(sessionId);
  }

  async editAndRegenerate(
    messageId: string,
    newContent: string,
    signal?: AbortSignal
  ) {
    const targetMessage = await Message.findById(messageId);
    if (!targetMessage) {
      throw new AppError("Message not found", 404);
    }

    targetMessage.content = newContent;
    await targetMessage.save();

    await this.chatRepository.deleteMessagesAfter(
      targetMessage.sessionId,
      targetMessage.createdAt
    );

    const aiMessage = await this.generateAIResponse(
      targetMessage.sessionId,
      signal
    );

    return { userMessage: targetMessage, aiMessage };
  }
}

const chatService = new ChatService(ollamaService, chatRepositoryInstance);

export default chatService;
