const { callOpenAI } = require("./openai");

async function generateTextComponent(
  subjectLine,
  emailTheme,
  section,
  parentSection
) {
  console.log("texttttexttt",subjectLine,  parentSection, section);
  const systemMessage = `
  1. Role
You are tasked with generating a structured JSON object representing a Text component for an email layout. Using the provided title, purpose, and summary, craft a concise, compelling, and relevant text string for the component's data.props.text. The text must align with the section's intent and be visually engaging.  
  2. Capabilities
  
  The response must be a single JSON object.
  
  Component ID Format:
  Each component must have a unique ID in the format:
  timestamp-randomString-performanceHash
  Example: "lzd45f-ab123-7x9fp"
  
  Component Structure:

  {
    "unique-id": {
      "type": "Text",
      "data": {
        "style": {
          // styling properties here
        },
        "props": {
          // content and optional fields here
        }
      }
    }
  }
  Styling Requirements (inside data.style):
  
  fontWeight: numeric string ("400", "600", "700").
  color: dynamically chosen from the theme based on section intent.
  fontSize and lineHeight: numeric values, where lineHeight === fontSize.lineHeight is always numerically equal to fontSize.  
  fontFamily: always from the theme.
  backgroundColor: from theme.


  Include these style properties:
  fontWeight, color, fontFamily, fontSize, lineHeight, textAlign, padding, backgroundColor
  
  Use "textAlign": "left" by default (unless otherwise specified).
If the section ID matches any of these:
header_section, greetings, flexible_plans, luxury_options, exclusive_perks, cta_section, milestone_celebration, special_offer, event_invitation, thank_you_section, social_proof, or holiday_greetings
— or if the content is a greeting —
then set "textAlign": "center";
otherwise, default to "textAlign": "left"
  
  Use padding values from the theme under "component" padding.
  
  Mandatory style properties:
- fontWeight
- color
- fontFamily
- fontSize
- lineHeight - always equal to fontSize
- textAlign
- padding-   must exactly follow this structure (values can be any number):

{
"top": <number>,
"right": <number>,
"bottom": <number>,
"left": <number>
}
- backgroundColor

  Props Requirements (inside data.props):
  
  "text": A compelling, relevant, and well-crafted content string derived from the title, purpose, and summary (required).
  
  "navigateToUrl": Optional — set to an empty string if not provided.
  | Section ID        | Suggested Style                                               |
| ----------------- | ------------------------------------------------------------- |
| "header_section"  | Bold, large text, "headingColor", size "24", weight "700   |
| "introduction"    | Neutral tone, "textColor", size "16", weight "400"         |
| "flexible_plans"  | Highlighted text, "secondaryColor", size "18", weight "600" |
| "luxury_options"  | Premium feel, "secondaryColor", size "18", weight "600"    |
| "exclusive_perks" | Elevated tone, "primaryColor", size "18", weight "600"      |
| "cta_section"     | Strong CTA, "primaryColor", size "24", weight "700"         |
| "testimonials"    | Soft tone, "textColor", size "16", weight "400"           |
| "conclusion"      | Wrapping tone, "textColor", size "16", weight "400"         |
| "email_footer"    | Low emphasis, "textColor", size "14", weight ""300"          |

Visual Accessibility Rule (Applies to All Email Types)
To ensure that your email content is readable and accessible across all devices and user settings, always maintain high contrast between text and background colors.

If the backgroundColor is light (e.g., #F4F4F4, #FFFFFF, or other pale tones), avoid using light-colored text such as #FFD700, #CCCCCC, or pastel shades.

Instead, choose a dark text color from the theme, such as #333333, #111111, or textColor to provide strong contrast and enhance readability.

Alternatively, you can adjust the backgroundColor to a darker tone if a light text color must be used, ensuring it still fits the email’s tone and design.

This rule is especially important for body text, headings, and CTAs, where clarity and legibility are critical.

Special Rule for Text Content:
If the generated text content includes an exclamation mark (!) or question mark (?), split the content into two lines:

Place the sentence containing the exclamation or question mark on the first line, followed by a newline character (\n),

Then place the remaining related text on the second line.
  Theme Usage
  Use the provided theme JSON object to determine all styling values for font, colors, spacing, etc.
  Theme for styling values:
  
${JSON.stringify(emailTheme, null, 2)}.

  3. Response Guidelines
  
  Generate and return only the final JSON object.
  
  Ensure the text content (data.props.text) is attractive, relevant, and aligned with the title, purpose, and summary provided.
  
  Apply all required styles and props exactly as per theme and formatting rules.
  
  Do not include any explanations, comments, or extra text outside the JSON.
`;

  const userMessage = `
Here’s the component definition. Please return a JSON object with the unique component ID as the key, and the component structure as the value. Use the theme provided in the system message to set styling.

${JSON.stringify(
  {
    id: section.id,
    title: section.title,
    purpose: section.purpose,
    summary: section.summary,
    type: section.componentType,
  },
  null,
  2
)}
`;

  const response = await callOpenAI(systemMessage, userMessage);
  console.log("text ress",response)
  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateTextComponent };
