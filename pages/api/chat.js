import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;

    // Context: health and medical assistance only
    const medicalContext = `
      You are a medical assistant trained to provide accurate information about health and medicine. 
      Your responses should be based on reliable medical knowledge. 
      Only answer questions directly related to health, medical conditions, treatments, medications, nutrition, and wellness. 
      If a user asks about topics outside of health and medicine, respond courteously: 
      "I'm sorry, but I can only assist with health and medical topics. If you have any health-related questions, feel free to ask!"
    `;

    const generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [
          { role: "user", parts: [{ text: medicalContext }] }, // Context as first user message
          { role: "user", parts: [{ text: message }] }, // User message from request
        ],
      });

      const result = await chatSession.sendMessage(message);
      let responseText = result.response.text();

      // Remove asterisks from the response
      responseText = responseText.replace(/\*/g, '').trim(); // Remove all '*' characters

      // Format numbered lists
      responseText = formatNumberedLists(responseText);

      res.status(200).json({ response: responseText });
    } catch (error) {
      console.error("Error generating response:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Function to format numbered lists in the response text
function formatNumberedLists(text) {
  const listPattern = /(\d+)\.\s/g; // Match numbered list items (e.g., "1. ", "2. ")
  return text.split('\n').map(line => {
    if (listPattern.test(line)) {
      // If the line matches the list pattern, format it
      return line.replace(listPattern, (match) => `${match.replace('.', '')}. `); // Adjust numbering
    }
    return line;
  }).join('\n');
}
