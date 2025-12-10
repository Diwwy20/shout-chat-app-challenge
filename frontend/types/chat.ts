export enum MessageRole {
  USER = "user",
  AI = "assistant",
}

export interface IMessage {
  _id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  modelUsed?: string;
}

export interface SendMessagePayload {
  sessionId: string;
  content: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
