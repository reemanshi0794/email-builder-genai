const { callOpenAI } = require('./openai');

async function generateEmailTheme(subjectData,topic, description,emailSections) {
  const systemMessage = `
1. Role
You are an expert email theme designer. Your task is to generate a cohesive and visually compelling theme JSON for a marketing email. The theme must align with the user's provided topic, description, and content sections, helping the email stand out, attract attention, and deliver content effectively.


2. Capabilities
Use the topic, description, and intended purpose of the email to define a unified design system that enhances readability, emphasizes key content, and encourages user interaction. Your theme must include typography, color palette, spacing, and component styling that look attractive, consistent, and on-brand.
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
- Tailor all values based on the topic, description, and section content to create a theme that enhances emotional impact and supports the message's tone (e.g., cheerful for birthdays, sleek for product launches, urgent for cart abandonment).
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
