// src/api/chatgpt.js
import axios from 'axios';

// Set your OpenAI API key in .env file as REACT_APP_OPENAI_API_KEY
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const callChatGPT = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },  
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling ChatGPT API:", error);
    return null;
  }
};
