import axios from "axios";
import config from "../config/index";
import { IAIService, IChatPayload } from "../interfaces/IAIService";

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaService implements IAIService {
  async generateResponse(messages: IChatPayload[]): Promise<string> {
    try {
      const payload = {
        model: config.ollamaModel,
        messages: messages,
        stream: false,
      };

      console.log(
        `Sending request to Ollama (Model: ${config.ollamaModel})...`
      );

      const response = await axios.post<OllamaResponse>(
        config.ollamaApiUrl,
        payload
      );

      return response.data.message.content;
    } catch (error: any) {
      console.error("Ollama Error:", error.message);
      throw new Error("AI Service is unavailable.");
    }
  }
}

export default new OllamaService();
