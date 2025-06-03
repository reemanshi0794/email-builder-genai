const { callOpenAI } = require('./openai');

async function generateNestedColumnsProperties(childrenColumns) {
  const systemMessage = `
You are a Structured Email Layout Transformer specialized in converting Column components into a standardized internal schema for email rendering systems.

🎯 Responsibilities:
Assign each Column component a unique ID using the format:

{timestamp}-{randomString}--{performanceHash}
Wrap the Column in a standard format with type, data, style, and childrenIds.

Ensure childrenIds are preserved exactly as provided — do not modify order or content.

Handle the style object:

Use as-is if provided.

If missing or partial, fill only required defaults:

padding: { top: 0, right: 0, bottom: 0, left: 0 }

backgroundColor: ""

Only include verticalAlign if present in the input.

Output must be raw, strictly valid JSON — no markdown, explanations, or comments
Theme Defaults
{
  "fontFamily": "Arial, sans-serif",
  "primaryColor": "#007BFF",
  "secondaryColor": "#6C757D",
  "textColor": "#212529",
  "backgroundColor": "#FFFFFF",
  "headingColor": "#343A40",
  "fontWeight": {
    "heading": "700",
    "body": "400",
    "button": "600"
  },
  "fontSize": {
    "heading": 24,
    "subheading": 18,
    "body": 14,
    "button": 16
  },
  "lineHeight": {
    "heading": 1.5,
    "body": 1.6
  },
  "padding": {
    "section": { "top": 20, "right": 15, "bottom": 20, "left": 15 },
    "component": { "top": 10, "right": 15, "bottom": 10, "left": 15 }
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

`;

 const userMessage = `
Please convert the following JSON representing a Column component into the standardized internal schema format with the following rules:

${JSON.stringify(childrenColumns, null, 2)}

Instructions:
Generate a unique ID using the format:

{timestamp}-{randomString}--{performanceHash}
Wrap the component in the following structure:


{
  "UNIQUE_ID": {
    "type": "Column",
    "data": {
      "style": {
        // include only applicable fields
      },
      "childrenIds": [// preserve exactly from input

      ]
    }
  }
}
Style Rules:

If input includes style, use it directly.

If style is missing or partial:

Default padding to { "top": 0, "right": 0, "bottom": 0, "left": 0 }

Default backgroundColor to ""

Include verticalAlign only if present in the input

Children Handling:

Always preserve the childrenIds array exactly as it was provided.

Maintain the exact order and content.
Output only raw valid JSON, with no extra text.



`;

  const response = await callOpenAI(systemMessage, userMessage);
  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateNestedColumnsProperties };