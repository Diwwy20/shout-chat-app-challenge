export interface IChatPayload {
  role: string;
  content: string;
}

export interface IAIService {
  generateResponse(
    messages: IChatPayload[],
    signal?: AbortSignal
  ): Promise<string>;
}
