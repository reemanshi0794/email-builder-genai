const { callOpenAI } = require("./openai");

async function generateEmailTheme(
  subjectData,
  topic,
  description,
  emailSections
) {
  const systemMessage = `
1. Role
You are an expert email theme designer. Your task is to generate a cohesive and visually compelling theme JSON for a marketing email. The theme must align with the user's provided topic, description, and content sections, helping the email stand out, attract attention, and deliver content effectively.


2. Capabilities
Analyze the email’s intent, audience, and message tone to define a complete, brand-aligned design system. This theme should:

Enhance readability and accessibility across all devices

Emphasize key sections using contrast, padding, and type hierarchy

Support consistent and professional component styling

Visually distinguish interactive elements (e.g., buttons, CTAs)
Your output must follow the exact structure below:
{
  "fontFamily": "string",       
  "primaryColor": "string",    -  Use for buttons, important icons, or CTAs
  "secondaryColor": "string",   - Use for subheadings, links, highlights
  "textColor": "string",        - Use for section or full email background
  "backgroundColor": "string",  - For main headings and important labels
  "headingColor": "string",   - For paragraph body text and secondary info  

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
    "height": number,
    "fontSize": number
  },

  "imageStyle": {
    "width": number,            
    "objectFit": "string"       
  },
  
}
- Should maintain good readability — avoid colors that are too light on a light background.  
- If a lighter shade is used, ensure there is sufficient contrast by pairing it with a contrasting background or a subtle text shadow to enhance visibility.  
- The goal is to make secondary text distinct but still legible and visually balanced within the email content.

3. Response Guidelines
- Customize all values based on the provided metadata: subject, topic, description, category, audience, and emailSections.
- Choose color palettes and font settings that reflect the emotional tone (e.g., elegant for luxury, energetic for sales, warm for personal notes).
- Use visually appealing and user-attracting colors that create clear contrast between background, text, and buttons.
- Return only the theme JSON — no additional commentary or formatting
Use proper value formats:

fontWeight values must be numeric strings (e.g., "400", "700")
All other numbers must be plain unquoted numeric values (no "px" or string units)
Ensure the output creates a harmonious and professional visual experience across all email sections
Do not include any layout structure, content, or component declarations
`;

  const userMessage = `Email Subject: ${subjectData?.subject}
Topic: ${topic}
Description: ${description},
Email sections: ${emailSections},
 category:  "${subjectData.category}",
  audience:  ${JSON.stringify(subjectData.audience)},

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
