// openai.js
require('dotenv').config();
const fetch = require('node-fetch');
const apiKey = process.env.OPENAI_API_KEY;

async function callOpenAI(systemMessage, userMessage) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ]
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "[No response]";
}

module.exports = { callOpenAI };
