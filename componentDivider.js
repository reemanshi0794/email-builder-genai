



const { callOpenAI } = require('./openai');

async function generateDividerComponent(emailTheme) {

const systemMessage = `You generate clean, valid JSON layout components based on user input and a shared theme. This message applies specifically to the Divider component.

RULES

Component ID:
- Must be a unique string in the format: timestamp-randomString-performanceHash  
  Example: lzd45f-ab123-7x9fp

STRUCTURE:
The component must include:

  type: "Divider"

  data.style:
    - padding: { top, right, bottom, left } (numbers only, no "px")
    - thickness (number, line height in pixels)
    - dividerColor (hex color value, from theme)
    - alignment ("left", "center", or "right")
      - orientation ("horizontal" or "vertical")

THEME USAGE:
- Use theme.padding.component or theme.padding.divider for padding.
- Use theme.dividerColor or theme.colors for dividerColor.
- Only apply backgroundColor if needed to create separation from surrounding sections.

STRICT EXCLUSIONS:
❌ Do NOT include data.props
❌ Do NOT include children, text, or labels
❌ Do NOT include "px" or other units — padding and thickness must be plain numbers
❌ customCss must be an empty string unless specifically required

CAPABILITIES:
- Determine when a horizontal or vertical divider is appropriate based on layout intent.
- Apply all design tokens and measurements using the provided theme.
- Ensure structure is compatible with layout engines that consume clean JSON components.

RESPONSE FORMAT:
Return only the final JSON object in this format:

{
  "uniqueId": {
    "type": "Divider",
    "data": {
      "style": {
        "padding": {
          "top": <number>,
          "right": <number>,
          "bottom": <number>,
          "left": <number>
        },
        "backgroundColor": "<hexColor or empty string>",
        "thickness": <number>,
        "dividerColor": "<hexColor>",
        "alignment": "<left | center | right>",
      }
    }
  }
}

Replace uniqueId with a real ID in the format timestamp-randomString-hash.

Use this Theme JSON for all styling decisions:
${JSON.stringify(emailTheme, null, 2)}

Divider is a visual separator only. Return a layout-safe JSON object with no extra or interactive content.`
;

const userMessage = `
Insert a divider to visually separate layout regions. Use "horizontal" orientation for full-width breaks between rows, and "vertical" for column-level or side-by-side section dividers. Follow theme-based padding (numbers only), dividerColor, and thickness. Set alignment based on layout flow. Return only the valid JSON object.
`;


  const response = await callOpenAI(systemMessage, userMessage);
  console.log("divider response",response)

  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error(`Failed to parse JSON from AI response:\n${response}\nError: ${error.message}`);
  }
}

module.exports = { generateDividerComponent };