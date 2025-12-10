import { IAIService } from "../interfaces/IAIService";
import { ChatRepository } from "../repositories/ChatRepository";
import { MessageRole } from "../models/Message";
import ollamaService from "./OllamaService";
import chatRepositoryInstance from "../repositories/ChatRepository";
import { AppError } from "../utils/AppError"; // อย่าลืม import AppError
import Message from "../models/Message"; // ต้องใช้ Model เพื่อ findById ในบางเคส

export class ChatService {
  private aiService: IAIService;
  private chatRepository: ChatRepository;

  constructor(aiService: IAIService, chatRepository: ChatRepository) {
    this.aiService = aiService;
    this.chatRepository = chatRepository;
  }

  async processUserMessage(sessionId: string, userContent: string) {
    // 1. Save User Message
    await this.chatRepository.createMessage(
      sessionId,
      MessageRole.USER,
      userContent
    );

    // 2. Get History & Generate AI Response
    return await this.generateAIResponse(sessionId);
  }

  // แยก Logic การคุยกับ AI ออกมาเป็น Function กลาง จะได้ใช้ซ้ำได้
  private async generateAIResponse(sessionId: string) {
    const history = await this.chatRepository.getMessagesBySession(sessionId);

    // Context Window Limiter: ถ้า history ยาวมาก ตัดส่งแค่ 20-30 อันล่าสุดก็ได้
    // const recentHistory = history.slice(-20);

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

  // --- ฟังก์ชันใหม่: Edit & Regenerate (Atomic Operation) ---
  async editAndRegenerate(messageId: string, newContent: string) {
    // 1. หาข้อความต้นทาง
    // ใช้ Message Model โดยตรงหรือเพิ่ม method ใน repository ก็ได้
    // ในที่นี้สมมติว่าเรียกผ่าน Mongoose Model ตรงๆ เพื่อความไว
    const targetMessage = await Message.findById(messageId);
    if (!targetMessage) {
      throw new AppError("Message not found", 404);
    }

    // 2. อัปเดตเนื้อหาใหม่
    targetMessage.content = newContent;
    await targetMessage.save();

    // 3. ลบ "อนาคต" ทิ้ง (ข้อความที่คุยหลังจากนี้ทั้งหมด)
    await this.chatRepository.deleteMessagesAfter(
      targetMessage.sessionId,
      targetMessage.createdAt
    );

    // 4. ให้ AI ตอบใหม่ (จากจุดนี้)
    const aiMessage = await this.generateAIResponse(targetMessage.sessionId);

    return { userMessage: targetMessage, aiMessage };
  }
}

const chatService = new ChatService(ollamaService, chatRepositoryInstance);

export default chatService;
