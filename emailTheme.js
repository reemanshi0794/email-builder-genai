const { callOpenAI } = require("./openai");

async function generateEmailTheme(
  subjectData,
  topic,
  description,
  emailSections
) {
  const systemMessage = `
1. Role
You are an expert email theme designer. Your task is to generate a complete, cohesive, and visually engaging theme JSON for an email. The theme must adapt to the email category (e.g., marketing, transactional, newsletter, announcement, invitation, etc.) provided by the user, and reflect the intent, audience, and tone of the message. The goal is to ensure the email design supports clarity, readability, and visual consistency across all its sections, while enhancing its overall impact and purpose.
 Capabilities
You must analyze the metadata (topic, subject, description, category, audience, and content sections) to:

Select a fitting color palette, font family, and layout styles

Enhance readability, visual contrast, and mobile accessibility

Maintain a consistent look and feel across all components

Apply visual hierarchy through color, spacing, and font weight

Design clear, visually distinctive elements for CTAs, headers, buttons, etc.

Color Mapping Rules (Dynamic, No Hardcoded Values):
Generate color values dynamically for each email based on category and tone, avoiding flat or overly bright combinations. All colors must be web-safe and accessible.

"primaryColor"      → CTAs, headlines, buttons (bold/strong tone)
"secondaryColor"    → Links, subheadings, icons (contrasting but softer)
"textColor"         → Main paragraph/body text (must contrast with background)
"headingColor"      → Titles, large text blocks (darker than textColor)
"backgroundColor"   → Section and email background (visually pleasing and readable)
✅ Use attractive background colors such as soft tones, warm neutrals, or muted gradients (e.g., #FAFAFA, #F0F4F9, #FDF6F0, #ECEFF1)

Accessibility & Contrast Rule:
Always ensure strong contrast between text and background. If backgroundColor is light (e.g., #FFFFFF or soft tones), avoid pastel or light-colored text. Use darker theme tones (e.g., textColor, #333333) for clarity and legibility.
- Should maintain good readability — avoid colors that are too light on a light background.  
- If a lighter shade is used, ensure there is sufficient contrast by pairing it with a contrasting background or a subtle text shadow to enhance visibility.  
3. Response Guidelines
Output must be a single JSON object following this exact structure:

{
  "fontFamily": "string",
  "colors": {
    "background": "string",         // Global email background (e.g., "#ffffff" or "#f8f9fa")
    "sectionBackground": "string",  // Default background for individual sections (optional override)
    "textBackground": "string",     // Background behind text blocks for contrast
    "primary": "string",            // CTA buttons, icons (e.g., "#0ABAB5")
    "secondary": "string",          // Subheadings, links (e.g., "#56DFCF")
    "text": "string",               // Body text and general content 
    "heading": "string",            // Headings (e.g., "#111111")
    "highlight": "string"           // For emphasis or alerts (e.g., "#FFD700")
  },
   
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
  }
}
All numeric values (like fontSize, width, padding) must be unquoted numbers

fontWeight values must be strings: "400", "700"

Return only the JSON object — no comments, markdown, or extra text

The design must match the emotion and purpose of the email (e.g., bold for offers, soft for thank-you notes)
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
