import apiClient from "@/lib/axios";
import {
  ApiResponse,
  IMessage,
  SendMessagePayload,
  SendMessageResponse,
} from "@/types/chat";

export const chatService = {
  getHistory: async (sessionId: string): Promise<IMessage[]> => {
    const { data } = await apiClient.get<ApiResponse<IMessage[]>>(
      `/chat/history/${sessionId}`
    );
    return data.data;
  },

  sendMessage: async (
    payload: SendMessagePayload,
    signal?: AbortSignal
  ): Promise<SendMessageResponse> => {
    const { data } = await apiClient.post<ApiResponse<SendMessageResponse>>(
      "/chat/message",
      payload,
      { signal }
    );
    return data.data;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/chat/message/${messageId}`);
  },

  clearHistory: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/chat/history/${sessionId}`);
  },

  regenerateMessage: async (
    messageId: string,
    newContent: string
  ): Promise<void> => {
    await apiClient.put(`/chat/message/${messageId}`, {
      content: newContent,
    });
  },
};
