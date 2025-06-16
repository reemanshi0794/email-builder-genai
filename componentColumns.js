const { callOpenAI } = require("./openai");

async function generateColumnsComponent(section) {
  console.log("column section", section);
  const systemMessage = `
🧠 Role
  You are a content structuring assistant specialized in generating meaningful, contextually relevant, and well-organized email template components. Your task is to return a Columns component only when the requested component type is "Columns," using the provided section’s title, purpose, and summary as guidance.
  
📦 Capabilities – Columns Component
✅ Structure
-Return one parent Columns component with a childrenIds array.
-Each child in childrenIds must be a Column object.  
-The number of Column components should reflect the content's intent — do not hardcode or default to a fixed number.
-Inside each Column, combine diverse and meaningful components to create visually engaging and contextually rich layouts.
-Avoid Column children made up of only Text blocks.

### ✳️ Allowed Component Types Inside a Column:
You may use any of the following:
["Text", "Button", "Image", "Spacer", "Divider", "Columns"]
Component Use Guidelines:
Text: For headings, descriptions, and highlights. Add "bullet": true if list-style presentation is appropriate.
Button: For clear calls-to-action like “Shop Now” or “Contact Support”.
Image: Use imageUrl and optional alt. Ideal for logos, product visuals, icons.
Spacer: Use to separate components vertically and improve visual flow.  Vertical spacing for readability
Divider: For visual segmentation of grouped elements.
Columns: Allow nesting for more complex layouts where necessary.

Ensure every component inside a Column includes:
type, title, purpose, summary
When content is list-like or structured, add "bullet": true to Text components.


🧩 Special Rule — Footer Section Handling
If ${section?.id
    .toLowerCase()
    .includes("footer")}, follow email footer conventions:

Recommended Footer Layout (2–4 Columns):
- **Column 1**: Company name, logo (Image), and description (Text)
- **Column 2**: Contact details (Text bullets, "bullet": true)
- **Column 3**: Useful links — e.g., "View in browser", "Privacy Policy", "Help Center" (Text with props.navigateToUrl)
- **Column 4** *(optional)*: "Unsubscribe" (Button or Text with link)

✅ Anchor-style links should use "Text" or "Button" with "props.navigateToUrl".

✅ Use short and clear titles like “Contact Us”, “Unsubscribe”, “Legal”, etc.

✅ Ensure visual spacing and divider usage improves clarity.
  
  Response Guidelines
  
  Only respond when the requested component type is "Columns".
  
  Return exactly one parent Columns component.
  
  The Columns component must have one or more Column children — the number should reflect actual content needs, never a fixed number.
  
  Each Column must contain diverse and unique components, combining different allowed types to avoid repetitive, text-only children.
  
  Avoid repeating the same internal structure across Columns; vary component types and layout within each Column for a rich, dynamic email section.
  Inside each Column:

Use different valid component types.

Ensure each component inside every Column has a unique:
type, title, purpose, summary

  Response Format
  
  Return a raw JSON array of components only.
  
  Each component must include at minimum the type, title, purpose, summary, and when applicable, content, imageUrl, props, style, and childrenIds.
  
  Do not include markdown, comments, or explanations.
 {
  "type": "Columns",
  "childrenIds": [
    {
      "type": "Column",
      "childrenIds": [
        {
          "type": "Text",
          "title": "string",
          "purpose": "string",
          "summary": "string"
        },
        {
          "type": "Image",
          "imageUrl": "...",
          "title": "string",
          "purpose": "string",
          "summary": "string"
        },
        {
          "type": "Button",
          "content": "...",
          "title": "string",
          "purpose": "string",
          "summary": "string"
        }
      ]
    },
    {
      "type": "Column",
      "childrenIds": [
        {
          "type": "Text",
          "title": "string",
          "purpose": "string",
          "summary": "string"
        },
        {
          "type": "Divider",
          "title": "string",
          "purpose": "string",
          "summary": "string"
        },
        {
          "type": "Spacer",
          "title": "string",
          "purpose": "string",
          "summary": "string"
        }
      ]
    }
  ]
}

`;

  const userMessage = `
 Please refine this section based on the provided title, purpose, and summary. If content is also provided, use it to inform the output. Generate a relevant and meaningful Text component for each content point.
Here’s the content for the section based on the provided details:

${JSON.stringify(
  {
    id: section.id,
    title: section.title,
    purpose: section.purpose,
    summary: section.summary,
    type: "Columns",
  },
  null,
  2
)}

Please generate the content using only the allowed component types:
["Text", "Button", "Image", "Columns", "Spacer", "Divider"].

Return a single Columns component.

The number of Column children should be flexible and based entirely on the distinct content points available—there is no fixed number. Generate as many columns as needed, including one or more.

Each Column must:

Contain a unique and meaningful combination of components.

Be contextually relevant to the given title, purpose, and summary.

Avoid duplicating the structure or content of other columns.
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
