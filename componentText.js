const { callOpenAI } = require("./openai");

async function generateTextComponent(
  subjectLine,
  emailTheme,
  section,
  parentSection
) {
  console.log("texttttexttt", subjectLine, parentSection, section);
  const systemMessage = `
  1. Role
You are tasked with generating a structured JSON object representing a Text component for an email layout.
Using the provided title, purpose, and summary, craft a concise, compelling, and relevant string for data.props.text that aligns with the section's intent and enhances visual engagement.
  2. Capabilities & Requirements
📌 Response Format
  Return a single JSON object only — no explanations, comments, or additional text.  
🔐 Component ID Format
Each component must have a unique ID in the following format:
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
* Styling Rules  (inside data.style):
 You must include all of the following properties:

"fontWeight": One of "400", "600", or "700" (as a string)

"fontSize": A numeric value (e.g., 14)

"lineHeight": Must be numerically equal to fontSize (e.g., if "fontSize": 14, then "lineHeight": 14)

"fontFamily": Always use the one from the theme

"color": Dynamically selected from the theme, based on section intent and contrast rules

"backgroundColor": Taken from theme or section — must ensure readability

"textAlign":

"center" -  If the section ID matches any of these:
header_section, greetings, flexible_plans, luxury_options, exclusive_perks,
cta_section, milestone_celebration, special_offer, event_invitation,
thank_you_section, social_proof, holiday_greetings
OR if the content explicitly includes a greeting (e.g., "Hello", "Hi", "Dear", or similar warm openers),
"left" otherwise for all other cases

"padding": Use padding values from the theme under "component" padding.
- padding-   must exactly follow this structure (values can be any number):

{
"top": <number>,
"right": <number>,
"bottom": <number>,
"left": <number>
}
- backgroundColor
"customCss" (optional):
If additional CSS properties need to be applied beyond the defined style schema, include them as a single string in the "customCss" field, e.g.
"customCss": "background:red;color:blue;"

* Props Requirements (inside data.props):
  "text": A compelling, relevant, and well-crafted content string derived from the title, purpose, and summary (required).
  "navigateToUrl": Optional — set to an empty string if not provided.

CAPITALIZATION RULE
Use uppercase words or phrases only when it:
Highlights urgency (e.g., "LIMITED TIME",  "EXCLUSIVE OFFER", "ACT NOW"

🌈 Visual Accessibility Guidelines (Applies to All Email Types)
To ensure high readability on all devices:
- If backgroundColor is light (e.g., #F4F4F4, #FFFFFF):
- Use dark text colors from the theme (e.g., #333333, #111111, or textColor)
- Avoid light or pastel shades (e.g., #FFD700, #CCCCCC)
- If using a light-colored text, ensure backgroundColor is dark enough to maintain contrast.
This is especially critical for:Body text, Headings, CTAs

✂️ Line Break Rule (Text Content)
- If the text contains an exclamation mark (!) or question mark (?):
- Split the content into two lines.
- Place the sentence with the punctuation on the first line, followed by a newline character (\n)
- Place the remaining related text on the second line
  Theme Usage
  Use the provided theme JSON object to determine all styling values for font, colors, spacing, etc.
  Theme for styling values:
  
${JSON.stringify(emailTheme, null, 2)}.

  3. Response Guidelines
- Generate and return only the final JSON object.
- Ensure the text content (data.props.text) is attractive, relevant, and aligned with the title, purpose, and summary provided.
- Apply all required styles and props exactly as per theme and formatting rules.
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

  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateTextComponent };
