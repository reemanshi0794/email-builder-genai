const { callOpenAI } = require('./openai');

async function generateColumnsComponent(section) {
  console.log("column section",section)
  const systemMessage = `
  Role
  You are a content structuring assistant specialized in generating meaningful, contextually relevant, and well-organized email template components. Your task is to return a Columns component only when the requested component type is "Columns," using the provided section’s title, purpose, and summary as guidance.
  
  Capabilities – Columns Component
  
  Return a single Columns component containing a childrenIds array.
  
  Each child in the array must be a Column component.
  
  The number of Columns is flexible and depends on the content context — do not hardcode to a fixed number.
  
  Each Column must contain a combination of different allowed component types to create rich, visually engaging, and meaningful content aligned with the section’s title, purpose, and summary. Avoid using only text components.
  
  Allowed component types inside a Column:
  ["Text", "Button", "Image", "Spacer", "Divider", "Columns"]
  
  Use these component types thoughtfully:
  
  Text: Headings, descriptions, or feature highlights
  
  Button: Calls-to-action like "Buy Now," "Learn More"
  
  Image: Product images, icons, or visual aids
  
  Spacer: Vertical spacing for readability
  
  Divider: Visual separation of content blocks
  
  Columns: For nested column layouts
  
  Response Guidelines
  
  Only respond when the requested component type is "Columns".
  
  Return exactly one parent Columns component.
  
  The Columns component must have one or more Column children — the number should reflect actual content needs, never a fixed number.
  
  Each Column must contain diverse and unique components, combining different allowed types to avoid repetitive, text-only children.
  
  Avoid repeating the same internal structure across Columns; vary component types and layout within each Column for a rich, dynamic email section.
  
  Response Format
  
  Return a raw JSON array of components only.
  
  Each component must include at minimum the type, and when applicable, content, imageUrl, props, style, and childrenIds.
  
  Do not include markdown, comments, or explanations.
  {
    "type": "Columns",
    "childrenIds": [
      {
        "type": "Column",
        "childrenIds": [
          {"type": "Text", "content": "..."},
          {"type": "Image", "imageUrl": "..."},
          {"type": "Button", "content": "..."}
        ]
      },
      {
        "type": "Column",
        "childrenIds": [
          {"type": "Text", "content": "..."},
          {"type": "Divider"},
          {"type": "Spacer"}
        ]
      }
      // Additional Columns as needed
    ]
  }
`;

 const userMessage = `
 Please refine this section based on the provided title, purpose, and summary. If content is also provided, use it to inform the output. Generate a relevant and meaningful Text component for each content point.
Here’s the content for the section based on the provided details:

${JSON.stringify({
    id: section.id,
    title: section.title,
    purpose: section.purpose,
    summary: section.summary,
    type: "Columns"
  }, null, 2)}

Please generate the content using only the allowed component types:
["Text", "Button", "Image", "Columns", "Spacer", "Divider"].

Return a single Columns component.

The number of Column children should be flexible and based entirely on the distinct content points available—there is no fixed number. Generate as many columns as needed, including one or more.

Each Column must contain unique, meaningful content that aligns with the section’s title, purpose, and summary.

Within each Column, you may use any of the allowed component types (Text, Button, Image, Spacer, Divider, or nested Columns).

Return only the raw JSON—no markdown or explanations

`;

  const response = await callOpenAI(systemMessage, userMessage);
  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateColumnsComponent };