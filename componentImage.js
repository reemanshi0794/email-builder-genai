const { callOpenAI } = require('./openai');

async function generateImageComponent(section) {
  const systemMessage = `
1. Role
You are tasked with generating a structured JSON object for a given UI component (e.g., Image, Text) based on the details provided in the user message. Each component must be assigned a unique and realistic ID.

2. Capabilities
You must adhere to the following rules when generating the component:

Component ID Format:
Each component must have a unique ID in this format:
timestamp-randomString-performanceHash
Example: "lzd45f-ab123-7x9fp"

Component Structure:
The object must be returned as:

{
  "uniqueId": {
    "type": "ComponentType",
    "data": {
      "props": { ... },
      "style": { ... }
    }
  }
}
Component: Image
Props Fields:
imageUrl: Required — Must be a valid, public image URL that does not return a 404.
Examples of acceptable sources:

Freepik: https://img.freepik.com/...

Cloudfront: https://d123456abcdef.cloudfront.net/images/...

Do not use:

Placeholder or dummy URLs (example.com, /images/test.jpg)


This ensures only working public URLs like Freepik or Cloudfront-hosted images are used.

Free stock image providers (e.g., Freepik, Pexels) with valid direct links.
Do NOT use:

Dummy or placeholder URLs (e.g., /images/placeholder.jpg, example.com)

altText: required
navigateToUrl: optional
Style Fields:
padding
textAlign
width (must be less than 100)
objectFit (can be "cover", “contain”)
borderRadius (optional)
Use the following theme JSON for consistent styles:
{
  "fontFamily": "Arial, sans-serif",
  "primaryColor": "#0056b3",
  "secondaryColor": "#e7f1ff",
  "textColor": "#333333",
  "backgroundColor": "#ffffff",
  "headingColor": "#222222",
  "fontWeight": {
    "heading": "700",
    "body": "400",
    "button": "600"
  },
  "fontSize": {
    "heading": 24,
    "subheading": 18,
    "body": 16,
    "button": 16
  },
  "lineHeight": {
    "heading": 1.5,
    "body": 1.6
  },
  "padding": {
    "section": { "top": 20, "right": 15, "bottom": 20, "left": 15 },
    "component": { "top": 10, "right": 10, "bottom": 10, "left": 10 }
  },
  "borderRadius": 5,
  "buttonStyle": {
    "textAlign": "center",
    "buttonPadding": { "top": 10, "right": 20, "bottom": 10, "left": 20 },
    "width": 100,
    "height": 40
  },
  "imageStyle": {
    "width": 100,
    "objectFit": "cover"
  }
}

3. Response Guidelines
Generate a valid JSON object using the provided structure and constraints.

All required props and style fields must be included with values sourced from the theme where applicable.

Ensure width < 100 and objectFit: "cover" for Image.

Use the component’s content and metadata from the user message.

Return only the final JSON object — no explanations or extra commentary.
`;

 const userMessage = `
Here’s the component details for the section based on the provided theme:

${JSON.stringify({
    id: section.id,
    title: section.title,
    purpose: section.purpose,
    summary: section.summary,
    type: "Image"
  }, null, 2)}

Please generate a JSON object for this component. Ensure that:
- The component has a unique ID in the format: timestamp-randomString-performanceHash.
- The \`props\` include \`imageUrl\`, \`altText\`, and an optional \`navigateToUrl\`.
- The \`style\` includes \`padding\`, \`textAlign\`, \`width\`, \`objectFit\`, and \`borderRadius\`.
- The \`width\` of the image must be less than 100 (set to an appropriate value).
- The \`objectFit\` should be set to "cover".
- The \`borderRadius\` should be optional and applied where needed.

Return the object in the following format with the relevant fields.
`;

  const response = await callOpenAI(systemMessage, userMessage);
  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateImageComponent };