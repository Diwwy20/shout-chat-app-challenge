import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shout-chat",
  ollamaApiUrl: process.env.OLLAMA_API_URL || "http://127.0.0.1:11434/api/chat",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};

if (!config.mongoUri) {
  throw new Error("FATAL ERROR: MONGO_URI is not defined.");
}

export default config;
