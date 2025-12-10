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

  async updateMessageContent(
    messageId: string,
    newContent: string
  ): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      { content: newContent },
      { new: true }
    );
  }

  async deleteMessagesAfter(sessionId: string, date: Date): Promise<void> {
    await Message.deleteMany({
      sessionId: sessionId,
      createdAt: { $gt: date },
    });
  }
}

export default new ChatRepository();
