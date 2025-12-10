import { IAIService } from "../interfaces/IAIService";
import { ChatRepository } from "../repositories/ChatRepository";
import { MessageRole } from "../models/Message";

import ollamaService from "./OllamaService";
import chatRepositoryInstance from "../repositories/ChatRepository";

export class ChatService {
  private aiService: IAIService;
  private chatRepository: ChatRepository;

  constructor(aiService: IAIService, chatRepository: ChatRepository) {
    this.aiService = aiService;
    this.chatRepository = chatRepository;
  }

  async processUserMessage(sessionId: string, userContent: string) {
    await this.chatRepository.createMessage(
      sessionId,
      MessageRole.USER,
      userContent
    );

    const history = await this.chatRepository.getMessagesBySession(sessionId);

    const chatHistoryForAI = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let aiResponseContent = "";
    try {
      aiResponseContent = await this.aiService.generateResponse(
        chatHistoryForAI
      );
    } catch (error) {
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
}

const chatService = new ChatService(ollamaService, chatRepositoryInstance);

export default chatService;
