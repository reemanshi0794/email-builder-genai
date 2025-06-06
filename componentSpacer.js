// const { callOpenAI } = require('./openai');

// async function generateSpacerComponent(emailTheme) {
//   const systemMessage = `
// You generate clean, valid JSON layout components based on user input and a shared theme. This message applies specifically to the Spacer component.
// RULES
// Component ID

// Must be a unique string in the format:
// timestamp-randomString-performanceHash
// Example: lzd45f-ab123-7x9fp

// Structure

// The component must only contain the following:

// type: "Spacer"

// data.style.padding (all four directions)

// Optional data.style.backgroundColor

// Theme Usage

// Use theme.padding.component for padding.

// Use theme.backgroundColor only if a visual break is needed between sections.

// Strict Exclusions

// ❌ Do NOT include data.props

// ❌ Do NOT include children, text, or any dynamic content

// CAPABILITIES
// Interpret layout intent from user input (e.g., summary, title) to determine if a Spacer is suitable as a visual separator.

// Consistently apply default design tokens like padding and background color using the provided theme.

// Ensure compatibility with the visual structure of email or content builders that consume these components.

// RESPONSE GUIDELINES
//  Return only the final JSON object in the following format:

// {
//   "uniqueId": {
//     "type": "Spacer",
//     "data": {
//       "style": {
//         "padding": {
//           "top": <number>,
//           "right": <number>,
//           "bottom": <number>,
//           "left": <number>
//         },
//         "backgroundColor": "<hexColor>" // optional
//       }
//     }
//   }
// }
// Replace uniqueId with a real ID matching the format: timestamp-randomString-hash.

// Use this Theme JSON for all styling decisions:
// ${JSON.stringify(emailTheme, null, 2)}.
//  The Spacer component is meant for visual separation or whitespace buffering — treat it as a layout-only component.
// ;
// `
//   const userMessage = `
// Please return a JSON object with the unique component ID as the key, and the component structure as the value. Use the theme provided in the system message to set styling.
// `;

//   const response = await callOpenAI(systemMessage, userMessage);
//   try {
//     return JSON.parse(response);
//   } catch (e) {
//     throw new Error(`Failed to parse JSON from AI response: ${response}`);
//   }
// }

// module.exports = { generateSpacerComponent };



const { callOpenAI } = require('./openai');

async function generateSpacerComponent(emailTheme) {
  const systemMessage = `
You generate clean, valid JSON layout components based on user input and a shared theme. This message applies specifically to the Spacer component.

RULES

Component ID:
- Must be a unique string in the format: timestamp-randomString-performanceHash
  Example: lzd45f-ab123-7x9fp

Structure:
- Only include:
  - type: "Spacer"
  - data.style.padding (top, right, bottom, left)
  - Optional: data.style.backgroundColor

Theme Usage:
- Use theme.padding.component for padding.
- Use theme.backgroundColor only if a visual break is needed between sections.

Strict Exclusions:
❌ Do NOT include data.props
❌ Do NOT include children, text, or any dynamic content

CAPABILITIES

- Interpret layout intent from user input (e.g., summary, title) to determine if a Spacer is suitable as a visual separator.
- Consistently apply default design tokens like padding and background color using the provided theme.
- Ensure compatibility with the visual structure of email or content builders that consume these components.

RESPONSE GUIDELINES

Return only the final JSON object in the following format:

{
  "uniqueId": {
    "type": "Spacer",
    "data": {
      "style": {
        "padding": {
          "top": <number>,
          "right": <number>,
          "bottom": <number>,
          "left": <number>
        },
        "backgroundColor": "<hexColor>" // optional
      }
    }
  }
}

- Replace uniqueId with a real ID matching the format: timestamp-randomString-hash.
- Use this Theme JSON for all styling decisions:

${JSON.stringify(emailTheme, null, 2)}

Reminder: The Spacer component is layout-only. Do not include any content or interactivity.
`;

  const userMessage = `
Insert a visual break between two dense sections. Use standard padding from the theme. Add a background color only if it enhances visual separation. Return only the valid JSON object as described.
  `;

  const response = await callOpenAI(systemMessage, userMessage);

  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error(`Failed to parse JSON from AI response:\n${response}\nError: ${error.message}`);
  }
}

module.exports = { generateSpacerComponent };
