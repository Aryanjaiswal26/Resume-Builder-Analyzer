import OpenAI from "openai";

let client;

export const getOpenAIClient = () => {
  if (client) return client;
  if (!process.env.AI_API_KEY) {
    throw new Error("AI_API_KEY is missing. Add your Gemini API key to server/.env and restart.");
  }
  client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
  });
  return client;
};
