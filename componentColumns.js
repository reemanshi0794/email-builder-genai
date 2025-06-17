const { callOpenAI } = require("./openai");

// ✅ Step 1: Detect layout type based on section metadata
function getLayoutHint(section) {
  const id = (section?.id || "").toLowerCase();
  const title = (section?.title || "").toLowerCase();
  const summary = (section?.summary || section?.content?.map(c => c.summary).join(" ") || "").toLowerCase();

  const layoutHints = [
    {
      hint: "footer",
      match: [id, title, summary].some(text =>
        text.includes("footer") ||
        text.includes("legal") ||
        text.includes("unsubscribe") ||
        text.includes("support")
      )
    },
    {
      hint: "checkerboard",
      match: [id, title, summary].some(text =>
        text.includes("checkerboard") ||
        text.includes("side-by-side") ||
        text.includes("alternating") ||
        text.includes("comparison layout")
      )
    },
    {
      hint: "image-gallery",
      match: [id, title, summary].some(text =>
        text.includes("gallery") ||  text.includes("photos") ||
        text.includes("image grid") ||
        text.includes("highlights") ||
        text.includes("shared moments") ||
        text.includes("portfolio") ||
        text.includes("our work") ||
        text.includes("team gallery") ||
        text.includes("carousel")
      )
    },
    {
      hint: "upcoming-events",
      match: [id, summary].some(text => text.includes("event"))
    },
    {
      hint: "full-image-cta",
      match: summary.includes("full height") || title.includes("hero")
    },
    {
      hint: "portrait-icons",
      match: [id, title, summary].some(text =>
        text.includes("features") || text.includes("portrait") || text.includes("icon list")
      )
    },
    {
      hint: "image-left-text-right",
      match: [summary, title, id].some(text =>
        text.includes("short preview") ||
        text.includes("cta") ||
        text.includes("text and image") ||
        text.includes("call_to_action") ||
        text.includes("image left") ||
        text.includes("split layout")
      )
    },
    {
      hint: "testimonials",
      match: [id, title, summary].some(text =>
        text.includes("testimonial") ||
        text.includes("client feedback") ||
        text.includes("what our clients say") ||
        text.includes("quote") ||
        text.includes("customer review") ||
        text.includes("partner feedback")
      )
    }
  ];

  for (const { hint, match } of layoutHints) {
    if (match) return hint;
  }

  return "default";
}



async function generateColumnsComponent(section) {
  console.log("column section", section);
const layoutHint = getLayoutHint(section); // ✅ once
console.log("layoutHintlayoutHint",layoutHint)

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

🎯 Layout Hint: "${layoutHint}" – Use this as guidance to determine the structure, number of columns, and arrangement of content within the Columns component.

💡 Layout Types:

- **image-left-text-right**:  
  → Create 2 columns.  
  → Left Column: Image.  
  → Right Column: Text block(s), optional Button (e.g., CTA like “Redeem Now”).

- **checkerboard**:  
  → Use multiple columns or nested Columns inside each Column to alternate image and text.  
  → Example: Column 1 (Image + Text), Column 2 (Text + Image), and so on.

- **portrait-icons**:  
  → Create 3 or 4 equally spaced Columns.  
  → Each Column contains a vertically stacked Image (icon), short Text title, and a description.  
  → Use this for visual representations of benefits, services, or features.

- **image-gallery**:  
  → Use 3–6 Columns based on number of images.  
  → Each Column should contain only an Image component, optionally with alt text and title.  
  → Ideal for showcasing visual products, rewards, or team members.

-**testimonial:
  → Use 2 or 3 Columns to highlight testimonials.
  → Each Column contains:
   Quoted Text (with quotation marks in summary or props).
   Customer or partner name (Text).
   Optional image (customer photo or icon).
   Optional description of their role or company.
  → Style for clarity and authenticity, optionally include Divider or Spacer for visual separation.

- **full-image-cta**:  
  → One wide Column.  
  → Inside: A full-width Image (banner-style), a central CTA Button, and brief supporting Text.  
  → Use vertical Spacer components to visually balance spacing.

- **upcoming-events**:  
  → Use 2–3 Columns to display event details.  
  → Each Column may include: Event image, name (Text), date (Text), CTA (Button).  
  → Use Divider between events for clarity if vertical stacking is used inside Columns.

- **icon-text-grid** *(additional)*:  
  → Grid of 4–6 Columns.  
  → Each Column: Icon (Image), heading (Text), description (Text).  
  → Suitable for feature highlights or instructions.

- **bullet-lists** *(additional)*:  
  → Use 2 Columns:  
     - Left: Text with "bullet": true.  
     - Right: Supporting image or CTA.  
  → Good for how-to steps, instructions, or feature breakdowns.

- **footer**:  
  → Use 2–4 Columns as per email footer conventions:  
    - Column 1: Company logo + description  
    - Column 2: Contact info ("bullet": true)  
    - Column 3: Links (Privacy Policy, View in browser, etc.)  
    - Column 4 (optional): "Unsubscribe" (Button or Text with link).
    If social links (e.g., Facebook, Instagram) are present:
Use Image (logo) with props.navigateToUrl instead of Button

📌 Important:
- Use the layout hint *only as directional guidance*.  
- Base the final column count and arrangement on the actual content quantity and intent.

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
  📌 Layout Hint: "${layoutHint}" – This is a structural guide for rendering Columns.

 Please refine this section based on the provided title, purpose, and summary. If content is also provided, use it to inform the output. Generate a relevant and meaningful Text component for each content point.
Here’s the content for the section based on the provided details:

${JSON.stringify(
  {
    id: section.id,
    title: section.title,
    purpose: section.purpose,
    summary: section.summary,
    type: "Columns",
    layoutHint: layoutHint,
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
