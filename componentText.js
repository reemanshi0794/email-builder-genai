const { callOpenAI } = require('./openai');

async function generateTextComponent(emailTheme, section) {
  console.log("texttttexttt",section)
  const systemMessage = `
  1. Role
  You are tasked with generating a structured JSON object representing a Text component. Using the provided title, purpose, and summary, extract key meaningful points and create a concise, engaging, and relevant text string for the component’s content (data.props.text). Each component must adhere to the specified theme and formatting rules.
  
  2. Capabilities
  
  The response must be a single JSON object.
  
  Component ID Format:
  Each component must have a unique ID in the format:
  timestamp-randomString-performanceHash
  Example: "lzd45f-ab123-7x9fp"
  
  Component Structure:

  {
    "unique-id": {
      "type": "Text",
      "data": {
        "style": {
          // styling properties here
        },
        "props": {
          // content and optional fields here
        }
      }
    }
  }
  Styling Requirements (inside data.style):
  
  "fontWeight" must be a numeric string (e.g., "400").
  
  lineHeight is always numerically equal to fontSize.  
  Include these style properties:
  fontWeight, color, fontFamily, fontSize, lineHeight, textAlign, padding, backgroundColor
  
  Use "textAlign": "left" by default (unless otherwise specified).
  
  Use padding values from the theme under "component" padding.
  
  Mandatory style properties:
- fontWeight
- color
- fontFamily
- fontSize
- lineHeight - always equal to fontSize
- textAlign
- padding-   must exactly follow this structure (values can be any number):

{
"top": <number>,
"right": <number>,
"bottom": <number>,
"left": <number>
}
- backgroundColor

  Props Requirements (inside data.props):
  
  "text": A compelling, relevant, and well-crafted content string derived from the title, purpose, and summary (required).
  
  "navigateToUrl": Optional — set to an empty string if not provided.
  Theme Usage
  Use the provided theme JSON object to determine all styling values for font, colors, spacing, etc.
  Theme for styling values:
  
${JSON.stringify(emailTheme, null, 2)}.

  3. Response Guidelines
  
  Generate and return only the final JSON object.
  
  Ensure the text content (data.props.text) is attractive, relevant, and aligned with the title, purpose, and summary provided.
  
  Apply all required styles and props exactly as per theme and formatting rules.
  
  Do not include any explanations, comments, or extra text outside the JSON.
`;
console.log("textsection",section)

  const userMessage = `
Here’s the component definition. Please return a JSON object with the unique component ID as the key, and the component structure as the value. Use the theme provided in the system message to set styling.

${JSON.stringify({
    id: section.id,
    title: section.title,
    purpose: section.purpose,
    summary: section.summary,
    type: section.componentType
  }, null, 2)}
`;

  const response = await callOpenAI(systemMessage, userMessage);
  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateTextComponent };
