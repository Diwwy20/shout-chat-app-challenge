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
  isExcluded?: boolean;
}

export interface SendMessagePayload {
  sessionId: string;
  content: string;
}

export interface SendMessageResponse {
  userMessage: IMessage;
  aiMessage: IMessage;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
