const { callOpenAI } = require('./openai');

async function generateColumnsProperties(emailTheme,column) {
  const systemMessage = `
1. Role:
You are a Structured Email Layout Transformer. Your task is to normalize user-provided JSON component structures (e.g., type: "Columns") into a strict internal schema. Each top-level component must be assigned a unique key and enriched with standardized data.style, data.props, and embedded childrens. Apply default theme values when explicit styles or props are missing.

2. Capabilities:

Generate Unique Component Keys
For each top-level component, generate a unique ID in the format:
timestamp-randomString-performanceHash
Example: m82rlyqq-i6vto-4y105g

Wrap Component with Standard Schema
Wrap the input JSON using the generated ID and structure as:
{
  "UNIQUE_ID": {
    "type": "ComponentType",
    "data": {
      "style": { ... },      // from input or theme defaults
      "props": { ... },      // inferred or from input
      "childrenIds": [ ... ]   // copy as-is
    }
  }
}
Preserve Nested Structure
Nested Column objects must not be further processed or wrapped — copy them exactly as provided.

Automatically Infer Structural Props for Columns

rows: always 1

columns: number of direct Column children

cellWidths: array of numeric values summing to 100 (e.g., [50, 50], [75, 25])

Values must be numeric only (no % sign)

Can vary depending on layout (unequal widths allowed)

Apply Theme Defaults
Use the provided theme defaults if any style or prop is missing.

Schema Rules:

Component	Required Props Fields	Required Style Fields
Columns	rows (number), columns (number), cellWidths (number[])	columnGap, backgroundColor, borderStyle, borderColor, borderRadius

Note: Use numeric values only for rows, columns, and cellWidths. Do not use strings with %.

Theme Defaults:
${JSON.stringify(emailTheme, null, 2)}
`;

 const userMessage = `
Please convert the given JSON structure into the standardized email template format:


${JSON.stringify(column, null, 2)}

Instructions:
Wrap the structure in a new object with a generated unique ID using the format:
timestamp-randomString-performanceHash
(e.g., "m82rlyqq-i6vto-4y105g").

Only transform the top-level Columns component as:
{
  "type": "Columns",
  "data": {
    "style": { ... },
    "props": { ... },
    "childrens": [ /* original Column children untouched */ ]
  }
}

Keep Column and all nested children exactly as provided.

Assign:
rows: 1
columns: total number of direct Column children
cellWidths: an array of percentage numeric values summing to 100 (e.g., [50, 50], [75, 25]). Values can be unequal.

If style or props are missing, apply defaults from the provided theme.

Output must be raw JSON only — no extra text, commentary, or formatting.


`;

  const response = await callOpenAI(systemMessage, userMessage);
  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateColumnsProperties };