import Message, { IMessage, MessageRole } from "../models/Message";

export class ChatRepository {
  async createMessage(
    sessionId: string,
    role: MessageRole,
    content: string
  ): Promise<IMessage> {
    const message = await Message.create({
      sessionId,
      role,
      content,
    });
    return message;
  }

  async getMessagesBySession(sessionId: string): Promise<IMessage[]> {
    return await Message.find({ sessionId }).sort({ createdAt: 1 }).exec();
  }

  async deleteMessage(messageId: string): Promise<void> {
    await Message.findByIdAndDelete(messageId);
  }

  async clearSession(sessionId: string): Promise<void> {
    await Message.deleteMany({ sessionId });
  }
}

export default new ChatRepository();
