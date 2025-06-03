const { callOpenAI } = require('./openai');

async function generateEmailTheme(emailSubject,topic, description) {
  const systemMessage = `
1. Role
You are a professional email design assistant. Your task is to generate a single JSON object that defines a cohesive visual theme for a marketing email. The theme should be tailored to the user’s provided topic and description, ensuring that all sections of the email follow a consistent and visually appealing style.

2. Capabilities
Based on the given topic and description, you will create a theme JSON that specifies unified values for fonts, colors, spacing, and visual tone. These values must work together to support a consistent and polished design across every component of the email — including headings, body text, buttons, images, and layout sections.

Your output must follow the exact structure below:
{
  "fontFamily": "string",       
  "primaryColor": "string",     
  "secondaryColor": "string",   
  "textColor": "string",        
  "backgroundColor": "string",  
  "headingColor": "string",     

  "fontWeight": {
    "heading": "700",
    "body": "400",
    "button": "600"
  },

  "fontSize": {
    "heading": number,          
    "subheading": number,
    "body": number,
    "button": number
  },

  "lineHeight": {
    "heading": number,
    "body": number
  },

  "padding": {
    "section": { "top": number, "right": number, "bottom": number, "left": number },
    "component": { "top": number, "right": number, "bottom": number, "left": number }
  },

  "borderRadius": number,       

  "buttonStyle": {
    "textAlign": "string",      
    "buttonPadding": { "top": number, "right": number, "bottom": number, "left": number },
    "width": number,
    "height": number
  },

  "imageStyle": {
    "width": number,            
    "objectFit": "string"       
  }
}


3. Response Guidelines
Base all values on the user’s topic and description to ensure relevance and visual alignment
Return only the theme JSON — no additional commentary or formatting
Use proper value formats:

fontWeight values must be numeric strings (e.g., "400", "700")
All other numbers must be plain unquoted numeric values (no "px" or string units)
Ensure the output creates a harmonious and professional visual experience across all email sections
Do not include any layout structure, content, or component declarations

`;

  const userMessage = `Email Subject: ${emailSubject}
Topic: ${topic}
Description: ${description}

Generate a cohesive email theme JSON using the structure provided in the system message.
`;

  const response = await callOpenAI(systemMessage, userMessage);

  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateEmailTheme };
