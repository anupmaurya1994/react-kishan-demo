import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

// 🔥 Explicitly load environment variables
dotenv.config();

if (!process.env.DEEPSEEK_API_KEY) {
  console.error("❌ DEEPSEEK_API_KEY is missing from .env file");
}

const llm = new ChatOpenAI({
  modelName: "deepseek-chat",
  temperature: 0.3,
  // Use both for compatibility across LangChain versions
  apiKey: process.env.DEEPSEEK_API_KEY,
  openAIApiKey: process.env.DEEPSEEK_API_KEY,
  configuration: {
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  },
});

export default llm;